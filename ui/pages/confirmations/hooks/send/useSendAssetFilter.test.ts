import { renderHookWithProvider } from '../../../../../test/lib/render-helpers-navigate';
import mockState from '../../../../../test/data/mock-state.json';
import { type Asset } from '../../types/send';
import { useSendAssetFilter } from './useSendAssetFilter';

describe('useSendAssetFilter', () => {
  const mockTokens: Asset[] = [
    {
      name: 'Ethereum',
      symbol: 'ETH',
      chainId: '1',
    },
    {
      name: 'USD Coin',
      symbol: 'USDC',
      chainId: '1',
    },
    {
      name: 'Polygon',
      symbol: 'MATIC',
      chainId: '137',
    },
  ];

  it('returns all assets when selectedChainId is null', () => {
    const { result } = renderHookWithProvider(
      () =>
        useSendAssetFilter({
          tokens: mockTokens,
          selectedChainId: null,
          searchQuery: '',
        }),
      mockState,
    );

    expect(result.current.filteredTokens).toEqual(mockTokens);
  });

  it('filters assets by specific chainId', () => {
    const { result } = renderHookWithProvider(
      () =>
        useSendAssetFilter({
          tokens: mockTokens,
          selectedChainId: '1',
          searchQuery: '',
        }),
      mockState,
    );

    expect(result.current.filteredTokens).toEqual([
      mockTokens[0],
      mockTokens[1],
    ]);
  });

  it('returns empty arrays when no assets match chainId', () => {
    const { result } = renderHookWithProvider(
      () =>
        useSendAssetFilter({
          tokens: mockTokens,
          selectedChainId: '999',
          searchQuery: '',
        }),
      mockState,
    );

    expect(result.current.filteredTokens).toEqual([]);
  });

  it('filters assets by search query matching asset name', () => {
    const { result } = renderHookWithProvider(
      () =>
        useSendAssetFilter({
          tokens: mockTokens,
          selectedChainId: null,
          searchQuery: 'ethereum',
        }),
      mockState,
    );

    expect(result.current.filteredTokens).toEqual([mockTokens[0]]);
  });

  it('filters assets by search query matching asset symbol', () => {
    const { result } = renderHookWithProvider(
      () =>
        useSendAssetFilter({
          tokens: mockTokens,
          selectedChainId: null,
          searchQuery: 'USDC',
        }),
      mockState,
    );

    expect(result.current.filteredTokens).toEqual([mockTokens[1]]);
  });

  it('performs case insensitive search', () => {
    const { result } = renderHookWithProvider(
      () =>
        useSendAssetFilter({
          tokens: mockTokens,
          selectedChainId: null,
          searchQuery: 'USD',
        }),
      mockState,
    );

    expect(result.current.filteredTokens).toEqual([mockTokens[1]]);
  });

  it('returns all assets when search query is empty string', () => {
    const { result } = renderHookWithProvider(
      () =>
        useSendAssetFilter({
          tokens: mockTokens,
          selectedChainId: null,
          searchQuery: '',
        }),
      mockState,
    );

    expect(result.current.filteredTokens).toEqual(mockTokens);
  });

  it('returns all assets when search query is only whitespace', () => {
    const { result } = renderHookWithProvider(
      () =>
        useSendAssetFilter({
          tokens: mockTokens,
          selectedChainId: null,
          searchQuery: '   ',
        }),
      mockState,
    );

    expect(result.current.filteredTokens).toEqual(mockTokens);
  });

  it('returns empty arrays when no assets match search query', () => {
    const { result } = renderHookWithProvider(
      () =>
        useSendAssetFilter({
          tokens: mockTokens,
          selectedChainId: null,
          searchQuery: 'nonexistent',
        }),
      mockState,
    );

    expect(result.current.filteredTokens).toEqual([]);
  });

  it('combines network and search filtering', () => {
    const { result } = renderHookWithProvider(
      () =>
        useSendAssetFilter({
          tokens: mockTokens,
          selectedChainId: '1',
          searchQuery: 'USD',
        }),
      mockState,
    );

    expect(result.current.filteredTokens).toEqual([mockTokens[1]]);
  });

  it('handles empty token and NFT arrays', () => {
    const { result } = renderHookWithProvider(
      () =>
        useSendAssetFilter({
          tokens: [],
          selectedChainId: '1',
          searchQuery: 'test',
        }),
      mockState,
    );

    expect(result.current.filteredTokens).toEqual([]);
  });

  it('handles assets with undefined name and symbol properties', () => {
    const assetsWithUndefinedProps: Asset[] = [
      { chainId: '1' },
      { name: undefined, symbol: undefined, chainId: '1' },
    ];

    const { result } = renderHookWithProvider(
      () =>
        useSendAssetFilter({
          tokens: assetsWithUndefinedProps,
          selectedChainId: null,
          searchQuery: 'test',
        }),
      mockState,
    );

    expect(result.current.filteredTokens).toEqual([]);
  });

  it('trims whitespace from search query', () => {
    const { result } = renderHookWithProvider(
      () =>
        useSendAssetFilter({
          tokens: mockTokens,
          selectedChainId: null,
          searchQuery: '  ethereum  ',
        }),
      mockState,
    );

    expect(result.current.filteredTokens).toEqual([mockTokens[0]]);
  });

  it('uses undefined as default searchQuery when not provided', () => {
    const { result } = renderHookWithProvider(
      () =>
        useSendAssetFilter({
          tokens: mockTokens,
          selectedChainId: null,
        }),
      mockState,
    );

    expect(result.current.filteredTokens).toEqual(mockTokens);
  });
});
