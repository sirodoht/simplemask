import React from 'react';

import configureMockStore from 'redux-mock-store';
import { TransactionStatus } from '@metamask/transaction-controller';
import { renderWithProvider } from '../../../../../../test/lib/render-helpers-navigate';
import { englishText as messages } from '../../../../../../shared/lib/text';
import { TransactionDetailsProvider } from '../transaction-details-context';
import { TransactionDetailsStatusRow } from './transaction-details-status-row';

const mockStore = configureMockStore([]);

const mockState = {
  metamask: {},
};

function createMockTransactionMeta(status: TransactionStatus) {
  return {
    id: 'test-id',
    chainId: '0x1',
    status,
    time: Date.now(),
    txParams: {
      from: '0x123',
      to: '0x456',
    },
  };
}

function render(status: TransactionStatus) {
  return renderWithProvider(
    <TransactionDetailsProvider
      transactionMeta={createMockTransactionMeta(status) as never}
    >
      <TransactionDetailsStatusRow />
    </TransactionDetailsProvider>,
    mockStore(mockState),
  );
}

describe('TransactionDetailsStatusRow', () => {
  it('renders confirmed status', () => {
    const { getByText } = render(TransactionStatus.confirmed);
    expect(getByText(messages.confirmed)).toBeInTheDocument();
  });

  it('renders failed status', () => {
    const { getByText } = render(TransactionStatus.failed);
    expect(getByText(messages.failed)).toBeInTheDocument();
  });

  it('renders pending status for submitted transactions', () => {
    const { getByText } = render(TransactionStatus.submitted);
    expect(getByText(messages.pending)).toBeInTheDocument();
  });

  it('renders with correct test id', () => {
    const { getByTestId } = render(TransactionStatus.confirmed);
    expect(getByTestId('transaction-details-status-row')).toBeInTheDocument();
  });
});
