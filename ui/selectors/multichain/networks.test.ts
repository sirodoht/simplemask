import { BtcScope, SolScope } from '@metamask/keyring-api';
import {
  type NetworkConfiguration,
  RpcEndpointType,
  NetworkStatus,
} from '@metamask/network-controller';
import { type Hex, type CaipChainId } from '@metamask/utils';
import { type MultichainNetworkConfiguration } from '@metamask/multichain-network-controller';

import { type NetworkState } from '../../../shared/lib/selectors/networks';
import type { AccountsState } from '../../../shared/lib/selectors/accounts';
import { MOCK_ACCOUNT_EOA } from '../../../test/data/mock-accounts';
import { RemoteFeatureFlagsState } from '../../../shared/lib/selectors/remote-feature-flags';
import {
  type MultichainNetworkControllerState,
  getNonEvmMultichainNetworkConfigurationsByChainId,
  getMultichainNetworkConfigurationsByChainId,
  getSelectedMultichainNetworkChainId,
  getSelectedMultichainNetworkConfiguration,
  getIsEvmMultichainNetworkSelected,
  getEvmMultichainNetworkConfigurations,
  getAllMultichainNetworkConfigurations,
} from './networks';

jest.mock('./feature-flags', () => ({
  getIsBitcoinSupportEnabled: jest.fn((state) => {
    const { bitcoinAccounts } = state.metamask.remoteFeatureFlags;
    // Keep this simple, only check if it's enabled or not.
    return bitcoinAccounts?.enabled;
  }),
  getIsSolanaSupportEnabled: jest.fn((state) => {
    const { solanaAccounts } = state.metamask.remoteFeatureFlags;
    // Keep this simple, only check if it's enabled or not.
    return solanaAccounts?.enabled;
  }),
  getIsSolanaTestnetSupportEnabled: jest.fn(
    (state) => state.metamask.remoteFeatureFlags.solanaTestnetsEnabled,
  ),
  getIsBitcoinTestnetSupportEnabled: jest.fn(
    (state) => state.metamask.remoteFeatureFlags.bitcoinTestnetsEnabled,
  ),
  getIsTronSupportEnabled: jest.fn((state) => {
    const { tronAccounts } = state.metamask.remoteFeatureFlags;
    // Keep this simple, only check if it's enabled or not.
    return tronAccounts?.enabled;
  }),
  getIsTronTestnetSupportEnabled: jest.fn(
    (state) => state.metamask.remoteFeatureFlags.tronTestnetsEnabled,
  ),
  getIsStellarSupportEnabled: jest.fn((state) => {
    const { stellarAccounts } = state.metamask.remoteFeatureFlags;
    return stellarAccounts?.enabled;
  }),
}));

jest.mock('../../../shared/lib/selectors/multichain', () => ({
  getEnabledNetworks: jest.fn(
    (state) => state.metamask.enabledNetworkMap ?? { eip155: {} },
  ),
}));

type TestState = AccountsState &
  MultichainNetworkControllerState &
  NetworkState &
  RemoteFeatureFlagsState;

const mockNonEvmNetworks: Record<CaipChainId, MultichainNetworkConfiguration> =
  {
    [SolScope.Mainnet]: {
      chainId: SolScope.Mainnet,
      name: 'Solana',
      nativeCurrency: `${SolScope.Mainnet}/slip44:501`,
      isEvm: false,
    },
    [SolScope.Devnet]: {
      chainId: SolScope.Devnet,
      name: 'Solana Devnet',
      nativeCurrency: `${SolScope.Devnet}/slip44:501`,
      isEvm: false,
    },
    [BtcScope.Mainnet]: {
      chainId: BtcScope.Mainnet,
      name: 'Bitcoin',
      nativeCurrency: `${BtcScope.Mainnet}/slip44:0`,
      isEvm: false,
    },
  };

const mockEvmNetworksWithNewConfig: Record<
  CaipChainId,
  MultichainNetworkConfiguration
