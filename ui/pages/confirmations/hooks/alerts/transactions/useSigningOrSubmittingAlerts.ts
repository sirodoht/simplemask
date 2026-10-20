import { TransactionMeta } from '@metamask/transaction-controller';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { getApprovedAndSignedTransactions } from '../../../../../selectors';
import { Severity } from '../../../../../helpers/constants/design-system';
import { useI18nContext } from '../../../../../hooks/useI18nContext';
import { Alert } from '../../../../../ducks/confirm-alerts/confirm-alerts';
import { useConfirmContext } from '../../../context/confirm';
import { isCorrectDeveloperTransactionType } from '../../../../../../shared/lib/confirmation.utils';
import { AlertsName } from '../constants';

export function useSigningOrSubmittingAlerts(): Alert[] {
  const t = useI18nContext();
  const { currentConfirmation } = useConfirmContext();
  const { type, chainId, txParams } = (currentConfirmation ?? {}) as
    | TransactionMeta
    | Record<string, never>;
  const from = txParams?.from;

  const signingOrSubmittingTransactions = useSelector(
    getApprovedAndSignedTransactions,
  );

  const isValidType = isCorrectDeveloperTransactionType(type);

  const hasSigningOrSubmittingForCurrentScope = useMemo(() => {
    if (!from) {
      return false;
    }

    const fromLower = from.toLowerCase();

    return signingOrSubmittingTransactions.some(
      (tx: TransactionMeta) =>
        tx.chainId === chainId &&
        tx.txParams?.from?.toLowerCase() === fromLower,
    );
  }, [signingOrSubmittingTransactions, chainId, from]);

  const isSigningOrSubmitting =
    isValidType && hasSigningOrSubmittingForCurrentScope;

  const showAlert = isSigningOrSubmitting;

  return useMemo(() => {
    if (!showAlert) {
      return [];
    }

    return [
      {
        isBlocking: true,
        key: AlertsName.SigningOrSubmitting,
        message: t('isSigningOrSubmitting'),
        severity: Severity.Danger,
      },
    ];
  }, [showAlert, t]);
}
