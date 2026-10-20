import { render as renderComponent, fireEvent } from '@testing-library/react';
import React from 'react';

import { englishText as messages } from '../../../../shared/lib/text';
import ZENDESK_URLS from '../../../helpers/constants/zendesk-url';
import ChangePasswordWarning from './change-password-warning';

describe('ChangePasswordWarning', () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function renderWarning() {
    return renderComponent(
      <ChangePasswordWarning
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />,
    );
  }

  it('renders the warning modal with title, description, and action buttons', () => {
    const { getByTestId, getByText } = renderWarning();

    expect(getByTestId('change-password-warning-modal')).toBeInTheDocument();
    expect(getByText(messages.changePasswordWarning)).toBeInTheDocument();
    expect(
      getByText(messages.changePasswordWarningDescription, {
        exact: false,
      }),
    ).toBeInTheDocument();
    expect(getByTestId('change-password-warning-cancel')).toBeInTheDocument();
    expect(getByTestId('change-password-warning-confirm')).toBeInTheDocument();
  });

  it('renders a learn more link pointing to the password reset article', () => {
    const { getByRole } = renderWarning();

    const learnMoreLink = getByRole('link', {
      name: messages.learnMoreUpperCase,
    });
    expect(learnMoreLink).toBeInTheDocument();
    expect(learnMoreLink).toHaveAttribute('href', ZENDESK_URLS.PASSWORD_RESET);
  });

  it('calls onCancel when the cancel button is clicked', () => {
    const { getByTestId } = renderWarning();

    fireEvent.click(getByTestId('change-password-warning-cancel'));

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('calls onConfirm when the confirm button is clicked', () => {
    const { getByTestId } = renderWarning();

    fireEvent.click(getByTestId('change-password-warning-confirm'));

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnCancel).not.toHaveBeenCalled();
  });
});
