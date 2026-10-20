import React from 'react';
import { useLocation } from 'react-router-dom';
import { FeatureId } from '@metamask/bridge-controller';
import configureStore from '../../store/store';
import { renderWithProvider } from '../../../test/lib/render-helpers-navigate';
import mockState from '../../../test/data/mock-state.json';
import { getEnvironmentType } from '../../../shared/lib/environment-type';
import { ENVIRONMENT_TYPE_POPUP } from '../../../shared/constants/app';
import {
  CONFIRM_TRANSACTION_ROUTE,
  DEFAULT_ROUTE,
  HARDWARE_WALLET_SIGNATURES_ROUTE,
} from '../../helpers/constants/routes';
import { ConfirmationRouter } from './confirmation-router';

jest.mock('../../../shared/lib/environment-type', () => ({
  ...jest.requireActual('../../../shared/lib/environment-type'),
  getEnvironmentType: jest.fn(),
}));

const SWAP_ROUTE = `${'/cross-chain'}${'/swaps/prepare-bridge-page'}`;
const PENDING_APPROVAL_ID = 'testApprovalId';

const PathnameDisplay = () => {
  const { pathname } = useLocation();
  return <div data-testid="pathname">{pathname}</div>;
};

// A leftover batch-sell quote carries `featureId: 'batch_sell'`, which is what
// distinguishes it from a real in-progress swap quote.
const getMockQuotes = ({
  hasQuotes,
  hasBatchSellQuotes,
}: {
  hasQuotes: boolean;
  hasBatchSellQuotes: boolean;
}) => {
  if (hasBatchSellQuotes) {
    return [{ featureId: FeatureId.BATCH_SELL }];
  }
  return hasQuotes ? [{}] : [];
};

const renderConfirmationRouter = ({
  pathname,
  hasQuotes = false,
  hasBatchSellQuotes = false,
  hasPendingApproval = false,
  environmentType = ENVIRONMENT_TYPE_POPUP,
}: {
  pathname: string;
  hasQuotes?: boolean;
  hasBatchSellQuotes?: boolean;
  hasPendingApproval?: boolean;
  environmentType?: string;
}) => {
  (getEnvironmentType as jest.Mock).mockReturnValue(environmentType);

  const store = configureStore({
    ...mockState,
    metamask: {
      ...mockState.metamask,
      ...(hasPendingApproval
        ? {}
        : { pendingApprovals: {}, pendingApprovalCount: 0, approvalFlows: [] }),
      // Batch sell fetches quotes through the bridge controller, so they land in
      // the same state that drives the swap redirect. A single entry is enough.
      // A leftover batch-sell quote carries `featureId: 'batch_sell'`, which is
      // what distinguishes it from a real in-progress swap quote.
      quotes: getMockQuotes({ hasQuotes, hasBatchSellQuotes }),
    },
  });

  return renderWithProvider(
    <>
      <ConfirmationRouter />
      <PathnameDisplay />
    </>,
    store,
    pathname,
  );
};

describe('ConfirmationRouter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('with a pending approval', () => {
    it('keeps the hardware signing page open for its pending approval', () => {
      const { getByTestId } = renderConfirmationRouter({
        pathname: HARDWARE_WALLET_SIGNATURES_ROUTE,
        hasPendingApproval: true,
      });

      expect(getByTestId('pathname').textContent).toBe(
        HARDWARE_WALLET_SIGNATURES_ROUTE,
      );
    });

    it('navigates to the confirmation from a non-exempted route', () => {
      const { getByTestId } = renderConfirmationRouter({
        pathname: DEFAULT_ROUTE,
        hasPendingApproval: true,
      });

      expect(getByTestId('pathname').textContent).toBe(
        `${CONFIRM_TRANSACTION_ROUTE}/${PENDING_APPROVAL_ID}`,
      );
    });

    it('shows pending approvals when the previous route was retired', () => {
      const { getByTestId } = renderConfirmationRouter({
        pathname: '/batch-sell/review',
        hasPendingApproval: true,
      });

      expect(getByTestId('pathname').textContent).toBe(
        `${CONFIRM_TRANSACTION_ROUTE}/${PENDING_APPROVAL_ID}`,
      );
    });
  });
});
