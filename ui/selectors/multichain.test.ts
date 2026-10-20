import { Cryptocurrency } from '@metamask/assets-controllers';
import { Hex } from '@metamask/utils';
import { BtcScope } from '@metamask/keyring-api';
import { AVAILABLE_MULTICHAIN_NETWORK_CONFIGURATIONS } from '@metamask/multichain-network-controller';
import * as metamaskBaseSelectors from '../ducks/metamask/base-selectors';
import {
  getCurrentCurrency,
  getNativeCurrency,
} from '../ducks/metamask/metamask';
import {
  MOCK_ACCOUNTS,
  MOCK_ACCOUNT_EOA,
  MOCK_ACCOUNT_BIP122_P2WPKH,
  MOCK_ACCOUNT_BIP122_P2WPKH_TESTNET,
  MOCK_ACCOUNT_TRON_MAINNET,
  MOCK_ACCOUNT_TRON_NILE,
  MOCK_ACCOUNT_TRON_SHASTA,
  MOCK_ACCOUNT_STELLAR_PUBNET,
  MOCK_ACCOUNT_ID_BY_ADDRESS,
} from '../../test/data/mock-accounts';
import {
  CHAIN_IDS,
  ETH_TOKEN_IMAGE_URL,
  MAINNET_DISPLAY_NAME,
} from '../../shared/constants/network';
import { MultichainNativeAssets } from '../../shared/constants/multichain/assets';
import { mockNetworkState } from '../../test/stub/networks';
import { getProviderConfig } from '../../shared/lib/selectors/networks';
import type { MetaMaskReduxState } from '../store/store';
import { AccountsState } from '../../shared/lib/selectors/accounts';
import {
  MultichainState,
  getMultichainCurrentChainId,
  getMultichainCurrentCurrency,
  getMultichainDefaultToken,
  getMultichainIsEvm,
  getMultichainIsMainnet,
  getMultichainNativeCurrency,
  getMultichainNetwork,
  getMultichainProviderConfig,
  getMultichainSelectedAccountCachedBalance,
  getMultichainShouldShowFiat,
  getMultichainSelectedAccountCachedBalanceIsZero,
  getMultichainIsTestnet,
  getMultichainNetworkConfigurationsByChainId,
  getMultichainCurrencyImage,
  isChainIdMainnet,
  getImageForChainId,
  getMultichainConversionRate,
  makeGetMultichainShouldShowFiatByChainId,
} from './multichain';
import {
  getNativeCurrencyImage,
  getSelectedAccountCachedBalance,
  getShouldShowFiat,
} from '.';

type TestState = MultichainState &
  AccountsState & {
    metamask: Pick<
      MetaMaskReduxState['metamask'],
      | 'preferences'
      | 'accountsByChainId'
      | 'networkConfigurationsByChainId'
      | 'currentCurrency'
      | 'currencyRates'
      | 'completedOnboarding'
      | 'selectedNetworkClientId'
      | 'remoteFeatureFlags'
    >;
  };

function getEvmState(chainId: Hex = CHAIN_IDS.MAINNET): TestState {
  return {
    metamask: {
      preferences: {
        showFiatInTestnets: false,
      } as MetaMaskReduxState['metamask']['preferences'],
      ...mockNetworkState({ chainId }),
      currentCurrency: 'ETH',
      currencyRates: {
        ETH: {
          conversionRate: null,
          conversionDate: null,
          usdConversionRate: null,
        },
      },
      completedOnboarding: true,
      internalAccounts: {
        selectedAccount: MOCK_ACCOUNT_EOA.id,
        accounts: MOCK_ACCOUNTS,
      },
      accountIdByAddress: MOCK_ACCOUNT_ID_BY_ADDRESS,
      accountsByChainId: {
        '0x1': {
          [MOCK_ACCOUNT_EOA.address]: {
            balance: '3',
          },
        },
      },
      balances: {
        [MOCK_ACCOUNT_BIP122_P2WPKH.id]: {
          [MultichainNativeAssets.BITCOIN]: {
            amount: '1.00000000',
            unit: 'BTC',
          },
        },
        [MOCK_ACCOUNT_BIP122_P2WPKH_TESTNET.id]: {
          [MultichainNativeAssets.BITCOIN_TESTNET]: {
            amount: '2.00000000',
            unit: 'BTC',
          },
        },
        [MOCK_ACCOUNT_TRON_MAINNET.id]: {
          [MultichainNativeAssets.TRON]: {
            amount: '100.000000',
            unit: 'TRX',
          },
        },
        [MOCK_ACCOUNT_TRON_NILE.id]: {
          [MultichainNativeAssets.TRON_NILE]: {
            amount: '200.000000',
            unit: 'TRX',
          },
        },
        [MOCK_ACCOUNT_TRON_SHASTA.id]: {
          [MultichainNativeAssets.TRON_SHASTA]: {
            amount: '150.000000',
            unit: 'TRX',
          },
        },
        [MOCK_ACCOUNT_STELLAR_PUBNET.id]: {
          [MultichainNativeAssets.STELLAR]: {
            amount: '42.0000000',
            unit: 'XLM',
          },
        },
      },
      fiatCurrency: 'usd',
      cryptocurrencies: [Cryptocurrency.Btc],
      rates: {
        btc: {
          conversionDate: 0,
          conversionRate: 100000,
        },
        trx: {
          conversionDate: 0,
          conversionRate: 0.08,
        },
      },
      conversionRates: {},
      historicalPrices: {},
      assetsMetadata: {},
      accountsAssets: {},
      allIgnoredAssets: {},
      isEvmSelected: false,
      multichainNetworkConfigurationsByChainId: {
        ...AVAILABLE_MULTICHAIN_NETWORK_CONFIGURATIONS,
      },
      selectedMultichainNetworkChainId: BtcScope.Mainnet,
      networksWithTransactionActivity: {},
      remoteFeatureFlags: {},
    },
  };
}

