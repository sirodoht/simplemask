import type { Hex } from '@metamask/utils';
import { CHAIN_IDS } from '../../../../shared/constants/network';

export const PERPS_CURRENCY = 'usd';

export const ARBITRUM_USDC = {
  address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831' as Hex,
  decimals: 6,
  name: 'USD Coin',
  symbol: 'USDC',
  chainId: CHAIN_IDS.ARBITRUM,
};
