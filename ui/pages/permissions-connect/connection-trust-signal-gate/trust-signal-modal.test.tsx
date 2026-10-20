import React from 'react';

import { render, fireEvent } from '@testing-library/react';

import { englishText as messages } from '../../../../shared/lib/text';
import { TrustSignalModal } from '../../../components/app/trust-signal-modal/trust-signal-modal';

const MOCK_I18N: Record<string, string> = {
  continueAtYourOwnRisk: messages.continueAtYourOwnRisk,
  trustSignalPhishingWarning: messages.trustSignalPhishingWarning,
  connectAnyway: messages.connectAnyway,
  cancel: messages.cancel,
  close: messages.close,
};

jest.mock('../../../helpers/utils/text', () => ({
  getText: (key: string) => MOCK_I18N[key] ?? key,
}));

describe('TrustSignalModal', () => {
  const defaultProps = {
    onContinue: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the modal', () => {
    const { getByTestId } = render(<TrustSignalModal {...defaultProps} />);

    expect(getByTestId('trust-signal-block-modal')).toBeInTheDocument();
  });

  it('shows "Continue at your own risk" title', () => {
    const { getByText } = render(<TrustSignalModal {...defaultProps} />);

    expect(getByText(messages.continueAtYourOwnRisk)).toBeInTheDocument();
  });

  it('calls onContinue when "Connect anyway" is clicked', () => {
    const { getByTestId } = render(<TrustSignalModal {...defaultProps} />);

    fireEvent.click(getByTestId('trust-signal-block-modal-continue'));
    expect(defaultProps.onContinue).toHaveBeenCalledTimes(1);
  });

  it('renders cancel button', () => {
    const { getByTestId } = render(<TrustSignalModal {...defaultProps} />);

    expect(getByTestId('trust-signal-block-modal-cancel')).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', () => {
    const { getByTestId } = render(<TrustSignalModal {...defaultProps} />);

    fireEvent.click(getByTestId('trust-signal-block-modal-cancel'));
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });
});
