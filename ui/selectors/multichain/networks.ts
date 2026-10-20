import {
  type MultichainNetworkControllerState as InternalMultichainNetworkState,
  type MultichainNetworkConfiguration as InternalMultichainNetworkConfiguration,
  toEvmCaipChainId,
  toMultichainNetworkConfiguration,
  ActiveNetworksByAddress,
} from '@metamask/multichain-network-controller';
import {
  NetworkStatus,
  type NetworkConfiguration as InternalNetworkConfiguration,
} from '@metamask/network-controller';
import { isEvmAccountType } from '@metamask/keyring-api';
import type { InternalAccount } from '@metamask/keyring-internal-api';
import type { NetworkType } from '@metamask/controller-utils';
import {
  type CaipChainId,
  type Hex,
  KnownCaipNamespace,
  parseCaipChainId,
} from '@metamask/utils';
import { createSelector } from 'reselect';
import {
  MULTICHAIN_PROVIDER_CONFIGS,
  type MultichainProviderConfig,
} from '../../../shared/constants/multichain/networks';
import { CHAIN_ID_TO_NETWORK_IMAGE_URL_MAP } from '../../../shared/constants/network';
import {
  type ProviderConfigState,
  type SelectedNetworkClientIdState,
  getProviderConfig,
  getNetworkConfigurationsByChainId,
  getCurrentChainId,
  MultichainNetworkConfigurationsByChainIdState,
  selectDefaultNetworkClientIdsByChainId,
  getNetworksMetadata,
} from '../../../shared/lib/selectors/networks';
import { createResultEqualSelector } from '../../../shared/lib/selectors/selector-creators';
import { getEnabledNetworks } from '../../../shared/lib/selectors/multichain';
import type { RemoteFeatureFlagsState } from '../../../shared/lib/selectors/remote-feature-flags';
import {
  type AccountsState,
  getMaybeSelectedInternalAccount,
} from '../../../shared/lib/selectors/accounts';

// Selector types

export type MultichainNetworkControllerState = {
  metamask: InternalMultichainNetworkState;
};

type SelectedNetworkChainIdState = {
  metamask: Pick<
    InternalMultichainNetworkState,
    'selectedMultichainNetworkChainId'
  >;
};

type IsEvmSelectedState = {
  metamask: Pick<InternalMultichainNetworkState, 'isEvmSelected'>;
};

type NetworksWithTransactionActivityByAccountsState = {
  metamask: {
    networksWithTransactionActivity: ActiveNetworksByAddress;
  };
};

/**
 * This type takes into account the state
 * of the multichain-network-controller and
 * the network-controller.
 */
export type MultichainNetworkConfigState =
  MultichainNetworkConfigurationsByChainIdState &
    SelectedNetworkChainIdState &
    IsEvmSelectedState &
    SelectedNetworkClientIdState &
    ProviderConfigState &
    NetworksWithTransactionActivityByAccountsState &
    RemoteFeatureFlagsState &
    AccountsState;
export const getIsNonEvmNetworksEnabled = (_state: unknown) => ({
  bitcoinEnabled: false,
  solanaEnabled: false,
  tronEnabled: false,
  stellarEnabled: false,
});
const EMPTY_NON_EVM_NETWORKS: Record<
  CaipChainId,
  InternalMultichainNetworkConfiguration
> = {};
export const getNonEvmMultichainNetworkConfigurationsByChainId = (
  _state: unknown,
) => EMPTY_NON_EVM_NETWORKS;

/**
 * Returns all EVM networks converted to multichain network configuration format.
 * This selector provides stable references when the underlying data hasn't changed.
 */
export const getEvmMultichainNetworkConfigurations = createSelector(
  getNetworkConfigurationsByChainId,
  (
    networkConfigurationsByChainId,
  ): Record<CaipChainId, InternalMultichainNetworkConfiguration> => {
    // There's a fallback for EVM network names/nicknames, in case the network
    // does not have a name/nickname the fallback is the first rpc endpoint url.
    // TODO: Update toMultichainNetworkConfigurationsByChainId to handle this case.
    const evmNetworks: Record<
      CaipChainId,
      InternalMultichainNetworkConfiguration
    > = {};

    for (const [, network] of Object.entries(networkConfigurationsByChainId)) {
      evmNetworks[toEvmCaipChainId(network.chainId)] = {
        ...toMultichainNetworkConfiguration(network),
        name:
          network.name ||
          network.rpcEndpoints[network.defaultRpcEndpointIndex].url,
      };
    }

    return evmNetworks;
  },
);