> = {
  'eip155:1': {
    chainId: 'eip155:1',
    name: 'Ethereum Mainnet',
    nativeCurrency: 'ETH',
    blockExplorerUrls: ['https://etherscan.io'],
    defaultBlockExplorerUrlIndex: 0,
    isEvm: true,
  },
  'eip155:11155111': {
    chainId: 'eip155:11155111',
    name: 'Sepolia',
    nativeCurrency: 'SepoliaETH',
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
    defaultBlockExplorerUrlIndex: 0,
    isEvm: true,
  },
};

const mockEvmNetworksWithOldConfig: Record<Hex, NetworkConfiguration> = {
  '0x1': {
    chainId: '0x1',
    name: 'Ethereum Mainnet',
    nativeCurrency: 'ETH',
    rpcEndpoints: [
      {
        networkClientId: 'mainnet',
        type: RpcEndpointType.Infura,
        url: 'https://mainnet.infura.io/v3/{infuraProjectId}',
      },
    ],
    defaultRpcEndpointIndex: 1,
    blockExplorerUrls: ['https://etherscan.io'],
    defaultBlockExplorerUrlIndex: 0,
    lastUpdatedAt: 1739466375574,
  },
  '0xaa36a7': {
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
    chainId: '0xaa36a7',
    defaultBlockExplorerUrlIndex: 0,
    defaultRpcEndpointIndex: 0,
    name: 'Sepolia',
    nativeCurrency: 'SepoliaETH',
    rpcEndpoints: [
      {
        networkClientId: 'sepolia',
        type: RpcEndpointType.Infura,
        url: 'https://sepolia.infura.io/v3/{infuraProjectId}',
      },
    ],
  },
};

const mockState: TestState = {
  metamask: {
    remoteFeatureFlags: {
      solanaAccounts: { enabled: true, minimumVersion: '13.6.0' },
      solanaTestnetsEnabled: true,
      bitcoinTestnetsEnabled: false,
      bitcoinAccounts: { enabled: true, minimumVersion: '13.6.0' },
      tronAccounts: { enabled: true, minimumVersion: '13.6.0' },
      tronTestnetsEnabled: false,
      stellarAccounts: { enabled: false, minimumVersion: '13.6.0' },
    },
    multichainNetworkConfigurationsByChainId: {
      ...mockNonEvmNetworks,
    },
    selectedMultichainNetworkChainId: SolScope.Mainnet,
    isEvmSelected: false,
    selectedNetworkClientId: 'mainnet',
    networkConfigurationsByChainId: {
      ...mockEvmNetworksWithOldConfig,
    },
    networksMetadata: {
      mainnet: {
        EIPS: { 1559: true },
        status: NetworkStatus.Available,
      },
      sepolia: {
        EIPS: { 1559: true },
        status: NetworkStatus.Available,
      },
    },
    networksWithTransactionActivity: {},
    internalAccounts: {
      selectedAccount: MOCK_ACCOUNT_EOA.id,
      accounts: {
        [MOCK_ACCOUNT_EOA.id]: MOCK_ACCOUNT_EOA,
      },
    },
    accountIdByAddress: {
      [MOCK_ACCOUNT_EOA.address]: MOCK_ACCOUNT_EOA.id,
    },
  },
};

