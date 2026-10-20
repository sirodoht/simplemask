import React from 'react';
import { isInteractiveUI } from '../../../../shared/lib/environment-type';
import { TransactionEventToastListener } from './transaction-event-toast-listener';

export function ToastListener() {
  const isInteractive = isInteractiveUI();

  if (!isInteractive) {
    return null;
  }

  return (
    <>
      <TransactionEventToastListener />
    </>
  );
}
