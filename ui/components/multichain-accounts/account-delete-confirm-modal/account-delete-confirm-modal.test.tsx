import React from 'react';

import { fireEvent, screen } from '@testing-library/react';

import configureStore from '../../../store/store';
import { renderWithProvider } from '../../../../test/lib/render-helpers-navigate';
import { englishText as messages } from '../../../../shared/lib/text';
import { AccountDeleteConfirmModal } from './account-delete-confirm-modal';

describe('AccountDeleteConfirmModal', () => {
  const defaultProps = {
    isOpen: true,
    accountName: 'Imported Account 1',
    onClose: jest.fn(),
    onConfirm: jest.fn(),
  };

  const renderComponent = (props = {}) => {
    const store = configureStore({});
    return renderWithProvider(
      <AccountDeleteConfirmModal {...defaultProps} {...props} />,
      store,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title, description, and action buttons when open', () => {
    renderComponent();

    expect(
      screen.getByTestId('account-delete-confirm-modal-warning-icon'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        messages.removeAccountConfirmTitle.replace('$1', 'Imported Account 1'),
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(messages.removeAccountConfirmDescription),
    ).toBeInTheDocument();
    expect(screen.getByText(messages.cancel)).toBeInTheDocument();
    expect(screen.getByText(messages.remove)).toBeInTheDocument();
  });

  it('renders remove above cancel', () => {
    renderComponent();

    const removeButton = screen.getByTestId(
      'account-delete-confirm-modal-remove-button',
    );
    const cancelButton = screen.getByTestId(
      'account-delete-confirm-modal-cancel-button',
    );

    const buttonsInDomOrder = screen.getAllByRole('button');

    expect(buttonsInDomOrder.indexOf(removeButton)).toBeLessThan(
      buttonsInDomOrder.indexOf(cancelButton),
    );
  });

  it('does not render when isOpen is false', () => {
    renderComponent({ isOpen: false });

    expect(
      screen.queryByTestId('account-delete-confirm-modal'),
    ).not.toBeInTheDocument();
  });

  it('calls onClose when Cancel is clicked', () => {
    renderComponent();

    fireEvent.click(
      screen.getByTestId('account-delete-confirm-modal-cancel-button'),
    );

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    expect(defaultProps.onConfirm).not.toHaveBeenCalled();
  });

  it('calls onConfirm when Remove is clicked', () => {
    renderComponent();

    fireEvent.click(
      screen.getByTestId('account-delete-confirm-modal-remove-button'),
    );

    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });
});
