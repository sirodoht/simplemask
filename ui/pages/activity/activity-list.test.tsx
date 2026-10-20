import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ActivityListItem } from '../../../shared/lib/activity/types';
import { ScreenViewedEntryPoint } from '../../../shared/constants/metametrics';
import { ActivityList } from './activity-list';

const mockUseTransactionsQuery = jest.fn();
const mockUseActivityScreenViewed = jest.fn();
const mockUseLocalTransactions = jest.fn((): ActivityListItem[] => []);

jest.mock('./useActivityScreenViewed', () => ({
  useActivityScreenViewed: (props: unknown) =>
    mockUseActivityScreenViewed(props),
}));

jest.mock('./useTransactionsQuery', () => ({
  useTransactionsQuery: (...args: unknown[]) =>
    mockUseTransactionsQuery(...args),
}));

jest.mock('./useLocalTransactions', () => ({
  useLocalTransactions: () => mockUseLocalTransactions(),
}));

jest.mock('./useNonEvmTransactions', () => ({
  useNonEvmTransactions: () => [],
}));

jest.mock('./rows/activity-row', () => ({
  ActivityRow: ({
    data,
    onClick,
  }: {
    data: ActivityListItem;
    onClick: () => void;
  }) => (
    <button
      type="button"
      data-testid={`activity-row-${data.type}`}
      data-hash={data.hash}
      onClick={onClick}
    >
      {data.type}
    </button>
  ),
}));

jest.mock('../../hooks/useAnalytics', () => ({
  useAnalytics: () => ({
    trackEvent: jest.fn(),
    createEventBuilder: jest.requireActual(
      '../../../shared/lib/analytics/create-event-builder',
    ).createEventBuilder,
  }),
}));

jest.mock('../../hooks/useRelativeMediumDate', () => ({
  useRelativeMediumDate: () => (timestamp: number) =>
    new Date(timestamp).toISOString(),
}));

jest.mock('../../hooks/useFormatters', () => ({
  useFormatters: () => ({
    formatMediumDate: (timestamp: string | number) =>
      new Date(timestamp).toISOString(),
  }),
}));

jest.mock(
  '../../components/app/assets/asset-list/asset-list-control-bar/asset-list-control-bar',
  () => () => null,
);

jest.mock(
  '../../components/app/pending-transaction-action-buttons/pending-transaction-cancel-speed-up-provider',
  () => ({
    PendingTransactionCancelSpeedUpProvider: ({
      children,
    }: {
      children: React.ReactNode;
    }) => children,
  }),
);

jest.mock('../../components/app/transaction-activity-empty-state', () => ({
  TransactionActivityEmptyState: () => (
    <div data-testid="activity-empty-state">empty</div>
  ),
}));

jest.mock('../details/transaction-details', () => ({
  TransactionDetails: () => null,
}));

describe('ActivityList', () => {
  afterEach(() => {
    jest.clearAllMocks();
    mockUseLocalTransactions.mockReturnValue([]);
    window.history.replaceState(null, '', '/');
  });

  it('shows the activity list skeleton while loading', () => {
    mockUseTransactionsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      fetchNextVisiblePage: jest.fn(),
    });

    render(<ActivityList />);
    expect(screen.getByTestId('activity-list-skeleton')).toBeInTheDocument();
  });

  it('does not show the activity list skeleton when not loading', () => {
    mockUseTransactionsQuery.mockReturnValue({
      data: { pages: [] },
      isLoading: false,
      fetchNextVisiblePage: jest.fn(),
    });

    render(<ActivityList />);
    expect(
      screen.queryByTestId('activity-list-skeleton'),
    ).not.toBeInTheDocument();
  });

  it('passes entry point to useActivityScreenViewed', () => {
    mockUseTransactionsQuery.mockReturnValue({
      data: { pages: [] },
      isLoading: false,
      fetchNextVisiblePage: jest.fn(),
    });

    render(<ActivityList entryPoint={ScreenViewedEntryPoint.BottomNavClick} />);

    expect(mockUseActivityScreenViewed).toHaveBeenCalledWith(
      expect.objectContaining({
        entryPoint: ScreenViewedEntryPoint.BottomNavClick,
      }),
    );
  });

  it('replaces the details hash when another item is opened while details are open', () => {
    const pushStateSpy = jest.spyOn(window.history, 'pushState');
    const replaceStateSpy = jest.spyOn(window.history, 'replaceState');
    mockUseTransactionsQuery.mockReturnValue({
      data: { pages: [] },
      isLoading: false,
      fetchNextVisiblePage: jest.fn(),
    });

    mockUseLocalTransactions.mockReturnValue([
      {
        type: 'send',
        chainId: 'eip155:1',
        status: 'pending',
        timestamp: 2,
        hash: '0xaaa',
        data: { from: '0x1', to: '0x2' },
      },
      {
        type: 'receive',
        chainId: 'eip155:1',
        status: 'success',
        timestamp: 1,
        hash: '0xbbb',
        data: { from: '0x2', to: '0x1' },
      },
    ]);
    render(<ActivityList />);
    fireEvent.click(screen.getByTestId('activity-row-send'));
    fireEvent.click(screen.getByTestId('activity-row-receive'));

    expect(pushStateSpy).toHaveBeenCalledTimes(1);
    expect(pushStateSpy).toHaveBeenCalledWith(null, '', '#/tx/eip155:1/0xaaa');
    expect(replaceStateSpy).toHaveBeenCalledWith(
      null,
      '',
      '#/tx/eip155:1/0xbbb',
    );
    pushStateSpy.mockRestore();
    replaceStateSpy.mockRestore();
  });
});
