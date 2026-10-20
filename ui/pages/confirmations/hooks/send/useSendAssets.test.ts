import { useSelector } from 'react-redux';
import { renderHookWithProvider } from '../../../../../test/lib/render-helpers-navigate';
import mockState from '../../../../../test/data/mock-state.json';
import { getAllMultichainNetworkConfigurations } from '../../../../selectors/multichain/networks';
import { type Asset } from '../../types/send';
import { useSendAssets } from './useSendAssets';
import * as useSendTokensModule from './useSendTokens';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

jest.mock('./useSendTokens');

const mockUseSelector = jest.mocked(useSelector);
const mockUseSendTokens = jest.spyOn(useSendTokensModule, 'useSendTokens');

// Mock network configurations with CAIP chain IDs
// Note: 0x1 = 1 (Ethereum), 0x89 = 137 (Polygon), 0xaa36a7 = 11155111 (Sepolia)
const mockMultichainNetworkConfigurations = {
  'eip155:1': { chainId: 'eip155:1', name: 'Ethereum', isEvm: true },
  'eip155:137': { chainId: 'eip155:137', name: 'Polygon', isEvm: true },
  'eip155:11155111': {
    chainId: 'eip155:11155111',
    name: 'Sepolia',
    isEvm: true,
  },
  'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp': {
    chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
    name: 'Solana',
    isEvm: false,
  },
};

// State with external services enabled (BFT ON)
const mockStateWithExternalServices = {
  ...mockState,
  metamask: {
    ...mockState.metamask,
    useExternalServices: true,
  },
};

// State with external services disabled (BFT OFF)
const mockStateWithoutExternalServices = {
  ...mockState,
  metamask: {
    ...mockState.metamask,
    useExternalServices: false,
  },
};

describe('useSendAssets', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSelector.mockImplementation((selector) => {
      if (selector === getAllMultichainNetworkConfigurations) {
        return mockMultichainNetworkConfigurations;
      }
      return undefined;
    });
  });

  it('returns tokens from the token hook', () => {
    const mockTokens: Asset[] = [
      { id: 'token1', name: 'Token 1', chainId: '0x1' } as Asset,
      { id: 'token2', name: 'Token 2', chainId: '0x1' } as Asset,
    ];

    mockUseSendTokens.mockReturnValue(mockTokens);

    const { result } = renderHookWithProvider(
      () => useSendAssets(),
      mockStateWithExternalServices,
    );

    expect(result.current).toEqual({
      tokens: mockTokens,
    });
  });

  it('returns empty arrays when hooks return empty arrays', () => {
    mockUseSendTokens.mockReturnValue([]);

    const { result } = renderHookWithProvider(
      () => useSendAssets(),
      mockStateWithExternalServices,
    );

    expect(result.current).toEqual({
      tokens: [],
    });
  });

  it('calls the useSendTokens hook', () => {
    mockUseSendTokens.mockReturnValue([]);

    renderHookWithProvider(
      () => useSendAssets(),
      mockStateWithExternalServices,
    );

    expect(mockUseSendTokens).toHaveBeenCalledTimes(1);
  });

  it('filters out non-EVM tokens when BFT is OFF', () => {
    const mockTokens: Asset[] = [
      { id: 'token1', name: 'EVM Token', chainId: '0x1' } as Asset,
      {
        id: 'token2',
        name: 'Solana Token',
        chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
      } as Asset,
      { id: 'token3', name: 'Another EVM Token', chainId: '0x89' } as Asset,
    ];

    mockUseSendTokens.mockReturnValue(mockTokens);

    const { result } = renderHookWithProvider(
      () => useSendAssets(),
      mockStateWithoutExternalServices,
    );

    // Only EVM tokens should be returned
    expect(result.current.tokens).toHaveLength(2);
    expect(result.current.tokens[0].chainId).toBe('0x1');
    expect(result.current.tokens[1].chainId).toBe('0x89');
  });

  it('filters out tokens from networks not in Network Manager', () => {
    const mockTokens: Asset[] = [
      { id: 'token1', name: 'Token 1', chainId: '0x1' } as Asset,
      { id: 'token2', name: 'Token 2', chainId: '0x89' } as Asset,
      { id: 'token3', name: 'Token 3', chainId: '0x999' } as Asset, // Not in enabled networks
    ];

    mockUseSendTokens.mockReturnValue(mockTokens);

    const { result } = renderHookWithProvider(
      () => useSendAssets(),
      mockStateWithExternalServices,
    );

    // Only tokens from enabled networks should be returned
    expect(result.current.tokens).toHaveLength(2);
    expect(result.current.tokens[0].chainId).toBe('0x1');
    expect(result.current.tokens[1].chainId).toBe('0x89');
  });

  it('applies both enabledNetworks and EVM filtering when BFT is OFF', () => {
    const mockTokens: Asset[] = [
      { id: 'token1', name: 'EVM Token', chainId: '0x1' } as Asset,
      { id: 'token2', name: 'EVM Token 2', chainId: '0x89' } as Asset,
      {
        id: 'token3',
        name: 'Solana Token',
        chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
      } as Asset,
      {
        id: 'token4',
        name: 'Disabled Network Token',
        chainId: '0x999',
      } as Asset, // Not enabled
    ];

    mockUseSendTokens.mockReturnValue(mockTokens);

    const { result } = renderHookWithProvider(
      () => useSendAssets(),
      mockStateWithoutExternalServices,
    );

    // Should filter out both non-EVM and non-enabled networks
    expect(result.current.tokens).toHaveLength(2);
    expect(result.current.tokens[0].chainId).toBe('0x1');
    expect(result.current.tokens[1].chainId).toBe('0x89');
  });
});