describe('Multichain Selectors', () => {
  describe('getMultichainNetwork', () => {
    it('returns an EVM network provider if account is EVM', () => {
      const state = getEvmState();

      const network = getMultichainNetwork(state);
      expect(network.isEvmNetwork).toBe(true);
    });

    it('returns an EVM network provider if user is not onboarded', () => {
      const state = getEvmState();
      state.metamask.completedOnboarding = false;
      state.metamask.internalAccounts.selectedAccount = '';

      const network = getMultichainNetwork(state);
      expect(network.isEvmNetwork).toBe(true);
    });

    it('returns a EVM network with the correct network image', () => {
      const state = getEvmState();

      const network = getMultichainNetwork(state);
      expect(network.network.rpcPrefs?.imageUrl).toBe(ETH_TOKEN_IMAGE_URL);
    });

    it('returns a nickname for default networks', () => {
      const state = getEvmState();

      const network = getMultichainNetwork(state);
      expect(network.nickname).toBe(MAINNET_DISPLAY_NAME);
    });

    it('returns rpcUrl as its nickname if its not defined', () => {
      const mockNetworkRpc = 'https://mock-rpc.com';
      const mockNetwork = {
        ticker: 'MOCK',
        chainId: '0x123123123',
        rpcUrl: mockNetworkRpc,
        // `nickname` is undefined here
      } as const;

      const state = {
        ...getEvmState(),
        metamask: {
          ...getEvmState().metamask,
          ...mockNetworkState(mockNetwork),
        },
      };

      const network = getMultichainNetwork(state);
      expect(network.nickname).toBe(network.network.rpcUrl);
      expect(network.nickname).toBe(mockNetworkRpc);
    });
  });

  describe('getMultichainIsEvm', () => {
    it('returns true if selected account is EVM compatible', () => {
      const state = getEvmState();

      expect(getMultichainIsEvm(state)).toBe(true);
    });
  });

  describe('getMultichain{ProviderConfig,CurrentNetwork}', () => {
    it('returns a ProviderConfig if account is EVM', () => {
      const state = getEvmState();

      const evmMainnetNetwork = getProviderConfig(state);
      const multichainProviderConfig = getMultichainProviderConfig(state);
      delete multichainProviderConfig?.rpcPrefs?.imageUrl;
      expect(multichainProviderConfig).toStrictEqual(evmMainnetNetwork);
    });
  });

  describe('getMultichainNativeCurrency', () => {
    it('returns same native currency if account is EVM', () => {
      const state = getEvmState();

      expect(getMultichainNativeCurrency(state)).toBe(getNativeCurrency(state));
    });
  });

  describe('getMultichainCurrentCurrency', () => {
    it('returns same currency currency if account is EVM', () => {
      const state = getEvmState();

      expect(getMultichainCurrentCurrency(state)).toBe(
        getCurrentCurrency(state),
      );
    });

    // @ts-expect-error This is missing from the Mocha type definitions
    it.each(['usd', 'ETH'])(
      "returns current currency '%s' if account is EVM",
      (currency: string) => {
        const state = getEvmState();

        state.metamask.currentCurrency = currency;
        expect(getCurrentCurrency(state)).toBe(currency);
        expect(getMultichainCurrentCurrency(state)).toBe(currency);
      },
    );
  });

  describe('getMultichainShouldShowFiat', () => {
    it('returns same value as getShouldShowFiat if account is EVM', () => {
      const state = getEvmState();

      expect(getMultichainShouldShowFiat(state)).toBe(getShouldShowFiat(state));
    });

    it('delegates to getShouldShowFiat with chainId when account is EVM', () => {
      const state = getEvmState();
      expect(
        getMultichainShouldShowFiat(state, undefined, CHAIN_IDS.MAINNET),
      ).toBe(getShouldShowFiat(state, CHAIN_IDS.MAINNET));
    });
  });

  describe('getMultichainDefaultToken', () => {
    it('returns ETH if account is EVM', () => {
      const state = getEvmState();

      expect(getMultichainDefaultToken(state)).toEqual({
        symbol: 'ETH',
      });
    });
  });

  describe('getMultichainCurrentChainId', () => {
    it('returns current chain ID if account is EVM (mainnet)', () => {
      const state = getEvmState();

      expect(getMultichainCurrentChainId(state)).toEqual(CHAIN_IDS.MAINNET);
    });

    it('returns current chain ID if account is EVM (other)', () => {
      const state = getEvmState(CHAIN_IDS.SEPOLIA);
      expect(getMultichainCurrentChainId(state)).toEqual(CHAIN_IDS.SEPOLIA);
    });

    // No test for testnet with non-EVM for now, as we only support mainnet network providers!
  });

  describe('getMultichainIsMainnet', () => {
    it('returns true if account is EVM (mainnet)', () => {
      const state = getEvmState();

      expect(getMultichainIsMainnet(state)).toBe(true);
    });

    it('returns false if account is EVM (testnet)', () => {
      const state = getEvmState(CHAIN_IDS.SEPOLIA);
      expect(getMultichainIsMainnet(state)).toBe(false);
    });
  });

  describe('getMultichainIsTestnet', () => {
    it('returns false if account is EVM (mainnet)', () => {
      const state = getEvmState();

      expect(getMultichainIsTestnet(state)).toBe(false);
    });

    // @ts-expect-error This is missing from the Mocha type definitions
    it.each([CHAIN_IDS.SEPOLIA, CHAIN_IDS.LINEA_SEPOLIA])(
      'returns true if account is EVM (testnet): %s',
      (chainId: Hex) => {
        const state = getEvmState(chainId);
        expect(getMultichainIsTestnet(state)).toBe(true);
      },
    );
  });

  describe('getMultichainSelectedAccountCachedBalance', () => {
    it('returns cached balance if account is EVM', () => {
      const state = getEvmState();

      expect(getMultichainSelectedAccountCachedBalance(state)).toBe(
        getSelectedAccountCachedBalance(state),
      );
    });
  });

  describe('getMultichainSelectedAccountCachedBalanceIsZero', () => {
    it('returns true if the selected EVM account has a zero balance', () => {
      const state = getEvmState();
      state.metamask.accountsByChainId['0x1'][
        MOCK_ACCOUNT_EOA.address
      ].balance = '0x00';
      expect(getMultichainSelectedAccountCachedBalanceIsZero(state)).toBe(true);
    });

    it('returns false if the selected EVM account has a non-zero balance', () => {
      const state = getEvmState();
      state.metamask.accountsByChainId['0x1'][
        MOCK_ACCOUNT_EOA.address
      ].balance = '3';
      expect(getMultichainSelectedAccountCachedBalanceIsZero(state)).toBe(
        false,
      );
    });
  });

  describe('getMultichainCurrencyImage', () => {
    it('matches native currency image when account is EVM', () => {
      const state = getEvmState();
      expect(getMultichainCurrencyImage(state)).toBe(
        getNativeCurrencyImage(state),
      );
    });
  });

  describe('isChainIdMainnet', () => {
    it('returns true only for Ethereum mainnet chain id', () => {
      expect(isChainIdMainnet(CHAIN_IDS.MAINNET)).toBe(true);
      expect(isChainIdMainnet(CHAIN_IDS.SEPOLIA)).toBe(false);
    });
  });

  describe('getImageForChainId', () => {
    it('returns an image URL for a known EVM chain id', () => {
      expect(getImageForChainId(CHAIN_IDS.MAINNET)).toBe(ETH_TOKEN_IMAGE_URL);
    });

    it('returns an image URL for a known EVM CAIP chain id', () => {
      expect(getImageForChainId('eip155:1')).toBe(ETH_TOKEN_IMAGE_URL);
    });

    it('returns undefined for an unknown chain id', () => {
      expect(getImageForChainId('unknown:chain')).toBeUndefined();
    });
  });

  describe('getMultichainConversionRate', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('uses the EVM conversion rate path when account is EVM', () => {
      const state = getEvmState();
      expect(getMultichainConversionRate(state)).toBe(
        getMultichainConversionRate(state, MOCK_ACCOUNT_EOA),
      );
    });

    it('returns numeric conversion rate for EVM when getConversionRate returns a number', () => {
      jest
        .spyOn(metamaskBaseSelectors, 'getConversionRate')
        .mockReturnValue(3100.75);
      expect(getMultichainConversionRate(getEvmState())).toBe(3100.75);
    });

    it('returns numeric conversion rate for EVM when getConversionRate returns a numeric string', () => {
      jest
        .spyOn(metamaskBaseSelectors, 'getConversionRate')
        .mockImplementation(() => '2100.25' as never);
      expect(getMultichainConversionRate(getEvmState())).toBe(2100.25);
    });

    it('returns undefined when EVM conversion rate is undefined', () => {
      jest
        .spyOn(metamaskBaseSelectors, 'getConversionRate')
        .mockReturnValue(undefined);
      expect(getMultichainConversionRate(getEvmState())).toBeUndefined();
    });

    it('returns undefined when EVM conversion rate is null', () => {
      jest
        .spyOn(metamaskBaseSelectors, 'getConversionRate')
        .mockImplementation(() => null as never);
      expect(getMultichainConversionRate(getEvmState())).toBeUndefined();
    });
  });

  describe('makeGetMultichainShouldShowFiatByChainId', () => {
    it('delegates to getMultichainShouldShowFiat with the bound chain id', () => {
      const state = getEvmState();
      const byChain = makeGetMultichainShouldShowFiatByChainId(
        CHAIN_IDS.MAINNET,
      );
      expect(byChain(state)).toBe(
        getMultichainShouldShowFiat(state, undefined, CHAIN_IDS.MAINNET),
      );
    });
  });

  describe('getMultichainNetworkConfigurationsByChainId', () => {
    it('returns the same reference when called repeatedly with the same state', () => {
      const state = getEvmState();
      const first = getMultichainNetworkConfigurationsByChainId(state);
      const second = getMultichainNetworkConfigurationsByChainId(state);
      expect(second).toBe(first);
    });

    it('returns the same merged reference when networkConfigurationsByChainId is deep-equal', () => {
      const state = getEvmState();
      const before = getMultichainNetworkConfigurationsByChainId(state);

      const modifiedState: TestState = {
        ...state,
        metamask: {
          ...state.metamask,
          networkConfigurationsByChainId: {
            ...state.metamask.networkConfigurationsByChainId,
          },
        },
      };

      const after = getMultichainNetworkConfigurationsByChainId(modifiedState);
      expect(after).toBe(before);
    });

    it('returns a new reference when an EVM network configuration changes', () => {
      const state = getEvmState();
      const before = getMultichainNetworkConfigurationsByChainId(state);

      const mainnetConfig =
        state.metamask.networkConfigurationsByChainId[CHAIN_IDS.MAINNET];
      const modifiedState: TestState = {
        ...state,
        metamask: {
          ...state.metamask,
          networkConfigurationsByChainId: {
            ...state.metamask.networkConfigurationsByChainId,
            [CHAIN_IDS.MAINNET]: {
              ...mainnetConfig,
              name: 'Ethereum Mainnet Modified',
            },
          },
        },
      };

      const after = getMultichainNetworkConfigurationsByChainId(modifiedState);
      expect(after).not.toBe(before);
      expect(after[CHAIN_IDS.MAINNET].name).toBe('Ethereum Mainnet Modified');
    });
  });
});

describe('retired network configurations', () => {
  it('returns only configured EVM networks despite saved non-EVM state', () => {
    const state = getEvmState();
    const networks = getMultichainNetworkConfigurationsByChainId(state);
    expect(Object.keys(networks)).toEqual(
      Object.keys(state.metamask.networkConfigurationsByChainId),
    );
    expect(networks['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp']).toBeUndefined();
  });
});
