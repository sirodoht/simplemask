import { TransactionType } from '@metamask/transaction-controller';
import { parseStandardTokenTransactionData } from '../../../../shared/lib/transaction.utils';

/**
 * ERC-20 `transfer(address,uint256)` 4-byte selector (`keccak256("transfer(address,uint256)").slice(0, 4)`).
 * Used as a cheap early-out before calling the shared ABI parser; amount
 * decoding itself goes through {@link parseStandardTokenTransactionData}.
 */
const TRANSFER_SELECTOR = '0xa9059cbb';

/**
 * Recipient and raw transfer amount decoded from a Money Account withdraw
 * batch's nested `tokenMethodTransfer` call.
 */
export type MoneyAccountWithdrawTransferDetails = {
  recipient?: string;
  amountRaw?: string;
};

/**
 * Locates the nested ERC-20 transfer in a Money Account withdraw batch and
 * returns its recipient and raw (base units) amount. Shared by the activity
 * hero and activity-list enrichment so decoding cannot drift.
 *
 * @param transaction - Transaction whose nested calls to inspect.
 * @returns Recipient and/or raw amount when the nested transfer is present.
 */
export function getMoneyAccountWithdrawTransferDetails(
  transaction:
    | {
        nestedTransactions?: { data?: string; type?: string; to?: string }[];
      }
    | undefined,
): MoneyAccountWithdrawTransferDetails {
  const transfer = transaction?.nestedTransactions?.find(
    (nested) => nested.type === TransactionType.tokenMethodTransfer,
  );
  if (!transfer?.data) {
    return {};
  }

  const parsed = parseStandardTokenTransactionData(transfer.data);
  const recipient = parsed?.args?._to ?? parsed?.args?.to;
  const amount =
    parsed?.args?._value ?? parsed?.args?.value ?? parsed?.args?.[1];

  let amountRaw: string | undefined;
  if (amount !== undefined && amount !== null) {
    try {
      amountRaw = BigInt(amount.toString()).toString();
    } catch {
      amountRaw = undefined;
    }
  }

  return {
    ...(typeof recipient === 'string' ? { recipient } : {}),
    ...(amountRaw === undefined ? {} : { amountRaw }),
  };
}