/**
 * Returns all multichain network configurations (both EVM and non-EVM) by chain ID.
 * This selector provides stable references when the underlying data hasn't changed.
 */
export const getAllMultichainNetworkConfigurations = createSelector(
  getNonEvmMultichainNetworkConfigurationsByChainId,
  getEvmMultichainNetworkConfigurations,
  (
    nonEvmNetworkConfigurationsByChainId,
    evmNetworks,
  ): Record<CaipChainId, InternalMultichainNetworkConfiguration> => {
    return {
      ...nonEvmNetworkConfigurationsByChainId,
      ...evmNetworks,
    };
  },
);

/**
 * Returns a tuple of [multichain networks, EVM network configurations].
 * This selector provides stable references when the underlying data hasn't changed.
 *
 * @deprecated Prefer using `getAllMultichainNetworkConfigurations` for multichain networks
 * or `getNetworkConfigurationsByChainId` for EVM-only networks directly.
 */
export const getMultichainNetworkConfigurationsByChainId =
  createResultEqualSelector(
    getAllMultichainNetworkConfigurations,
    getNetworkConfigurationsByChainId,
    (
      networks,
      networkConfigurationsByChainId,
    ): [
      Record<CaipChainId, InternalMultichainNetworkConfiguration>,
      Record<Hex, InternalNetworkConfiguration>,
    ] => [networks, networkConfigurationsByChainId],
  );
export const getIsEvmMultichainNetworkSelected = (_state: IsEvmSelectedState) =>
  true;

export const getSelectedMultichainNetworkChainId = (
  state: MultichainNetworkConfigState,
) => {
  const isEvmSelected = getIsEvmMultichainNetworkSelected(state);

  if (isEvmSelected) {
    const evmNetworkConfig = getProviderConfig(state);
    return toEvmCaipChainId(evmNetworkConfig.chainId);
  }
  return state.metamask.selectedMultichainNetworkChainId;
};

export const getSelectedMultichainNetworkConfiguration = createSelector(
  getSelectedMultichainNetworkChainId,
  getAllMultichainNetworkConfigurations,
  (chainId, networkConfigurationsByChainId) => {
    return networkConfigurationsByChainId[chainId];
  },
);

export const getEnabledNetworksByNamespace = createSelector(
  getEnabledNetworks,
  getSelectedMultichainNetworkChainId,
  (enabledNetworkMap, currentMultichainChainId) => {
    const { namespace } = parseCaipChainId(currentMultichainChainId);
    const namespaceMap = enabledNetworkMap[namespace] ?? {};

    return Object.fromEntries(
      Object.entries(namespaceMap).filter(([, enabled]) => enabled === true),
    );
  },
);

export const getAllEnabledNetworksForAllNamespaces = createSelector(
  getEnabledNetworks,
  (enabledNetworkMap) =>
    Object.values(enabledNetworkMap).flatMap((namespaceNetworks) =>
      Object.entries(namespaceNetworks)
        .filter(([, enabled]) => enabled)
        .map(([chainId]) => chainId),
    ),
);

export const selectEnabledNetworksAsCaipChainIds = createSelector(
  getEnabledNetworks,
  (enabledNetworkMap): CaipChainId[] =>
    Object.entries(enabledNetworkMap)
      .flatMap(([namespace, namespaceNetworks]) =>
        Object.entries(namespaceNetworks)
          .filter(([, enabled]) => enabled)
          .map(([chainId]) =>
            namespace === KnownCaipNamespace.Eip155
              ? toEvmCaipChainId(chainId as Hex)
              : (chainId as CaipChainId),
          ),
      )
      .sort(),
);

export const selectNonEvmChainIds = createSelector(
  getEnabledNetworks,
  (enabledNetworkMap) =>
    Object.entries(enabledNetworkMap)
      .filter(([namespace]) => namespace !== 'eip155')
      .flatMap(([, chains]) =>
        Object.entries(chains)
          .filter(([, enabled]) => enabled)
          .map(([id]) => id),
      ),
);

export const getEnabledChainIds = createSelector(
  getNetworkConfigurationsByChainId,
  getEnabledNetworks,
  getSelectedMultichainNetworkChainId,
  (networkConfigurations, enabledNetworks, currentMultichainChainId) => {
    const { namespace } = parseCaipChainId(currentMultichainChainId);

    // Get enabled networks for the current namespace
    const networksForNamespace = enabledNetworks[namespace] || {};

    return Object.keys(networkConfigurations).filter(
      (chainId) => networksForNamespace[chainId],
    );
  },
);

