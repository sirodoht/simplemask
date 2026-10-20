import { renderHook } from '@testing-library/react';
import { TransactionType } from '@metamask/transaction-controller';
import type { TransactionMeta } from '@metamask/transaction-controller';
import { useTransactionMetadataRequestOptional } from './useTransactionMetadataRequest';
import { useTransactionPayingAccount } from './useTransactionPayingAccount';

jest.mock('./useTransactionMetadataRequest');

const FROM_ADDRESS = '0x1234567890123456789012345678901234567890';
const OVERRIDE_ADDRESS = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
const mockUseTransactionMetadataRequestOptional = jest.mocked(
  useTransactionMetadataRequestOptional,
);

function mockTransaction(
  type: TransactionType,
  nestedTypes: TransactionType[] = [],
) {
  mockUseTransactionMetadataRequestOptional.mockReturnValue({
    id: 'tx-1',
    type,
    txParams: { from: FROM_ADDRESS },
    nestedTransactions: nestedTypes.map((nestedType) => ({
      type: nestedType,
    })),
  } as unknown as TransactionMeta);
}

describe('useTransactionPayingAccount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('keeps txParams.from for a post-quote Perps withdraw', () => {
    mockTransaction(TransactionType.perpsWithdraw);

    const { result } = renderHook(() => useTransactionPayingAccount());

    expect(result.current).toBe(FROM_ADDRESS);
  });

  it('returns undefined when there is no transaction', () => {
    mockUseTransactionMetadataRequestOptional.mockReturnValue(undefined);

    const { result } = renderHook(() => useTransactionPayingAccount());

    expect(result.current).toBeUndefined();
  });
});
