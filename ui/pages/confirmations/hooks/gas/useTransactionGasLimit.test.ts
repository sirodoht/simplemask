import { renderHook } from '@testing-library/react';
import { type TransactionMeta } from '@metamask/transaction-controller';
import { useTransactionGasLimit } from './useTransactionGasLimit';

const BASE_TRANSACTION_META = {
  chainId: '0x1',
  networkClientId: 'mainnet',
  txParams: { gas: '0x5208' },
} as unknown as TransactionMeta;

describe('useTransactionGasLimit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('prefers gasUsed when no container types are set', () => {
    const { result } = renderHook(() =>
      useTransactionGasLimit({
        ...BASE_TRANSACTION_META,
        gasUsed: '0x7530',
        gasLimitNoBuffer: '0x6000',
      } as unknown as TransactionMeta),
    );

    expect(result.current.gasLimit).toBe('0x7530');
  });

  it('falls back to gasLimitNoBuffer when gasUsed is missing', () => {
    const { result } = renderHook(() =>
      useTransactionGasLimit({
        ...BASE_TRANSACTION_META,
        gasLimitNoBuffer: '0x6000',
      } as unknown as TransactionMeta),
    );

    expect(result.current.gasLimit).toBe('0x6000');
  });

  it('falls back to txParams.gas when both gasUsed and gasLimitNoBuffer are missing', () => {
    const { result } = renderHook(() =>
      useTransactionGasLimit(BASE_TRANSACTION_META),
    );

    expect(result.current.gasLimit).toBe('0x5208');
  });

  it('returns 0x0 when no gas fields are available', () => {
    const { result } = renderHook(() =>
      useTransactionGasLimit({
        chainId: '0x1',
        networkClientId: 'mainnet',
        txParams: {},
      } as unknown as TransactionMeta),
    );

    expect(result.current.gasLimit).toBe('0x0');
  });

  it('prefers txParams.gas over simulation fields when container types are set', () => {
    const { result } = renderHook(() =>
      useTransactionGasLimit({
        ...BASE_TRANSACTION_META,
        containerTypes: ['EnforcedSimulations'],
        gasUsed: '0x7530',
        gasLimitNoBuffer: '0x6000',
        txParams: { gas: '0x1fbd0' },
      } as unknown as TransactionMeta),
    );

    expect(result.current.gasLimit).toBe('0x1fbd0');
  });

  it('falls back to 0x0 when container types are set but txParams.gas is missing', () => {
    const { result } = renderHook(() =>
      useTransactionGasLimit({
        ...BASE_TRANSACTION_META,
        containerTypes: ['EnforcedSimulations'],
        gasLimitNoBuffer: '0x6000',
        txParams: {},
      } as unknown as TransactionMeta),
    );

    expect(result.current.gasLimit).toBe('0x0');
  });
});
