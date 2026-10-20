import { it as jestIt } from '@jest/globals';
import {
  getMaybeHexChainId,
  getNativeAssetForChainIdSafe,
  getNativeTokenName,
} from './native-asset';

describe('native asset helpers', () => {
  jestIt.each(['0x1', 'eip155:1', '1'])(
    'resolves Ethereum metadata for %s',
    (chainId) => {
      expect(getMaybeHexChainId(chainId)).toBe('0x1');
      expect(getNativeAssetForChainIdSafe(chainId)).toMatchObject({
        symbol: 'ETH',
        decimals: 18,
        assetId: 'eip155:1/slip44:60',
      });
      expect(getNativeTokenName(chainId)).toBe('Ether');
    },
  );

  it('allows custom-network callers to fall back to their own metadata', () => {
    expect(getMaybeHexChainId('eip155:123456789')).toBe('0x75bcd15');
    expect(getNativeAssetForChainIdSafe('0x75bcd15')).toBeUndefined();
    expect(getNativeTokenName('0x75bcd15')).toBeUndefined();
  });

  it('does not turn a non-EVM chain into an EVM chain', () => {
    expect(
      getMaybeHexChainId('solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'),
    ).toBeUndefined();
    expect(getMaybeHexChainId()).toBeUndefined();
  });
});
