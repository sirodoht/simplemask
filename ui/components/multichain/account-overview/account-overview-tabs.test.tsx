import React from 'react';
import { screen } from '@testing-library/react';
import mockState from '../../../../test/data/mock-state.json';
import configureStore from '../../../store/store';
import { renderWithProvider } from '../../../../test/lib/render-helpers-navigate';
import { CHAIN_IDS } from '../../../../shared/constants/network';
import { AccountOverviewTabs } from './account-overview-tabs';

const mockTrackEvent = jest.fn();

jest.mock('../../../hooks/useAnalytics', () => {
  const { createEventBuilder } = jest.requireActual(
    '../../../../shared/lib/analytics/create-event-builder',
  );

  return {
    useAnalytics: () => ({
      trackEvent: mockTrackEvent,
      createEventBuilder,
    }),
  };
});

jest.mock('../../../store/actions', () => ({
  setDefaultHomeActiveTabName: jest.fn(),
  detectNfts: jest.fn(() => ({ type: 'MOCK_DETECT_NFTS' })),
  setPerpsTabBadgeSeen: jest.fn(() => () => Promise.resolve()),
}));

jest.mock('../../app/assets/asset-list', () => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __esModule: true,
  default: () => null,
}));

jest.mock('../../../pages/activity/activity-list', () => ({
  ActivityList: () => null,
}));

jest.mock('../../../pages/activity/useTransactionsQuery', () => ({
  usePrefetchTransactions: () => jest.fn(),
}));

jest.mock('../../app/assets/nfts/nfts-tab', () => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __esModule: true,
  default: () => null,
}));

jest.mock('../../app/assets/defi-list/defi-tab', () => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __esModule: true,
  default: () => null,
}));

beforeEach(() => {
  jest.clearAllMocks();
});

// Old remote flags must not restore the removed product.
it('renders wallet tabs without Perps even when old feature flags enable it', () => {
  const store = configureStore({
    metamask: {
      ...mockState.metamask,
      enabledNetworkMap: { eip155: { [CHAIN_IDS.MAINNET]: true } },
      remoteFeatureFlags: {
        perpsEnabledVersion: { enabled: true, minimumVersion: '0.0.0' },
      },
    },
  });
  renderWithProvider(
    <AccountOverviewTabs
      setBasicFunctionalityModalOpen={jest.fn()}
      onSupportLinkClick={jest.fn()}
    />,
    store,
  );
  expect(screen.getByTestId('account-overview__asset-tab')).toBeInTheDocument();
  expect(
    screen.queryByTestId('account-overview__perps-tab'),
  ).not.toBeInTheDocument();
});
