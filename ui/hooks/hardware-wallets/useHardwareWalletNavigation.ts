import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { TransactionMeta } from '@metamask/transaction-controller';
import {
  DEFAULT_ROUTE,
  HARDWARE_WALLET_SIGNATURES_ROUTE,
} from '../../helpers/constants/routes';

export type HardwareWalletSendState = {
  txMeta: TransactionMeta;
  needsTwoConfirmations: boolean;
  returnRoute?: string;
  /** The signing screen must verify this approval is still pending. */
  approvalRequestId: string;
  sendAmount?: string;
  sendSymbol?: string;
  gasSymbol?: string;
};

/**
 * Navigate between wallet sends and their hardware signing screen.
 *
 * @returns Navigation callbacks that carry the pending send approval.
 */
export function useHardwareWalletNavigation() {
  const navigate = useNavigate();

  const navigateToHwSigningPage = useCallback(
    ({ sendBundle }: { sendBundle: HardwareWalletSendState }) => {
      navigate(HARDWARE_WALLET_SIGNATURES_ROUTE, {
        replace: true,
        state: { sendBundle },
      });
    },
    [navigate],
  );

  const navigateToDefaultRoute = useCallback(() => {
    navigate(DEFAULT_ROUTE, {
      replace: true,
      state: { sendBundle: null, stayOnHomePage: true },
    });
  }, [navigate]);

  return { navigateToHwSigningPage, navigateToDefaultRoute };
}
