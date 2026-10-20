import { getText } from './text';

export type TransactionStatus = 'pending' | 'success' | 'failed';

const statusMessageKeys: Record<TransactionStatus, string> = {
  pending: 'transactionSubmitted',
  success: 'transactionConfirmed',
  failed: 'transactionFailed',
};

export function useTransactionDisplay(status: TransactionStatus) {
  const t = getText;
  return { title: t(statusMessageKeys[status]) };
}
