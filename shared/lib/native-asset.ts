import type { Hex, CaipChainId } from '@metamask/utils';
import {
  getNativeAssetForChainId,
  isNonEvmChainId,
  formatChainIdToHex,
} from '@metamask/bridge-controller';

/**
 *
 * @param chainId - The chain ID to convert to a hex string
 * @returns The hex string representation of the chain ID. Undefined if the chain ID is not EVM.
 */
export const getMaybeHexChainId = (chainId?: string) => {
  if (!chainId) {
    return undefined;
  }
  return isNonEvmChainId(chainId) ? undefined : formatChainIdToHex(chainId);
};

/**
 * Safely gets the native asset for a given chainId.
 * Returns undefined if the chainId is not supported by the bridge controller.
 * This wrapper prevents errors for custom networks that aren't in the swaps map.
 *
 * @param chainId - The chain ID to get the native asset for
 * @returns The native asset, or undefined if not supported
 */
export const getNativeAssetForChainIdSafe = (
  chainId: string | number | Hex | CaipChainId,
) => {
  try {
    return getNativeAssetForChainId(chainId);
  } catch {
    // Return undefined for unsupported chains (e.g., custom networks, test chains)
    return undefined;
  }
};

/**
 * Safely gets the native token name for a given chainId.
 * Returns undefined if the chainId is not supported by the bridge controller.
 *
 * @param chainId - The chain ID to get the native token name for
 * @returns The human-readable name of the native token, or undefined if not supported
 */
export const getNativeTokenName = (chainId: string): string | undefined => {
  try {
    return getNativeAssetForChainId(chainId)?.name;
  } catch {
    // Return undefined for unsupported chains (e.g., test chains)
    return undefined;
  }
};
