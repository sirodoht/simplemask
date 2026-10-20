import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { type TransactionMeta } from '@metamask/transaction-controller';

import {
  UNLOCK_ROUTE,
  CONNECT_ROUTE,
  CONFIRMATION_V_NEXT_ROUTE,
  CONFIRM_TRANSACTION_ROUTE,
  HARDWARE_WALLET_SIGNATURES_ROUTE,
  CONFIRM_ADD_SUGGESTED_TOKEN_ROUTE,
  SHIELD_PLAN_ROUTE,
  TRANSACTION_SHIELD_ROUTE,
} from '../../helpers/constants/routes';
import { getConfirmationRoute } from '../confirmations/hooks/useConfirmationNavigation';
import { getEnvironmentType } from '../../../shared/lib/environment-type';
import {
  ENVIRONMENT_TYPE_FULLSCREEN,
  SNAP_MANAGE_ACCOUNTS_CONFIRMATION_TYPES,
} from '../../../shared/constants/app';
import {
  getTransactions,
  selectHasApprovalFlows,
  selectPendingApprovalsForNavigation,
} from '../../selectors';
import { useModalState } from '../../hooks/useModalState';
import { isMusdConversionTransaction } from '../../components/app/musd/utils';

const EXEMPTED_ROUTES = [
  UNLOCK_ROUTE,
  CONNECT_ROUTE,
  CONFIRMATION_V_NEXT_ROUTE,
  CONFIRM_TRANSACTION_ROUTE,
  HARDWARE_WALLET_SIGNATURES_ROUTE,
  CONFIRM_ADD_SUGGESTED_TOKEN_ROUTE,
  SHIELD_PLAN_ROUTE,
  TRANSACTION_SHIELD_ROUTE,
];

const SNAP_APPROVAL_TYPES = [
  'wallet_installSnapResult',
  SNAP_MANAGE_ACCOUNTS_CONFIRMATION_TYPES.confirmAccountCreation,
  SNAP_MANAGE_ACCOUNTS_CONFIRMATION_TYPES.confirmAccountRemoval,
  SNAP_MANAGE_ACCOUNTS_CONFIRMATION_TYPES.showSnapAccountRedirect,
];

export const ConfirmationRouter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;
  const { closeModals } = useModalState();

  const envType = getEnvironmentType();
  const isFullscreen = envType === ENVIRONMENT_TYPE_FULLSCREEN;
  const pendingApprovals = useSelector(selectPendingApprovalsForNavigation);
  const hasApprovalFlows = useSelector(selectHasApprovalFlows);
  const transactions = useSelector(getTransactions) as TransactionMeta[];

  // Ported from home.component - checkStatusAndNavigate()
  const checkStatusAndNavigate = useCallback(() => {
    if (pendingApprovals.length || hasApprovalFlows) {
      const url = getConfirmationRoute(
        pendingApprovals?.[0]?.id,
        pendingApprovals,
        hasApprovalFlows,
        '',
      );

      if (url) {
        closeModals();
        navigate(url, { replace: true });
      }
    }
  }, [closeModals, hasApprovalFlows, navigate, pendingApprovals]);

  // Runs on all routes (not just home), so skip navigation on exempted routes
  const isExemptedRoute = EXEMPTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  // Ported from home.component - hasAllowedPopupRedirectApprovals()
  const hasAllowedPopupRedirectApprovals = pendingApprovals.some((approval) =>
    SNAP_APPROVAL_TYPES.includes(approval.type),
  );

  const isMUSDConversionTransaction = pendingApprovals.some(
    (approval) =>
      transactions.find(
        (tx) =>
          isMusdConversionTransaction(tx) &&
          tx.id === approval?.requestData?.txId,
      ),
    [transactions, pendingApprovals],
  );

  const isFullscreenExemption =
    isFullscreen &&
    !hasAllowedPopupRedirectApprovals &&
    !isMUSDConversionTransaction;

  // Ported from home.component - componentDidUpdate()
  useEffect(() => {
    if (isExemptedRoute) {
      return;
    }

    if (isFullscreenExemption) {
      return;
    }

    checkStatusAndNavigate();
  }, [checkStatusAndNavigate, isExemptedRoute, isFullscreenExemption]);

  return null;
};
