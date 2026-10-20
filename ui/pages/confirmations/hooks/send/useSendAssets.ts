import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { toEvmCaipChainId } from '@metamask/multichain-network-controller';
import type { CaipChainId, Hex } from '@metamask/utils';
import { type Asset } from '../../types/send';
import { getUseExternalServices } from '../../../../selectors';
import { getAllMultichainNetworkConfigurations } from '../../../../selectors/multichain/networks';
import { isEvmChainId } from '../../../../../shared/lib/asset-utils';
import { useSendTokens } from './useSendTokens';

type SendAssets = {
  tokens: Asset[];
};

type UseSendAssetsOptions = {
  includeNoBalance?: boolean;
};

export const useSendAssets = (
  options: UseSendAssetsOptions = {},
): SendAssets => {
  const { includeNoBalance = false } = options;
  const tokens = useSendTokens({ includeNoBalance });
  const useExternalServices = useSelector(getUseExternalServices);
  const allMultichainNetworkConfigurations = useSelector(
    getAllMultichainNetworkConfigurations,
  );

  // Helper to check if a chain ID is in the available networks
  const isChainIdAvailable = useCallback(
    (chainId: string): boolean => {
      if (!chainId) {
        return false;
      }
      const availableChainIds = Object.keys(allMultichainNetworkConfigurations);
      // Check direct match (for CAIP chain IDs like solana:..., bip122:..., etc.)
      if (availableChainIds.includes(chainId)) {
        return true;
      }
      // For EVM chains, convert Hex to CAIP format and check
      if (isEvmChainId(chainId as CaipChainId | Hex)) {
        const caipChainId = toEvmCaipChainId(chainId as Hex);
        return availableChainIds.includes(caipChainId);
      }
      return false;
    },
    [allMultichainNetworkConfigurations],
  );

  return useMemo(() => {
    // Filter out assets from networks that are not in the Network Manager
    const networkFilteredTokens = tokens.filter((token) => {
      const chainId = String(token.chainId ?? '');
      return isChainIdAvailable(chainId);
    });

    // When BFT is OFF, filter out non-EVM tokens
    if (!useExternalServices) {
      const filteredTokens = networkFilteredTokens.filter((token) => {
        // chainId is Hex for EVM chains or CaipChainId for non-EVM chains
        return isEvmChainId(token.chainId as CaipChainId | Hex);
      });
      return {
        tokens: filteredTokens,
      };
    }

    return {
      tokens: networkFilteredTokens,
    };
  }, [tokens, useExternalServices, isChainIdAvailable]);
};
