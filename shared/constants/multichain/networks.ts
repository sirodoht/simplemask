import { CaipChainId } from '@metamask/utils';
import {
  BtcAccountType,
  SolAccountType,
  BtcScope,
  SolScope,
  TrxScope,
  TrxAccountType,
  XlmScope,
  XlmAccountType,
  KeyringAccountType,
} from '@metamask/keyring-api';
import { KnownSessionProperties } from '@metamask/chain-agnostic-permission';
import { MultichainBlockExplorerFormatUrls } from '../../lib/multichain/networks';

export type ProviderConfigWithImageUrl = {
  rpcUrl?: string;
  type: string;
  ticker: string;
  nickname?: string;
  rpcPrefs?: {
    imageUrl?: string;
    // Mainly for EVM.
    blockExplorerUrl?: string;
  };
  id?: string;
};

export type MultichainProviderConfig = ProviderConfigWithImageUrl & {
  nickname: string;
  chainId: CaipChainId;
  // Variant of block explorer URLs for non-EVM.
  blockExplorerFormatUrls?: MultichainBlockExplorerFormatUrls;
  // NOTE: For now we use a callback to check if the address is compatible with
  // the given network or not
  isAddressCompatible: (address: string) => boolean;
  decimals: number;
};

export type MultichainNetworkIds = `${MultichainNetworks}`;

export enum MultichainNetworks {
  BITCOIN = BtcScope.Mainnet,
  // TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31860
  // eslint-disable-next-line @typescript-eslint/naming-convention
  BITCOIN_TESTNET = BtcScope.Testnet,
  // TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31860
  // eslint-disable-next-line @typescript-eslint/naming-convention
  BITCOIN_SIGNET = BtcScope.Signet,

  SOLANA = SolScope.Mainnet,
  // TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31860
  // eslint-disable-next-line @typescript-eslint/naming-convention
  SOLANA_DEVNET = SolScope.Devnet,
  // TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31860
  // eslint-disable-next-line @typescript-eslint/naming-convention
  SOLANA_TESTNET = SolScope.Testnet,

  TRON = TrxScope.Mainnet,
  // TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31860
  // eslint-disable-next-line @typescript-eslint/naming-convention
  TRON_NILE = TrxScope.Nile,
  // TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31860
  // eslint-disable-next-line @typescript-eslint/naming-convention
  TRON_SHASTA = TrxScope.Shasta,

  STELLAR = XlmScope.Pubnet,
}

export const MULTICHAIN_TESTNET_NETWORKS: readonly MultichainNetworks[] = [
  MultichainNetworks.BITCOIN_TESTNET,
  MultichainNetworks.BITCOIN_SIGNET,
  MultichainNetworks.SOLANA_DEVNET,
  MultichainNetworks.SOLANA_TESTNET,
  MultichainNetworks.TRON_NILE,
  MultichainNetworks.TRON_SHASTA,
];

// TODO: This data should be provided by the snap
export const MULTICHAIN_NETWORK_TO_ACCOUNT_TYPE_NAME: Record<
  CaipChainId,
  string
> = {
  [BtcScope.Mainnet]: 'Bitcoin',
  [BtcScope.Testnet]: 'Bitcoin Testnet',
  [BtcScope.Testnet4]: 'Bitcoin Testnet4',
  [BtcScope.Signet]: 'Bitcoin Signet',
  [BtcScope.Regtest]: 'Bitcoin Regtest',
  [SolScope.Mainnet]: 'Solana',
  [SolScope.Testnet]: 'Solana',
  [SolScope.Devnet]: 'Solana',
  [TrxScope.Mainnet]: 'Tron',
  [TrxScope.Nile]: 'Tron',
  [TrxScope.Shasta]: 'Tron',
  [XlmScope.Pubnet]: 'Stellar',
} as const;

export const MULTICHAIN_ACCOUNT_TYPE_TO_MAINNET = {
  [BtcAccountType.P2pkh]: MultichainNetworks.BITCOIN,
  [BtcAccountType.P2wpkh]: MultichainNetworks.BITCOIN,
  [BtcAccountType.P2sh]: MultichainNetworks.BITCOIN,
  [BtcAccountType.P2tr]: MultichainNetworks.BITCOIN,
  [SolAccountType.DataAccount]: MultichainNetworks.SOLANA,
  [TrxAccountType.Eoa]: MultichainNetworks.TRON,
  [XlmAccountType.Account]: MultichainNetworks.STELLAR,
} as const;

export const MULTICHAIN_NETWORK_TO_NICKNAME: Record<CaipChainId, string> = {
  [MultichainNetworks.BITCOIN]: 'Bitcoin',
  [MultichainNetworks.BITCOIN_TESTNET]: 'Bitcoin Testnet',
  [MultichainNetworks.BITCOIN_SIGNET]: 'Bitcoin Mutinynet',
  [MultichainNetworks.SOLANA]: 'Solana',
  [MultichainNetworks.SOLANA_DEVNET]: 'Solana Devnet',
  [MultichainNetworks.SOLANA_TESTNET]: 'Solana Testnet',
  [MultichainNetworks.TRON]: 'Tron',
  [MultichainNetworks.TRON_NILE]: 'Tron Nile Testnet',
  [MultichainNetworks.TRON_SHASTA]: 'Tron Shasta Testnet',
  [MultichainNetworks.STELLAR]: 'Stellar',
} as const;

