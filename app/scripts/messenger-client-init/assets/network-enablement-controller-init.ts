import {
  NetworkEnablementController,
  NetworkEnablementControllerState,
  NetworkEnablementControllerMessenger,
} from '@metamask/network-enablement-controller';
import { selectEvmAutoEnabledNetworksChainIds } from '@metamask/config-registry-controller';
import { NetworkState } from '@metamask/network-controller';
import { toEvmCaipChainId } from '@metamask/multichain-network-controller';
import { Hex, KnownCaipNamespace } from '@metamask/utils';
import { NetworkEnablementControllerInitMessenger } from '../messengers/assets';
import { MessengerClientInitFunction } from '../types';
import { CHAIN_IDS } from '../../../../shared/constants/network';

/**
 * Generates a map of EVM chain IDs to their enabled status based on NetworkController state.
 *
 * @param networkConfigurationsByChainId - The network configurations from NetworkController
 * @param enabledChainIds - Array of chain IDs that should be enabled
 * @returns Record mapping chain IDs to boolean enabled status
 */
const generateEVMNetworkMap = (
  networkConfigurationsByChainId: NetworkState['networkConfigurationsByChainId'],
  enabledChainIds: string[],
): Record<KnownCaipNamespace.Eip155, Record<Hex, boolean>> => {
  const networkMap: Record<KnownCaipNamespace.Eip155, Record<Hex, boolean>> = {
    [KnownCaipNamespace.Eip155]: {},
  };

  (Object.keys(networkConfigurationsByChainId) as Hex[]).forEach((chainId) => {
    networkMap[KnownCaipNamespace.Eip155][chainId] =
      enabledChainIds.includes(chainId);
  });

  return networkMap;
};
const generateDefaultNetworkEnablementControllerState = (
  networkControllerState: NetworkState,
): NetworkEnablementControllerState => ({
  enabledNetworkMap: generateEVMNetworkMap(
    networkControllerState.networkConfigurationsByChainId,
    process.env.IN_TEST ? [CHAIN_IDS.LOCALHOST] : [],
  ),
  nativeAssetIdentifiers: {},
});

const AUTO_ENABLE_TIMEOUT_MS = 30_000;

function cloneEnabledNetworkMap(
  enabledNetworkMap: NetworkEnablementControllerState['enabledNetworkMap'],
): NetworkEnablementControllerState['enabledNetworkMap'] {
  return Object.fromEntries(
    Object.entries(enabledNetworkMap).map(([namespace, networks]) => [
      namespace,
      { ...networks },
    ]),
  ) as NetworkEnablementControllerState['enabledNetworkMap'];
}

export const NetworkEnablementControllerInit: MessengerClientInitFunction<
  NetworkEnablementController,
  NetworkEnablementControllerMessenger,
  NetworkEnablementControllerInitMessenger
> = ({ controllerMessenger, persistedState, getMessengerClient }) => {
  const networkControllerState = getMessengerClient('NetworkController').state;

  const messengerClient = new NetworkEnablementController({
    messenger: controllerMessenger,
    state: {
      ...generateDefaultNetworkEnablementControllerState(
        networkControllerState,
      ),
      ...persistedState.NetworkEnablementController,
    },
  });

  if (
    !process.env.IN_TEST &&
    !persistedState.NetworkEnablementController?.enabledNetworkMap
  ) {
    messengerClient.enableAllPopularNetworks();
  }

  controllerMessenger.subscribe(
    'NetworkController:networkAdded',
    async ({ chainId }) => {
      let timeoutId: ReturnType<typeof setTimeout> | undefined;
      try {
        const autoEnabledNetworkChainIds = selectEvmAutoEnabledNetworksChainIds(
          controllerMessenger.call('ConfigRegistryController:getState'),
        );

        if (!autoEnabledNetworkChainIds.includes(toEvmCaipChainId(chainId))) {
          return;
        }

        const previousEnabledNetworkMap = cloneEnabledNetworkMap(
          messengerClient.state.enabledNetworkMap,
        );

        await Promise.race([
          controllerMessenger.waitUntil(
            'NetworkEnablementController:stateChange',
            {
              condition: (state) =>
                state.enabledNetworkMap.eip155?.[chainId] === true,
            },
          ),
          new Promise<never>((_resolve, reject) => {
            timeoutId = setTimeout(
              () =>
                reject(
                  new Error(`Timed out waiting for ${chainId} to be enabled`),
                ),
              AUTO_ENABLE_TIMEOUT_MS,
            );
          }),
        ]);
        messengerClient.restoreEnabledNetworkMap(previousEnabledNetworkMap);
      } catch (error) {
        controllerMessenger.captureException?.(
          error instanceof Error ? error : new Error(String(error)),
        );
      } finally {
        clearTimeout(timeoutId);
      }
    },
  );

  // Initialize native asset identifiers from network configurations.
  // This reads from NetworkController and MultichainNetworkController to populate
  // the nativeAssetIdentifiers state with CAIP-19-like identifiers for each network.
  // We intentionally don't await this - it will complete in the background.
  messengerClient.init();

  return {
    messengerClient,
  };
};
