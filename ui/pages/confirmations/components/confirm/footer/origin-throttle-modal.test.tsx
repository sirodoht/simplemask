import React from 'react';

import configureStore from 'redux-mock-store';
import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { useOriginThrottling } from '../../../hooks/useOriginThrottling';
import { renderWithProvider } from '../../../../../../test/lib/render-helpers-navigate';
import mockState from '../../../../../../test/data/mock-state.json';
import { MetaMetricsEventLocation } from '../../../../../../shared/constants/metametrics';
import { englishText } from '../../../../../../shared/lib/text';
import OriginThrottleModal from './origin-throttle-modal';

const mockHideModal = jest.fn();
jest.mock('../../../../../hooks/useModalProps', () => ({
  useModalProps: () => ({
    hideModal: mockHideModal,
  }),
}));

jest.mock('../../../hooks/useOriginThrottling');

const renderComponent = (isOpen: boolean, onConfirmationCancel: jest.Mock) => {
  const store = configureStore()(mockState);
  return renderWithProvider(
    <>
      <OriginThrottleModal
        isOpen={isOpen}
        onConfirmationCancel={onConfirmationCancel}
      />
    </>,
    store,
  );
};

describe('OriginThrottleModal', () => {
  const mockUseOriginThrottling = useOriginThrottling as jest.Mock;
  const mockResetOrigin = jest.fn();

  beforeEach(() => {
    mockUseOriginThrottling.mockReturnValue({
      resetOrigin: mockResetOrigin,
    });
  });

  it('renders MultipleRequestContent when isTemporaryBlock is false', () => {
    const onConfirmationCancel = jest.fn();
    renderComponent(true, onConfirmationCancel);

    expect(screen.getByText(englishText.spamModalTitle)).toBeInTheDocument();
    expect(
      screen.getByText(englishText.spamModalDescription),
    ).toBeInTheDocument();
    expect(
      screen.getByText(englishText.spamModalTemporaryBlockButton),
    ).toBeInTheDocument();
  });

  it('renders OriginBlockedContent when isTemporaryBlock is true', () => {
    const onConfirmationCancel = jest.fn();
    renderComponent(true, onConfirmationCancel);

    // Simulate clicking the temporary block button
    fireEvent.click(
      screen.getByText(englishText.spamModalTemporaryBlockButton),
    );

    expect(
      screen.getByText(englishText.spamModalBlockedTitle),
    ).toBeInTheDocument();
    expect(
      screen.getByText(englishText.spamModalBlockedDescription),
    ).toBeInTheDocument();
    expect(screen.getByText(englishText.gotIt)).toBeInTheDocument();
  });

  it('calls onConfirmationCancel and resetOrigin on submit in MultipleRequestContent', () => {
    const onConfirmationCancel = jest.fn();
    renderComponent(true, onConfirmationCancel);

    fireEvent.click(screen.getByText(englishText.cancel));

    expect(onConfirmationCancel).toHaveBeenCalledWith({
      location: MetaMetricsEventLocation.OriginThrottleModal,
    });
    expect(mockResetOrigin).toHaveBeenCalled();
  });

  it('calls onConfirmationCancel on submit in OriginBlockedContent', () => {
    const onConfirmationCancel = jest.fn();
    renderComponent(true, onConfirmationCancel);

    // Simulate clicking the temporary block button
    fireEvent.click(
      screen.getByText(englishText.spamModalTemporaryBlockButton),
    );

    fireEvent.click(screen.getByText(englishText.gotIt));

    expect(onConfirmationCancel).toHaveBeenCalledWith({
      location: MetaMetricsEventLocation.OriginThrottleModal,
    });
  });
});
