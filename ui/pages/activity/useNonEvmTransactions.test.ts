import { renderHook } from '@testing-library/react';
import { useSelector } from 'react-redux';
import type { ActivityListItem } from '../../../shared/lib/activity/types';
import { useNonEvmTransactions } from './useNonEvmTransactions';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

const solanaReceive = {
  type: 'receive',
  chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  status: 'success',
  timestamp: 1,
  hash: '0xABC',
  data: { from: '0x1', to: '0x2' },
} as unknown as ActivityListItem;

const otherReceive = {
  type: 'receive',
  chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  status: 'success',
  timestamp: 2,
  hash: '0xdef',
  data: { from: '0x1', to: '0x2' },
} as unknown as ActivityListItem;

describe('useNonEvmTransactions', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('keeps all on-chain settlement transactions on the selected network', () => {
    jest.mocked(useSelector).mockReturnValueOnce([solanaReceive, otherReceive]);

    const { result } = renderHook(() =>
      useNonEvmTransactions({
        networks: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
      }),
    );

    expect(result.current).toStrictEqual([solanaReceive, otherReceive]);
  });

  it('filters out transactions from other networks', () => {
    jest.mocked(useSelector).mockReturnValueOnce([solanaReceive, otherReceive]);

    const { result } = renderHook(() =>
      useNonEvmTransactions({
        networks: ['eip155:1'],
      }),
    );

    expect(result.current).toStrictEqual([]);
  });
});
