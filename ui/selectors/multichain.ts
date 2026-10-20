import type {
  MultichainAssetsControllerState,
  MultichainAssetsRatesControllerState,
  MultichainBalancesControllerState,
  RatesControllerState,
} from '@metamask/assets-controllers';
import { InternalAccount } from '@metamask/keyring-internal-api';

import { NetworkConfiguration } from '@metamask/network-controller';
import { CaipChainId, Hex, isCaipChainId } from '@metamask/utils';
import PropTypes from 'prop-types';
import { createSelector } from 'reselect';
import { MULTICHAIN_TOKEN_IMAGE_MAP } from '../../shared/constants/multichain/networks';
import { Numeric } from '../../shared/lib/Numeric';
import { isEvmChainId } from '../../shared/lib/asset-utils';
import { convertCaipToHexChainId } from '../../shared/lib/network.utils';
import {
  getMultiChainBalancesControllerBalances,
  getRatesControllerRates,
} from '../../shared/lib/selectors/assets-migration';
import {
  getCurrentCurrency,
  getNativeCurrency,
} from '../ducks/metamask/metamask';
import { getConversionRate } from '../ducks/metamask/base-selectors';
import {
  CHAIN_ID_TO_NETWORK_IMAGE_URL_MAP,
  CHAIN_IDS,
  TEST_NETWORK_IDS,
} from '../../shared/constants/network';
import {
  getNetworkConfigurationsByChainId,
  getProviderConfig,
  NetworkState,
} from '../../shared/lib/selectors/networks';
import { createDeepEqualSelector } from '../../shared/lib/selectors/selector-creators';
import { type AccountsState } from '../../shared/lib/selectors/accounts';
import {
  getIsMainnet,
  getNativeCurrencyImage,
  getSelectedAccountCachedBalance,
  getShouldShowFiat,
} from './selectors';
import {
  type MultichainNetworkConfigState,
  getMultichainNetwork,
  getMultichainIsEvm,
} from './multichain/networks';

// TODO: Update all references to use networks.ts
export { getMultichainNetwork, getMultichainIsEvm };

export type AssetsState = {
  metamask: MultichainAssetsControllerState;
};

export type AssetsRatesState = {
  metamask: MultichainAssetsRatesControllerState;
};

export type RatesState = {
  metamask: RatesControllerState;
};

type BalancesState = {
  metamask: MultichainBalancesControllerState;
};

export type MultichainState = AccountsState &
  RatesState &
  BalancesState &
  NetworkState &
  AssetsRatesState &
  AssetsState &
  MultichainNetworkConfigState;

export const MultichainNetworkPropType = PropTypes.shape({
  nickname: PropTypes.string.isRequired,
  isEvmNetwork: PropTypes.bool.isRequired,
  chainId: PropTypes.string,
  network: PropTypes.oneOfType([
    PropTypes.shape({
      rpcUrl: PropTypes.string,
      type: PropTypes.string.isRequired,
      chainId: PropTypes.string.isRequired,
      ticker: PropTypes.string.isRequired,
      rpcPrefs: PropTypes.shape({
        blockExplorerUrl: PropTypes.string,
        imageUrl: PropTypes.string,
      }),
      nickname: PropTypes.string,
      id: PropTypes.string,
    }),
    PropTypes.shape({
      chainId: PropTypes.string.isRequired,
      ticker: PropTypes.string.isRequired,
      rpcPrefs: PropTypes.shape({
        blockExplorerUrl: PropTypes.string,
        imageUrl: PropTypes.string,
      }),
    }),
  ]).isRequired,
});

export const InternalAccountPropType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired,
  metadata: PropTypes.shape({
    name: PropTypes.string.isRequired,
    snap: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string,
      enabled: PropTypes.bool,
    }),
    keyring: PropTypes.shape({
      type: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  type: PropTypes.string.isRequired,
});

export const getMultichainDefaultToken = createSelector(
  [
    (state: MultichainState, account?: InternalAccount) =>
      getMultichainIsEvm(state, account),
    (state: MultichainState, account?: InternalAccount) =>
      getMultichainIsEvm(state, account)
        ? getProviderConfig(state).ticker
        : undefined,
    (state: MultichainState, account?: InternalAccount) =>
      getMultichainProviderConfig(state, account).ticker,
  ],
  (isEvm, evmTicker, multichainTicker) => ({
    symbol: isEvm ? (evmTicker ?? 'ETH') : multichainTicker,
  }),
);

