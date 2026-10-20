import React from 'react';
import { render, screen } from '@testing-library/react';
import { ToastListener } from './toast-listener';

const mockIsInteractiveUI = jest.fn();
jest.mock('../../../../shared/lib/environment-type', () => ({
  isInteractiveUI: () => mockIsInteractiveUI(),
}));
jest.mock('./transaction-event-toast-listener', () => ({
  TransactionEventToastListener: () => (
    <div data-testid="transaction-status-listener" />
  ),
}));

describe('ToastListener', () => {
  it('keeps transaction status notifications in interactive UI', () => {
    mockIsInteractiveUI.mockReturnValue(true);
    render(<ToastListener />);
    expect(
      screen.getByTestId('transaction-status-listener'),
    ).toBeInTheDocument();
  });

  it('does not mount listeners in non-interactive UI', () => {
    mockIsInteractiveUI.mockReturnValue(false);
    render(<ToastListener />);
    expect(
      screen.queryByTestId('transaction-status-listener'),
    ).not.toBeInTheDocument();
  });
});
