import { useMemo } from 'react';

import { type Asset } from '../../types/send';

type UseSendAssetFilterProps = {
  tokens: Asset[];
  selectedChainId?: string | null; // null means "All networks"
  searchQuery?: string;
};

type FilteredAssets = {
  filteredTokens: Asset[];
};

export const useSendAssetFilter = ({
  tokens,
  selectedChainId,
  searchQuery = '',
}: UseSendAssetFilterProps): FilteredAssets => {
  return useMemo(() => {
    let networkFilteredTokens = tokens;

    if (selectedChainId !== null) {
      networkFilteredTokens = tokens.filter(
        (token) => token.chainId === selectedChainId,
      );
    }

    const filteredTokens = networkFilteredTokens.filter((token) =>
      matchesSearchQuery(token, searchQuery),
    );

    return {
      filteredTokens,
    };
  }, [tokens, selectedChainId, searchQuery]);
};

function matchesSearchQuery(asset: Asset, query: string): boolean {
  if (!query.trim()) {
    return true;
  }

  const searchTerm = query.toLowerCase().trim();

  if (asset.name?.toLowerCase().includes(searchTerm)) {
    return true;
  }
  if (asset.symbol?.toLowerCase().includes(searchTerm)) {
    return true;
  }
  if (asset.collection?.name?.toLowerCase().includes(searchTerm)) {
    return true;
  }

  return false;
}
