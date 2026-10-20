import { act } from '@testing-library/react';
import { useLocation } from 'react-router-dom';
import { TransactionType } from '@metamask/transaction-controller';
import type { TransactionMeta } from '@metamask/transaction-controller';
import { renderHookWithProvider } from '../../../test/lib/render-helpers-navigate';
import {
  DEFAULT_ROUTE,
  HARDWARE_WALLET_SIGNATURES_ROUTE,
} from '../../helpers/constants/routes';
import { useHardwareWalletNavigation } from './useHardwareWalletNavigation';

describe('useHardwareWalletNavigation', () => {
  it('carries the pending approval to the signing screen and clears it on completion', () => {
    const { result } = renderHookWithProvider(
      () => ({
        ...useHardwareWalletNavigation(),
        location: useLocation(),
      }),
      {},
    );
    const sendBundle = {
      txMeta: {
        id: 'send-transaction',
        type: TransactionType.simpleSend,
      } as TransactionMeta,
      approvalRequestId: 'pending-send-approval',
      needsTwoConfirmations: false,
      sendAmount: '1',
      sendSymbol: 'ETH',
    };

    act(() => result.current.navigateToHwSigningPage({ sendBundle }));

    expect(result.current.location.pathname).toBe(
      HARDWARE_WALLET_SIGNATURES_ROUTE,
    );
    expect(result.current.location.state).toEqual({ sendBundle });

    act(() => result.current.navigateToDefaultRoute());

    expect(result.current.location.pathname).toBe(DEFAULT_ROUTE);
    expect(result.current.location.state).toEqual({
      sendBundle: null,
      stayOnHomePage: true,
    });
  });
});