export const getEnabledNetworkClientIds = createSelector(
  getNetworkConfigurationsByChainId,
  getEnabledNetworks,
  getSelectedMultichainNetworkChainId,
  (networkConfigurations, enabledNetworks, currentMultichainChainId) => {
    const { namespace } = parseCaipChainId(currentMultichainChainId);

    // Get enabled networks for the current namespace
    const networksForNamespace = enabledNetworks[namespace as string] || {};

    return Object.entries(networkConfigurations).reduce(
      (acc, [chainId, network]) => {
        if (networksForNamespace[chainId]) {
          acc.push(
            network.rpcEndpoints[network.defaultRpcEndpointIndex]
              .networkClientId,
          );
        }
        return acc;
      },
      [] as string[],
    );
  },
);

export const selectAnyEnabledNetworksAreAvailable = createSelector(
  getEnabledNetworks,
  selectDefaultNetworkClientIdsByChainId,
  getNetworksMetadata,
  (allEnabledNetworks, defaultNetworkClientIdsByChainId, networksMetadata) => {
    return Object.entries(allEnabledNetworks).reduce<boolean>(
      (result, [namespace, enabledNetworksByChainId]) => {
        if (namespace === KnownCaipNamespace.Eip155) {
          const chainIds = Object.entries(enabledNetworksByChainId)
            .filter(([_chainId, isEnabled]) => isEnabled)
            .map(([chainId, _isEnabled]) => chainId) as Hex[];
          const networkClientIds = chainIds.map(
            (chainId) => defaultNetworkClientIdsByChainId[chainId],
          );
          return (
            // If only non-EVM networks are enabled, then we may still
            // have an entry for EIP-155 but it will be empty
            networkClientIds.length === 0 ||
            networkClientIds.some(
              (networkClientId) =>
                networksMetadata[networkClientId]?.status ===
                NetworkStatus.Available,
            )
          );
        }
        // Assume that all non-EVM networks are available
        return result;
      },
      true,
    );
  },
);
// TODO: Remove after updating to @metamask/network-controller 20.0.0
type ProviderConfigWithImageUrlAndExplorerUrl = {
  rpcUrl?: string;
  type: NetworkType;
  chainId: Hex;
  ticker: string;
  nickname?: string;
  id?: string;
} & {
  rpcPrefs?: { blockExplorerUrl?: string; imageUrl?: string };
};

export type MultichainNetwork = {
  nickname: string;
  isEvmNetwork: boolean;
  chainId: CaipChainId;
  // TODO: Maybe updates ProviderConfig to add rpcPrefs.imageUrl field
  network: ProviderConfigWithImageUrlAndExplorerUrl | MultichainProviderConfig;
};

const MULTICHAIN_NETWORK_PROVIDERS: MultichainProviderConfig[] = Object.values(
  MULTICHAIN_PROVIDER_CONFIGS,
);

// FIXME: All the following might have side-effect, like if the current account is a bitcoin one and that
// a popup (for ethereum related stuffs) is being shown (and uses this function), then the native
// currency will be BTC..

export function getMultichainIsEvm(
  state: MultichainNetworkConfigState &
    AccountsState & { metamask: { completedOnboarding?: boolean } },
  account?: InternalAccount,
) {
  const isOnboarded = state.metamask.completedOnboarding;
  // Selected account is not available during onboarding (this is used in
  // the AppHeader)
  const selectedAccount = account ?? getMaybeSelectedInternalAccount(state);

  // There are no selected account during onboarding. we default to the original EVM behavior.
  return (
    !isOnboarded || !selectedAccount || isEvmAccountType(selectedAccount.type)
  );
}
export const getMultichainNetwork = createSelector(
  [
    getCurrentChainId,
    getProviderConfig,
    getNetworkConfigurationsByChainId,
    (
      _state: MultichainNetworkConfigState & AccountsState,
      _account?: InternalAccount,
    ) => undefined,
  ],
  (evmChainId, evmProviderConfig, networkConfigurations): MultichainNetwork => {
    const network = {
      ...evmProviderConfig,
    } as ProviderConfigWithImageUrlAndExplorerUrl;
    network.rpcPrefs = {
      ...network.rpcPrefs,
      imageUrl:
        CHAIN_ID_TO_NETWORK_IMAGE_URL_MAP[
          evmChainId as keyof typeof CHAIN_ID_TO_NETWORK_IMAGE_URL_MAP
        ],
    };
    return {
      nickname: networkConfigurations[evmChainId]?.name ?? network.rpcUrl,
      isEvmNetwork: true,
      chainId: toEvmCaipChainId(evmChainId),
      network,
    };
  },
);
