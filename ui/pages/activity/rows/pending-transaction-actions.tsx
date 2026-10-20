import React, { type MouseEvent as ReactMouseEvent } from 'react';
import type { TransactionMeta } from '@metamask/transaction-controller';
import type { EditGasModes } from '../../../../shared/constants/gas';
import type { TransactionGroup } from '../../../../shared/lib/multichain/types';
import { usePendingTransactionActions } from '../../../hooks/usePendingTransactionActions';
import { PendingTransactionActionButtons } from '../../../components/app/pending-transaction-action-buttons/pending-transaction-action-buttons';

type TransactionMetaWithSmartTransaction = TransactionMeta & {
  isSmartTransaction?: boolean;
};

type TransactionListItemPendingActionsProps = {
  transactionGroup: TransactionGroup;
  isEarliestNonce?: boolean;
  setEditGasMode: (mode: EditGasModes) => void;
  onGasModalMetaId: (metaId: string) => void;
};

export const TransactionListItemPendingActions = ({
  transactionGroup,
  isEarliestNonce = false,
  setEditGasMode,
  onGasModalMetaId,
}: Readonly<TransactionListItemPendingActionsProps>) => {
  const { primaryTransaction, initialTransaction } = transactionGroup;
  const { showCancel, onCancel, speedUp } = usePendingTransactionActions({
    transactionGroup,
    isEarliestNonce,
    setEditGasMode,
    hasIntentBridgeActivity: false,
  });

  if (
    initialTransaction.isSmartTransaction ||
    (primaryTransaction as TransactionMetaWithSmartTransaction)
      .isSmartTransaction
  ) {
    return null;
  }

  if (!showCancel && !speedUp.show) {
    return null;
  }

  const wrapHandler =
    (handler: (event: ReactMouseEvent) => void) => (event: ReactMouseEvent) => {
      onGasModalMetaId(primaryTransaction.id);
      handler(event);
    };

  return (
    <PendingTransactionActionButtons
      showCancel={showCancel}
      onCancel={wrapHandler(onCancel)}
      speedUp={{
        ...speedUp,
        onClick: wrapHandler(speedUp.onClick),
      }}
      className="px-[60px] pb-2"
    />
  );
};
