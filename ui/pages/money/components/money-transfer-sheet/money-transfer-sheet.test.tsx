import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithLocalization } from '../../../../../test/lib/render-helpers-navigate';
import { useMoneyAccountWithdrawal } from '../../../../hooks/money/useMoneyAccountWithdrawal';
import { useMoneyAnalytics } from '../../../../hooks/money/useMoneyAnalytics';
import { createMoneyAnalyticsMock } from '../../../../hooks/money/useMoneyAnalytics.mock';
import {
  MoneyBottomSheetName,
  MoneyComponentName,
  MoneyScreenName,
} from '../../constants/money-events';
import {
  MoneyTransferSheet,
  MONEY_TRANSFER_SHEET_TEST_IDS,
} from './money-transfer-sheet';

jest.mock('../../../../hooks/money/useMoneyAccountWithdrawal');

const mockMoneyAnalytics = createMoneyAnalyticsMock();
jest.mock('../../../../hooks/money/useMoneyAnalytics', () => ({
  useMoneyAnalytics: jest.fn(),
}));
const mockUseMoneyAnalytics = jest.mocked(useMoneyAnalytics);

const useMoneyAccountWithdrawalMock = jest.mocked(useMoneyAccountWithdrawal);

describe('MoneyTransferSheet', () => {
  const onClose = jest.fn();
  const initiateWithdrawal = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMoneyAnalytics.mockReturnValue(mockMoneyAnalytics);
    useMoneyAccountWithdrawalMock.mockReturnValue({
      initiateWithdrawal,
      isLoading: false,
    });
  });

  it('closes and initiates a between-accounts withdrawal', () => {
    renderWithLocalization(<MoneyTransferSheet isOpen onClose={onClose} />);

    fireEvent.click(
      screen.getByTestId(MONEY_TRANSFER_SHEET_TEST_IDS.betweenAccounts),
    );

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(initiateWithdrawal).toHaveBeenCalledTimes(1);
    expect(mockMoneyAnalytics.trackSurfaceClicked).toHaveBeenCalledWith({
      componentName: MoneyComponentName.TransferMoneySheetBetweenAccounts,
      redirectTarget: MoneyScreenName.MoneyTransfer,
    });
  });

  it('tracks the sheet as viewed once when opened', () => {
    const { rerender } = renderWithLocalization(
      <MoneyTransferSheet isOpen onClose={onClose} />,
    );
    rerender(<MoneyTransferSheet isOpen onClose={onClose} />);

    expect(mockUseMoneyAnalytics).toHaveBeenCalledWith({
      bottomSheetName: MoneyBottomSheetName.TransferMoneySheet,
    });
    expect(mockMoneyAnalytics.trackBottomSheetViewed).toHaveBeenCalledTimes(1);
  });
});
