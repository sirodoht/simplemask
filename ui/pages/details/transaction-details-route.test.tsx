import React from 'react';

import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';
import { englishText as messages } from '../../../shared/lib/text';
import { ACTIVITY_TAB_ROUTE } from '../../hooks/useActivityHomeRoute';
import { PREVIOUS_ROUTE } from '../../helpers/constants/routes';
import TransactionDetailsRoute from './transaction-details-route';

const mockNavigate = jest.fn();
const mockUseLocation = jest.fn();

jest.mock('react-router-dom', () => ({
  Navigate: ({ to }: { to: string }) => <div>{to}</div>,
  useLocation: () => mockUseLocation(),
  useNavigate: () => mockNavigate,
  useParams: () => ({
    caipChainId: 'eip155:1',
    txIdentifier: 'transaction-1',
  }),
}));

jest.mock('../../hooks/useActivityHomeRoute', () => {
  const actual = jest.requireActual(
    '../../hooks/useActivityHomeRoute',
  ) as typeof import('../../hooks/useActivityHomeRoute');
  return {
    ...actual,
    useActivityHomeRoute: () => actual.ACTIVITY_TAB_ROUTE,
  };
});

jest.mock('./transaction-details', () => ({
  TransactionDetails: ({ onBack }: { onBack: () => void }) => {
    const { englishText: enLocale } = jest.requireActual(
      '../../../shared/lib/text',
    ) as typeof import('../../../shared/lib/text');
    return <button onClick={onBack}>{enLocale.back}</button>;
  },
}));

describe('TransactionDetailsRoute', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('navigates through history when opened from another in-app route', () => {
    mockUseLocation.mockReturnValue({ key: 'in-app-entry' });
    render(<TransactionDetailsRoute />);

    fireEvent.click(screen.getByRole('button', { name: messages.back }));

    expect(mockNavigate).toHaveBeenCalledWith(PREVIOUS_ROUTE);
  });

  it('navigates to activity when opened directly', () => {
    mockUseLocation.mockReturnValue({ key: 'default' });
    render(<TransactionDetailsRoute />);

    fireEvent.click(screen.getByRole('button', { name: messages.back }));

    expect(mockNavigate).toHaveBeenCalledWith(ACTIVITY_TAB_ROUTE, {
      replace: true,
      state: { fromFreshTab: true },
    });
  });
});
