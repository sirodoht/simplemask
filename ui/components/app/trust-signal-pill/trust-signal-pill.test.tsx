import { render as renderComponent, screen } from '@testing-library/react';
import React from 'react';

import { englishText as messages } from '../../../../shared/lib/text';
import { TrustSignalDisplayState } from '../../../hooks/useTrustSignals';
import { TrustSignalPill, getTrustSignalPillConfig } from './trust-signal-pill';

const mockT = (key: string) => {
  const translations: Record<string, string> = {
    securityTrustVerified: 'Verified',
    securityTrustSuspicious: 'Suspicious',
    securityTrustMaliciousDappConnection: 'Malicious',
  };
  return translations[key] || key;
};

describe('TrustSignalPill', () => {
  describe('getTrustSignalPillConfig', () => {
    it('returns verified config for Verified state', () => {
      const config = getTrustSignalPillConfig(
        TrustSignalDisplayState.Verified,
        mockT,
      );
      expect(config).toEqual(
        expect.objectContaining({
          label: 'Verified',
        }),
      );
    });

    it('returns warning config for Warning state', () => {
      const config = getTrustSignalPillConfig(
        TrustSignalDisplayState.Warning,
        mockT,
      );
      expect(config).toEqual(
        expect.objectContaining({
          label: 'Suspicious',
        }),
      );
    });

    it('returns malicious config for Malicious state', () => {
      const config = getTrustSignalPillConfig(
        TrustSignalDisplayState.Malicious,
        mockT,
      );
      expect(config).toEqual(
        expect.objectContaining({
          label: 'Malicious',
        }),
      );
    });

    it('returns null for Unknown state', () => {
      const config = getTrustSignalPillConfig(
        TrustSignalDisplayState.Unknown,
        mockT,
      );
      expect(config).toBeNull();
    });
  });

  describe('component rendering', () => {
    it('renders verified pill with correct content', () => {
      renderComponent(
        <TrustSignalPill state={TrustSignalDisplayState.Verified} />,
      );

      expect(
        screen.getByText(messages.securityTrustVerified),
      ).toBeInTheDocument();
      expect(screen.getByTestId('trust-signal-pill')).toBeInTheDocument();
    });

    it('renders warning pill with correct content', () => {
      renderComponent(
        <TrustSignalPill state={TrustSignalDisplayState.Warning} />,
      );

      expect(
        screen.getByText(messages.securityTrustSuspicious),
      ).toBeInTheDocument();
    });

    it('renders malicious pill with correct content', () => {
      renderComponent(
        <TrustSignalPill state={TrustSignalDisplayState.Malicious} />,
      );

      expect(
        screen.getByText(messages.securityTrustMaliciousDappConnection),
      ).toBeInTheDocument();
    });

    it('renders nothing for unknown state', () => {
      const { container } = renderComponent(
        <TrustSignalPill state={TrustSignalDisplayState.Unknown} />,
      );

      expect(container.firstChild).toBeNull();
    });

    it('uses custom testId when provided', () => {
      renderComponent(
        <TrustSignalPill
          state={TrustSignalDisplayState.Verified}
          testId="custom-test-id"
        />,
      );

      expect(screen.getByTestId('custom-test-id')).toBeInTheDocument();
    });
  });
});