/**
 * Retrieves the provider configuration for a multichain network.
 *
 * This function extracts the `network` field from the result of `getMultichainNetwork(state)`,
 * which is expected to be a `MultichainProviderConfig` object. The naming might suggest that
 * it returns a network, but it actually returns a provider configuration specific to a multichain setup.
 *
 * @param state - The redux state.
 * @param account - The multichain account.
 * @returns The current multichain provider configuration.
 */
export function getMultichainProviderConfig(
  state: MultichainState,
  account?: InternalAccount,
) {
  return getMultichainNetwork(state, account).network;
}

export function getMultichainCurrentNetwork(
  state: MultichainState,
  account?: InternalAccount,
) {
  return getMultichainProviderConfig(state, account);
}
export function getMultichainNativeCurrency(
  state: MultichainState,
  _account?: InternalAccount,
) {
  return getNativeCurrency(state);
}

export { getCurrentCurrency as getMultichainCurrentCurrency };
export function getMultichainCurrencyImage(
  state: MultichainState,
  _account?: InternalAccount,
) {
  return getNativeCurrencyImage(state);
}
export const makeGetMultichainShouldShowFiatByChainId =
  (chainId: Hex | CaipChainId) =>
  (state: MultichainState, account?: InternalAccount) =>
    getMultichainShouldShowFiat(state, account, chainId);
export function getMultichainShouldShowFiat(
  state: MultichainState,
  _account?: InternalAccount,
  chainId?: Hex | CaipChainId,
) {
  return getShouldShowFiat(state, chainId);
}

export function getMultichainCurrentChainId(state: MultichainState) {
  const { chainId } = getMultichainProviderConfig(state);
  return chainId;
}

export function isChainIdMainnet(chainId: string) {
  return chainId === CHAIN_IDS.MAINNET;
}
export function getMultichainIsMainnet(
  state: MultichainState,
  _account?: InternalAccount,
) {
  return getIsMainnet(state);
}
export function getMultichainIsTestnet(
  state: MultichainState,
  _account?: InternalAccount,
) {
  return (TEST_NETWORK_IDS as string[]).includes(
    getProviderConfig(state).chainId,
  );
}

// TODO: Update all references to use asset-migration.ts
export { getMultiChainBalancesControllerBalances as getMultichainBalances };

export { getRatesControllerRates as getMultichainCoinRates };

export function getImageForChainId(chainId: string): string | undefined {
  const imageMap: Record<string, string> = {
    ...CHAIN_ID_TO_NETWORK_IMAGE_URL_MAP,
    ...MULTICHAIN_TOKEN_IMAGE_MAP,
  };

  const directMatch = imageMap[chainId];
  if (directMatch) {
    return directMatch;
  }

  if (isCaipChainId(chainId) && isEvmChainId(chainId)) {
    return imageMap[convertCaipToHexChainId(chainId)];
  }

  return undefined;
}
export function getMultichainSelectedAccountCachedBalance(
  state: MultichainState,
) {
  return getSelectedAccountCachedBalance(state);
}

export const getMultichainSelectedAccountCachedBalanceIsZero = createSelector(
  [getMultichainIsEvm, getMultichainSelectedAccountCachedBalance],
  (isEvm, balance) => {
    const base = isEvm ? 16 : 10;
    const numericBalance = new Numeric(balance, base);
    return numericBalance.isZero();
  },
);
export function getMultichainConversionRate(
  state: MultichainState,
  _account?: InternalAccount,
) {
  const rate = getConversionRate(
    state as Parameters<typeof getConversionRate>[0],
  );
  return rate === null || rate === undefined ? undefined : Number(rate);
}
export const getMultichainNetworkConfigurationsByChainId =
  createDeepEqualSelector(
    [getNetworkConfigurationsByChainId],
    (networks): Record<Hex | CaipChainId, NetworkConfiguration> => ({
      ...networks,
    }),
  );
