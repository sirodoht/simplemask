import React from 'react';

import { fireEvent } from '@testing-library/react';
import {
  TransactionMeta,
  TransactionType,
} from '@metamask/transaction-controller';
import {
  getMockConfirmStateForTransaction,
  getMockTokenTransferConfirmState,
} from '../../../../../../test/data/confirmations/helper';
import { genUnapprovedContractInteractionConfirmation } from '../../../../../../test/data/confirmations/contract-interaction';
import { renderWithConfirmContextProvider } from '../../../../../../test/lib/confirmations/render-helpers';
import configureStore from '../../../../../store/store';
import * as ConfirmActions from '../../../hooks/useConfirmActions';
import { getText as tEn } from '../../../../../../shared/lib/text';
import { WalletInitiatedHeader } from './wallet-initiated-header';

const mockHandleShieldSubscriptionApprovalTransactionRejected = jest.fn();

jest.mock('../../../hooks/useHasInsufficientBalance', () => ({
  useHasInsufficientBalance: jest.fn(() => ({
    hasInsufficientBalance: false,
    isNativeBalanceKnown: true,
  })),
}));

/** Build a confirm state for a perpsDeposit transaction. */
const getPerpsDepositState = () => {
  const base = genUnapprovedContractInteractionConfirmation({ chainId: '0x1' });
  return getMockConfirmStateForTransaction({
    ...base,
    type: TransactionType.perpsDeposit,
    origin: 'metamask',
  } as TransactionMeta);
};

/** Build a confirm state for a moneyAccountWithdraw transaction. */
const getMoneyAccountWithdrawState = () => {
  const base = genUnapprovedContractInteractionConfirmation({ chainId: '0x1' });
  return getMockConfirmStateForTransaction({
    ...base,
    type: TransactionType.moneyAccountWithdraw,
    origin: 'metamask',
  } as TransactionMeta);
};

/** Build a confirm state for a perpsWithdraw transaction. */
const getPerpsWithdrawState = () => {
  const base = genUnapprovedContractInteractionConfirmation({ chainId: '0x1' });
  return getMockConfirmStateForTransaction({
    ...base,
    type: TransactionType.perpsWithdraw,
    origin: 'metamask',
  } as TransactionMeta);
};

/** Build a confirm state for a Shield subscription approval transaction. */
const getShieldSubscriptionApprovalState = () => {
  const base = genUnapprovedContractInteractionConfirmation({ chainId: '0x1' });
  return getMockConfirmStateForTransaction({
    ...base,
    type: TransactionType.shieldSubscriptionApprove,
    origin: 'metamask',
  } as TransactionMeta);
};

const render = (state = getMockTokenTransferConfirmState({})) => {
  const store = configureStore(state);
  return renderWithConfirmContextProvider(<WalletInitiatedHeader />, store);
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

describe('<WalletInitiatedHeader />', () => {
  it('should match snapshot', () => {
    const { container } = render();

    expect(container).toMatchSnapshot();
  });

  it('call onCancel from useConfirmActions when back button is pressed', () => {
    const mockOnCancel = jest.fn();
    jest.spyOn(ConfirmActions, 'useConfirmActions').mockImplementation(() => ({
      onCancel: mockOnCancel,
      resetTransactionState: jest.fn(),
    }));
    const { getByTestId } = render(
      getMockTokenTransferConfirmState({ isWalletInitiatedConfirmation: true }),
    );
    fireEvent.click(getByTestId('wallet-initiated-header-back-button'));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('calls onCancel with navigateBackToPreviousPage for musdClaim', () => {
    const mockOnCancel = jest.fn();
    jest.spyOn(ConfirmActions, 'useConfirmActions').mockImplementation(() => ({
      onCancel: mockOnCancel,
      resetTransactionState: jest.fn(),
    }));

    const base = genUnapprovedContractInteractionConfirmation({
      chainId: '0x1',
    });
    const musdClaimState = getMockConfirmStateForTransaction({
      ...base,
      type: TransactionType.musdClaim,
      origin: 'metamask',
    } as TransactionMeta);

    const { getByTestId } = render(musdClaimState);
    fireEvent.click(getByTestId('wallet-initiated-header-back-button'));

    expect(mockOnCancel).toHaveBeenCalledWith({
      location: 'confirmation',
      navigateBackToPreviousPage: true,
    });
  });

  it('shows send as the header title for moneyAccountWithdraw', () => {
    const { getByText } = render(getMoneyAccountWithdrawState());

    expect(getByText(tEn('send'))).toBeInTheDocument();
  });
});