// TODO: This data should be provided by the snap
export const BITCOIN_TOKEN_IMAGE_URL = './images/bitcoin-logo.svg';
export const BITCOIN_TESTNET_TOKEN_IMAGE_URL =
  './images/bitcoin-testnet-logo.svg';
export const BITCOIN_SIGNET_TOKEN_IMAGE_URL =
  './images/bitcoin-signet-logo.png';

export const SOLANA_TOKEN_IMAGE_URL = './images/solana-logo.svg';
export const SOLANA_TESTNET_IMAGE_URL = './images/solana-testnet-logo.svg';
export const SOLANA_DEVNET_IMAGE_URL = './images/solana-devnet-logo.svg';

export const TRON_TOKEN_IMAGE_URL = './images/tron-logo.svg';
export const TRON_NILE_TOKEN_IMAGE_URL = './images/tron-logo-testnet.svg';
export const TRON_SHASTA_TOKEN_IMAGE_URL = './images/tron-logo-testnet.svg';

export const STELLAR_TOKEN_IMAGE_URL = './images/xlm.svg';

export const BITCOIN_BLOCK_EXPLORER_URL = 'https://mempool.space';
export const BITCOIN_BLOCK_EXPLORER_NAME = 'Mempool';
export const BITCOIN_SIGNET_BLOCK_EXPLORER_URL = 'https://mutinynet.com';
export const BITCOIN_SIGNET_BLOCK_EXPLORER_NAME = 'Mutinynet';
export const SOLANA_BLOCK_EXPLORER_URL = 'https://solscan.io';
export const SOLANA_BLOCK_EXPLORER_NAME = 'Solscan';
export const TRON_BLOCK_EXPLORER_URL = 'https://tronscan.org';
export const TRON_BLOCK_EXPLORER_NAME = 'Tronscan';
export const TRON_NILE_BLOCK_EXPLORER_URL = 'https://nile.tronscan.org';
export const TRON_SHASTA_BLOCK_EXPLORER_URL = 'https://shasta.tronscan.org';
export const STELLAR_BLOCK_EXPLORER_URL = 'https://stellar.expert';
export const STELLAR_BLOCK_EXPLORER_NAME = 'Stellar Expert';

export const MULTICHAIN_NETWORK_BLOCK_EXPLORER_FORMAT_URLS_MAP: Record<
  CaipChainId,
  MultichainBlockExplorerFormatUrls
> = {
  [MultichainNetworks.BITCOIN]: {
    name: BITCOIN_BLOCK_EXPLORER_NAME,
    url: BITCOIN_BLOCK_EXPLORER_URL,
    address: `${BITCOIN_BLOCK_EXPLORER_URL}/address/{address}`,
    transaction: `${BITCOIN_BLOCK_EXPLORER_URL}/tx/{txId}`,
  },
  [MultichainNetworks.BITCOIN_TESTNET]: {
    name: BITCOIN_BLOCK_EXPLORER_NAME,
    url: BITCOIN_BLOCK_EXPLORER_URL,
    address: `${BITCOIN_BLOCK_EXPLORER_URL}/testnet/address/{address}`,
    transaction: `${BITCOIN_BLOCK_EXPLORER_URL}/testnet/tx/{txId}`,
  },
  [MultichainNetworks.BITCOIN_SIGNET]: {
    name: BITCOIN_SIGNET_BLOCK_EXPLORER_NAME,
    url: BITCOIN_SIGNET_BLOCK_EXPLORER_URL,
    address: `${BITCOIN_SIGNET_BLOCK_EXPLORER_URL}/address/{address}`,
    transaction: `${BITCOIN_SIGNET_BLOCK_EXPLORER_URL}/tx/{txId}`,
  },

  [MultichainNetworks.SOLANA]: {
    name: SOLANA_BLOCK_EXPLORER_NAME,
    url: SOLANA_BLOCK_EXPLORER_URL,
    address: `${SOLANA_BLOCK_EXPLORER_URL}/account/{address}`,
    transaction: `${SOLANA_BLOCK_EXPLORER_URL}/tx/{txId}`,
  },
  [MultichainNetworks.SOLANA_DEVNET]: {
    name: SOLANA_BLOCK_EXPLORER_NAME,
    url: SOLANA_BLOCK_EXPLORER_URL,
    address: `${SOLANA_BLOCK_EXPLORER_URL}/account/{address}?cluster=devnet`,
    transaction: `${SOLANA_BLOCK_EXPLORER_URL}/tx/{txId}?cluster=devnet`,
  },
  [MultichainNetworks.SOLANA_TESTNET]: {
    name: SOLANA_BLOCK_EXPLORER_NAME,
    url: SOLANA_BLOCK_EXPLORER_URL,
    address: `${SOLANA_BLOCK_EXPLORER_URL}/account/{address}?cluster=testnet`,
    transaction: `${SOLANA_BLOCK_EXPLORER_URL}/tx/{txId}?cluster=testnet`,
  },
  [MultichainNetworks.TRON]: {
    name: TRON_BLOCK_EXPLORER_NAME,
    url: TRON_BLOCK_EXPLORER_URL,
    address: `${TRON_BLOCK_EXPLORER_URL}/#/address/{address}`,
    transaction: `${TRON_BLOCK_EXPLORER_URL}/#/transaction/{txId}`,
  },
  [MultichainNetworks.TRON_NILE]: {
    name: TRON_BLOCK_EXPLORER_NAME,
    url: TRON_NILE_BLOCK_EXPLORER_URL,
    address: `${TRON_NILE_BLOCK_EXPLORER_URL}/#/address/{address}`,
    transaction: `${TRON_NILE_BLOCK_EXPLORER_URL}/#/transaction/{txId}`,
  },
  [MultichainNetworks.TRON_SHASTA]: {
    name: TRON_BLOCK_EXPLORER_NAME,
    url: TRON_SHASTA_BLOCK_EXPLORER_URL,
    address: `${TRON_SHASTA_BLOCK_EXPLORER_URL}/#/address/{address}`,
    transaction: `${TRON_SHASTA_BLOCK_EXPLORER_URL}/#/transaction/{txId}`,
  },
  [MultichainNetworks.STELLAR]: {
    name: STELLAR_BLOCK_EXPLORER_NAME,
    url: STELLAR_BLOCK_EXPLORER_URL,
    address: `${STELLAR_BLOCK_EXPLORER_URL}/explorer/public/account/{address}`,
    asset: `${STELLAR_BLOCK_EXPLORER_URL}/explorer/public/asset/{asset}`,
    transaction: `${STELLAR_BLOCK_EXPLORER_URL}/explorer/public/tx/{txId}`,
  },
} as const;

