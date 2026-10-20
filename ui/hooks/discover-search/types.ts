import type { TrendingAsset } from '@metamask/assets-controllers';

export type DiscoverSearchTab = 'all' | 'crypto' | 'stocks';

export type DiscoverSearchSectionId = 'crypto' | 'stocks';

export type DiscoverSearchSection<TItem = unknown> = {
  id: DiscoverSearchSectionId;
  items: TItem[];
  isLoading: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => Promise<unknown>;
  error?: Error | null;
  /** Server-reported total when available (crypto/stocks search). */
  totalCount?: number;
};

export type DiscoverSearchResult = {
  crypto: DiscoverSearchSection<TrendingAsset>;
  stocks: DiscoverSearchSection<TrendingAsset>;
  isDebouncing: boolean;
};

/** Market fields returned by token search when `includeMarketData` is true. */
export type TokenSearchMarketResult = {
  assetId: string;
  name: string;
  symbol: string;
  decimals: number;
  price?: string;
  marketCap?: number;
  aggregatedUsdVolume?: number;
  pricePercentChange1d?: string;
  rwaData?: TrendingAsset['rwaData'];
  securityData?: TrendingAsset['securityData'];
};
