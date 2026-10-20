import React from 'react';

import { screen } from '@testing-library/react';
import { renderWithProvider } from '../../../../../test/lib/render-helpers-navigate';
import { englishText as messages } from '../../../../../shared/lib/text';
import SnapPrivacyWarning from './snap-privacy-warning';

describe('Snap Privacy Warning Popover', () => {
  it('renders snaps privacy warning popover and works with accept flow', () => {
    const mockOnAcceptCallback = jest.fn();
    renderWithProvider(
      <SnapPrivacyWarning
        onAccepted={mockOnAcceptCallback}
        onCanceled={jest.fn()}
      />,
    );

    expect(screen.getByText(messages.thirdPartySoftware)).toBeInTheDocument();
    expect(
      screen.getByText(messages.snapsPrivacyWarningSecondMessage),
    ).toBeInTheDocument();
    expect(
      screen.getByText(messages.snapsPrivacyWarningThirdMessage),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: /Accept/iu,
      }),
    ).toBeInTheDocument();
    screen
      .getByRole('button', {
        name: /Accept/iu,
      })
      .click();
    expect(mockOnAcceptCallback).toHaveBeenCalled();
  });

  it('renders snaps privacy warning popover and works with cancel flow', () => {
    const mockOnAcceptCallback = jest.fn();
    const mockOnCanceledCallback = jest.fn();
    renderWithProvider(
      <SnapPrivacyWarning
        onAccepted={mockOnAcceptCallback}
        onCanceled={mockOnCanceledCallback}
      />,
    );

    expect(screen.getByText(messages.thirdPartySoftware)).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: /Cancel/iu,
      }),
    ).toBeInTheDocument();
    screen
      .getByRole('button', {
        name: /Cancel/iu,
      })
      .click();
    expect(mockOnCanceledCallback).toHaveBeenCalled();
    expect(mockOnAcceptCallback).not.toHaveBeenCalled();
  });
});
