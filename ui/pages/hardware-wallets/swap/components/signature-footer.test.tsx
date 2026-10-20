import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';

import { englishText as messages } from '../../../../../shared/lib/text';
import { HardwareWalletSignatureStatus } from '../hardware-wallet-signatures-state-machine';
import SignatureFooter from './signature-footer';

const renderComponent = (component: React.ReactElement) =>
  render(<>{component}</>);

const BASE_PROPS = {
  isRetryable: false,
  isRetrying: false,
  showStuckRetryButton: false,
  showInlineQrCode: false,
  status: HardwareWalletSignatureStatus.AwaitingFirstSignature,
  handleRetry: jest.fn(() => Promise.resolve()),
  handleCancel: jest.fn(() => Promise.resolve()),
  handleOpenQrSigningPage: jest.fn(),
};

describe('SignatureFooter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders retry button with reconnect label when status is Disconnected and isRetryable is true', () => {
    const { getByTestId } = renderComponent(
      <SignatureFooter
        {...BASE_PROPS}
        isRetryable
        status={HardwareWalletSignatureStatus.Disconnected}
      />,
    );

    expect(
      getByTestId('hardware-wallet-signatures__retry-button').textContent,
    ).toBe(messages.hardwareWalletErrorReconnectButton);
  });

  it('renders retry button with try-again label when isRetryable is true and status is not Disconnected', () => {
    const { getByTestId } = renderComponent(
      <SignatureFooter
        {...BASE_PROPS}
        isRetryable
        status={HardwareWalletSignatureStatus.AwaitingFirstSignature}
      />,
    );

    expect(
      getByTestId('hardware-wallet-signatures__retry-button').textContent,
    ).toBe(messages.errorPageTryAgain);
  });

  it('disables retry button when isRetrying is true', () => {
    const { getByTestId } = renderComponent(
      <SignatureFooter
        {...BASE_PROPS}
        isRetryable
        isRetrying
        status={HardwareWalletSignatureStatus.AwaitingFirstSignature}
      />,
    );

    expect(
      getByTestId('hardware-wallet-signatures__retry-button'),
    ).toBeDisabled();
  });

  it('disables resend button when isRetrying is true', () => {
    const { getByTestId } = renderComponent(
      <SignatureFooter {...BASE_PROPS} showStuckRetryButton isRetrying />,
    );

    expect(
      getByTestId('hardware-wallet-signatures__resend-button'),
    ).toBeDisabled();
  });

  it('renders resend button when showStuckRetryButton is true', () => {
    const { getByTestId } = renderComponent(
      <SignatureFooter {...BASE_PROPS} showStuckRetryButton />,
    );

    expect(
      getByTestId('hardware-wallet-signatures__resend-button'),
    ).toBeDefined();
  });

  it('renders scan button when showInlineQrCode is true and isRetryable is false', () => {
    const { getByTestId } = renderComponent(
      <SignatureFooter {...BASE_PROPS} showInlineQrCode />,
    );

    expect(
      getByTestId('hardware-wallet-signatures__scan-button'),
    ).toBeDefined();
  });

  it('renders scan final label when isFinalSignature is true', () => {
    const { getByTestId } = renderComponent(
      <SignatureFooter {...BASE_PROPS} showInlineQrCode isFinalSignature />,
    );

    expect(
      getByTestId('hardware-wallet-signatures__scan-button').textContent,
    ).toBe(messages.qrHardwareScanSignatureFinal);
  });

  it('renders scan next label when isFinalSignature is false', () => {
    const { getByTestId } = renderComponent(
      <SignatureFooter {...BASE_PROPS} showInlineQrCode />,
    );

    expect(
      getByTestId('hardware-wallet-signatures__scan-button').textContent,
    ).toBe(messages.qrHardwareScanSignatureNext);
  });

  it('always renders cancel button', () => {
    const { getByTestId } = renderComponent(
      <SignatureFooter {...BASE_PROPS} />,
    );

    expect(
      getByTestId('hardware-wallet-signatures__cancel-button'),
    ).toBeDefined();
  });

  it('does not render scan button when isRetryable is true', () => {
    const { queryByTestId } = renderComponent(
      <SignatureFooter
        {...BASE_PROPS}
        showInlineQrCode
        isRetryable
        status={HardwareWalletSignatureStatus.AwaitingFirstSignature}
      />,
    );

    expect(queryByTestId('hardware-wallet-signatures__scan-button')).toBeNull();
  });

  it('calls handleRetry when retry button is clicked', async () => {
    const handleRetry = jest.fn(() => Promise.resolve());
    const { getByTestId } = renderComponent(
      <SignatureFooter
        {...BASE_PROPS}
        handleRetry={handleRetry}
        isRetryable
        status={HardwareWalletSignatureStatus.AwaitingFirstSignature}
      />,
    );

    await act(async () => {
      fireEvent.click(getByTestId('hardware-wallet-signatures__retry-button'));
    });

    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('calls handleCancel when cancel button is clicked', async () => {
    const handleCancel = jest.fn(() => Promise.resolve());
    const { getByTestId } = renderComponent(
      <SignatureFooter {...BASE_PROPS} handleCancel={handleCancel} />,
    );

    await act(async () => {
      fireEvent.click(getByTestId('hardware-wallet-signatures__cancel-button'));
    });

    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  it('calls handleOpenQrSigningPage when scan button is clicked', () => {
    const handleOpenQrSigningPage = jest.fn();
    const { getByTestId } = renderComponent(
      <SignatureFooter
        {...BASE_PROPS}
        showInlineQrCode
        handleOpenQrSigningPage={handleOpenQrSigningPage}
      />,
    );

    fireEvent.click(getByTestId('hardware-wallet-signatures__scan-button'));

    expect(handleOpenQrSigningPage).toHaveBeenCalledTimes(1);
  });
});