export const MULTICHAIN_TOKEN_IMAGE_MAP: Record<CaipChainId, string> = {
  [MultichainNetworks.BITCOIN]: BITCOIN_TOKEN_IMAGE_URL,
  [MultichainNetworks.BITCOIN_TESTNET]: BITCOIN_TESTNET_TOKEN_IMAGE_URL,
  [MultichainNetworks.BITCOIN_SIGNET]: BITCOIN_SIGNET_TOKEN_IMAGE_URL,
  [MultichainNetworks.SOLANA]: SOLANA_TOKEN_IMAGE_URL,
  [MultichainNetworks.SOLANA_DEVNET]: SOLANA_DEVNET_IMAGE_URL,
  [MultichainNetworks.SOLANA_TESTNET]: SOLANA_TESTNET_IMAGE_URL,
  [MultichainNetworks.TRON]: TRON_TOKEN_IMAGE_URL,
  [MultichainNetworks.TRON_NILE]: TRON_NILE_TOKEN_IMAGE_URL,
  [MultichainNetworks.TRON_SHASTA]: TRON_SHASTA_TOKEN_IMAGE_URL,
  [MultichainNetworks.STELLAR]: STELLAR_TOKEN_IMAGE_URL,
} as const;

export const SOLANA_TEST_CHAINS: CaipChainId[] = [
  SolScope.Testnet,
  SolScope.Devnet,
];

export const SOLANA_CHAINS: CaipChainId[] = [
  MultichainNetworks.SOLANA,
  MultichainNetworks.SOLANA_TESTNET,
  MultichainNetworks.SOLANA_DEVNET,
];

export const TRON_CHAINS: CaipChainId[] = [
  MultichainNetworks.TRON,
  MultichainNetworks.TRON_NILE,
  MultichainNetworks.TRON_SHASTA,
];

export const BTC_CHAINS: CaipChainId[] = [MultichainNetworks.BITCOIN];

export const STELLAR_CHAINS: CaipChainId[] = [MultichainNetworks.STELLAR];

type NonEvmAccountChangedConfig = {
  network: MultichainNetworks;
  chains: CaipChainId[];
  notificationProperty: KnownSessionProperties;
  accountType: KeyringAccountType;
};

export const NON_EVM_ACCOUNT_CHANGED_CONFIGS: NonEvmAccountChangedConfig[] = [
  {
    network: MultichainNetworks.SOLANA,
    chains: SOLANA_CHAINS,
    notificationProperty:
      KnownSessionProperties.SolanaAccountChangedNotifications,
    accountType: SolAccountType.DataAccount,
  },
  ///: BEGIN:ONLY_INCLUDE_IF(tron)
  {
    network: MultichainNetworks.TRON,
    chains: TRON_CHAINS,
    notificationProperty:
      KnownSessionProperties.TronAccountChangedNotifications,
    accountType: TrxAccountType.Eoa,
  },
  ///: END:ONLY_INCLUDE_IF
  ///: BEGIN:ONLY_INCLUDE_IF(bitcoin)
  {
    network: MultichainNetworks.BITCOIN,
    chains: BTC_CHAINS,
    notificationProperty:
      KnownSessionProperties.Bip122AccountChangedNotifications,
    accountType: BtcAccountType.P2wpkh,
  },
  ///: END:ONLY_INCLUDE_IF
];