describe('Multichain network selectors', () => {
  describe('getNonEvmMultichainNetworkConfigurationsByChainId', () => {
    it('ignores saved non-EVM network configurations', () => {
      expect(
        getNonEvmMultichainNetworkConfigurationsByChainId(mockState),
      ).toStrictEqual({});
    });
  });

  describe('getMultichainNetworkConfigurationsByChainId', () => {
    it('returns all multichain network configurations by chain ID when Solana and Bitcoin are enabled', () => {
      expect(
        getMultichainNetworkConfigurationsByChainId(mockState),
      ).toStrictEqual([
        mockEvmNetworksWithNewConfig,
        mockEvmNetworksWithOldConfig,
      ]);
    });

    it('returns all multichain network configurations by chain ID excluding Bitcoin and Solana when support is disabled and no accounts related to those networks', () => {
      const mockMultichainNetworkStateWithBitcoinSupportDisabled = {
        ...mockState,
        metamask: {
          ...mockState.metamask,
          remoteFeatureFlags: {
            ...mockState.metamask.remoteFeatureFlags,
            solanaAccounts: { enabled: false, minimumVersion: '13.6.0' },
            bitcoinAccounts: { enabled: false, minimumVersion: '13.6.0' },
          },
          // Ensure no accounts with Bitcoin/Solana scopes exist
          internalAccounts: {
            selectedAccount: MOCK_ACCOUNT_EOA.id,
            accounts: {
              [MOCK_ACCOUNT_EOA.id]: MOCK_ACCOUNT_EOA,
            },
          },
        },
      };

      expect(
        getMultichainNetworkConfigurationsByChainId(
          mockMultichainNetworkStateWithBitcoinSupportDisabled,
        ),
      ).toStrictEqual([
        mockEvmNetworksWithNewConfig,
        mockEvmNetworksWithOldConfig,
      ]);
    });
  });

  describe('getEvmMultichainNetworkConfigurations', () => {
    it('returns EVM networks in multichain format', () => {
      expect(getEvmMultichainNetworkConfigurations(mockState)).toStrictEqual(
        mockEvmNetworksWithNewConfig,
      );
    });

    it('returns stable references when called multiple times with the same state', () => {
      const result1 = getEvmMultichainNetworkConfigurations(mockState);
      const result2 = getEvmMultichainNetworkConfigurations(mockState);

      expect(result1).toBe(result2);
    });

    it('returns a new reference when state changes', () => {
      const result1 = getEvmMultichainNetworkConfigurations(mockState);

      const modifiedState: TestState = {
        ...mockState,
        metamask: {
          ...mockState.metamask,
          networkConfigurationsByChainId: {
            ...mockState.metamask.networkConfigurationsByChainId,
            '0x5': {
              chainId: '0x5',
              name: 'Goerli',
              nativeCurrency: 'GoerliETH',
              rpcEndpoints: [
                {
                  networkClientId: 'goerli',
                  type: RpcEndpointType.Infura,
                  url: 'https://goerli.infura.io/v3/{infuraProjectId}',
                },
              ],
              defaultRpcEndpointIndex: 0,
              blockExplorerUrls: [],
              defaultBlockExplorerUrlIndex: 0,
            },
          },
        },
      };

      const result2 = getEvmMultichainNetworkConfigurations(modifiedState);

      expect(result1).not.toBe(result2);
      expect(Object.keys(result2)).toHaveLength(3);
    });
  });

  describe('getAllMultichainNetworkConfigurations', () => {
    it('returns only EVM networks despite saved non-EVM networks', () => {
      expect(getAllMultichainNetworkConfigurations(mockState)).toStrictEqual({
        ...mockEvmNetworksWithNewConfig,
      });
    });

    it('returns stable references when called multiple times with the same state', () => {
      const result1 = getAllMultichainNetworkConfigurations(mockState);
      const result2 = getAllMultichainNetworkConfigurations(mockState);

      expect(result1).toBe(result2);
    });

    it('returns a new reference when state changes', () => {
      const result1 = getAllMultichainNetworkConfigurations(mockState);

      const modifiedState: TestState = {
        ...mockState,
        metamask: {
          ...mockState.metamask,
          networkConfigurationsByChainId: {
            ...mockState.metamask.networkConfigurationsByChainId,
            '0x5': {
              chainId: '0x5',
              name: 'Goerli',
              nativeCurrency: 'GoerliETH',
              rpcEndpoints: [
                {
                  networkClientId: 'goerli',
                  type: RpcEndpointType.Infura,
                  url: 'https://goerli.infura.io/v3/{infuraProjectId}',
                },
              ],
              defaultRpcEndpointIndex: 0,
              blockExplorerUrls: [],
              defaultBlockExplorerUrlIndex: 0,
            },
          },
        },
      };

      const result2 = getAllMultichainNetworkConfigurations(modifiedState);

      expect(result1).not.toBe(result2);
    });
  });

  describe('getMultichainNetworkConfigurationsByChainId - reference stability', () => {
    it('returns stable references when called multiple times with the same state', () => {
      const result1 = getMultichainNetworkConfigurationsByChainId(mockState);
      const result2 = getMultichainNetworkConfigurationsByChainId(mockState);

      // The tuple itself should be the same reference
      expect(result1).toBe(result2);
      // Each element should also be the same reference
      expect(result1[0]).toBe(result2[0]);
      expect(result1[1]).toBe(result2[1]);
    });

    it('returns a new reference when EVM networks change', () => {
      const result1 = getMultichainNetworkConfigurationsByChainId(mockState);

      const modifiedState: TestState = {
        ...mockState,
        metamask: {
          ...mockState.metamask,
          networkConfigurationsByChainId: {
            ...mockState.metamask.networkConfigurationsByChainId,
            '0x5': {
              chainId: '0x5',
              name: 'Goerli',
              nativeCurrency: 'GoerliETH',
              rpcEndpoints: [
                {
                  networkClientId: 'goerli',
                  type: RpcEndpointType.Infura,
                  url: 'https://goerli.infura.io/v3/{infuraProjectId}',
                },
              ],
              defaultRpcEndpointIndex: 0,
              blockExplorerUrls: [],
              defaultBlockExplorerUrlIndex: 0,
            },
          },
        },
      };

      const result2 =
        getMultichainNetworkConfigurationsByChainId(modifiedState);

      // References should be different when state changes
      expect(result1).not.toBe(result2);
      expect(result1[0]).not.toBe(result2[0]);
      expect(result1[1]).not.toBe(result2[1]);
    });
  });

  describe('getSelectedMultichainNetworkConfiguration - reference stability', () => {
    it('returns stable references when called multiple times with the same state', () => {
      const result1 = getSelectedMultichainNetworkConfiguration(mockState);
      const result2 = getSelectedMultichainNetworkConfiguration(mockState);

      expect(result1).toBe(result2);
    });

    it('returns same reference when unrelated state changes', () => {
      const result1 = getSelectedMultichainNetworkConfiguration(mockState);

      // Change something unrelated to selected network
      const modifiedState = {
        ...mockState,
        metamask: {
          ...mockState.metamask,
          networksMetadata: {
            ...mockState.metamask.networksMetadata,
            mainnet: {
              EIPS: { 1559: false },
              status: NetworkStatus.Unavailable,
            },
          },
        },
      };

      const result2 = getSelectedMultichainNetworkConfiguration(modifiedState);

      // Should be the same reference since selected network config didn't change
      expect(result1).toBe(result2);
    });
  });

  describe('getSelectedMultichainNetworkChainId', () => {
    it('returns the selected multichain network chain ID', () => {
      expect(getSelectedMultichainNetworkChainId(mockState)).toStrictEqual(
        'eip155:1',
      );
    });
  });

  describe('getIsEvmMultichainNetworkSelected', () => {
    it('returns whether the EVM network is selected', () => {
      expect(getIsEvmMultichainNetworkSelected(mockState)).toStrictEqual(true);
    });
  });

  describe('getSelectedMultichainNetworkConfiguration', () => {
    it('falls back to the EVM selection for saved non-EVM selection', () => {
      expect(
        getSelectedMultichainNetworkConfiguration(mockState),
      ).toStrictEqual(mockEvmNetworksWithNewConfig['eip155:1']);
    });
    it('returns the selected EVM multichain network configuration if isEvmSelected is true', () => {
      const mockMultichainNetworkStateWithEvmSelected = {
        ...mockState,
        metamask: {
          ...mockState.metamask,
          isEvmSelected: true,
        },
      };

      expect(
        getSelectedMultichainNetworkConfiguration(
          mockMultichainNetworkStateWithEvmSelected,
        ),
      ).toStrictEqual(mockEvmNetworksWithNewConfig['eip155:1']);
    });
  });
});
