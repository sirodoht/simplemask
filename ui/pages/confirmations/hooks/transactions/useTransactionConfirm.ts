import {
  TransactionMeta,
  TransactionType,
} from '@metamask/transaction-controller';
import { cloneDeep } from 'lodash';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { getCustomNonceValue } from '../../../../selectors';
import { useConfirmContext } from '../../context/confirm';
import { useSelectedGasFeeToken } from '../../components/confirm/info/hooks/useGasFeeToken';
import { updateAndApproveTx } from '../../../../store/actions';
import { useIsGaslessSupported } from '../gas/useIsGaslessSupported';
import { useGaslessSupportedSmartTransactions } from '../gas/useGaslessSupportedSmartTransactions';
import { useGasSponsorshipPreference } from '../gas/useGasSponsorshipPreference';
import {
  isHardwareWalletError,
  isUserRejectedHardwareWalletError,
  useHardwareWalletError,
} from '../../../../contexts/hardware-wallets';
import { useSendBundleHwNavigation } from '../../../../hooks/hardware-wallets/useSendBundleHwNavigation';
import { useDispatch } from '../../../../store/hooks';
import { useIsHardwareWalletAccount } from '../../../../hooks/useIsHardwareWalletAccount';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import { useTransactionPayingAccount } from './useTransactionPayingAccount';

export function useTransactionConfirm() {
  const dispatch = useDispatch();
  const t = useI18nContext();
  const { showErrorModal } = useHardwareWalletError();
  const customNonceValue = useSelector(getCustomNonceValue);
  const selectedGasFeeToken = useSelectedGasFeeToken();
  const { currentConfirmation: transactionMeta, isAmountPending } =
    useConfirmContext<TransactionMeta>();
  const payingAccount = useTransactionPayingAccount();
  const isPayingWithHardwareWallet = useIsHardwareWalletAccount(payingAccount);

  const { isSupported: isGaslessSupportedSTX } =
    useGaslessSupportedSmartTransactions();
  const { isSupported: isGaslessSupported } = useIsGaslessSupported();
  const { isSponsorshipOptedOut } = useGasSponsorshipPreference(
    transactionMeta?.chainId,
  );
  const { shouldRedirectToHwSigningPage, redirectToHwSigningPage } =
    useSendBundleHwNavigation({ transactionMeta });

  const handleSmartTransaction = useCallback(
    (tx: TransactionMeta) => {
      if (!selectedGasFeeToken) {
        return;
      }

      tx.batchTransactions = [
        {
          ...selectedGasFeeToken.transferTransaction,
          type: TransactionType.gasPayment,
        },
      ];

      tx.txParams.gas = selectedGasFeeToken.gas;
      tx.txParams.maxFeePerGas = selectedGasFeeToken.maxFeePerGas;

      tx.txParams.maxPriorityFeePerGas =
        selectedGasFeeToken.maxPriorityFeePerGas;
    },
    [selectedGasFeeToken],
  );

  const handleGasless7702 = useCallback((tx: TransactionMeta) => {
    tx.isExternalSign = true;
  }, []);

  const onTransactionConfirm = useCallback(async (): Promise<boolean> => {
    // The field can already show the new amount while publish would still
    // execute the previous quote. The footer blocks the click; this covers
    // any other confirm path.
    if (isAmountPending) {
      return false;
    }

    const txToApprove = cloneDeep(transactionMeta);

    txToApprove.customNonceValue = customNonceValue;

    // If the gasless flow is not supported (e.g. stx is disabled by the user,
    // or 7702 is not supported in the chain), or the user has opted out of
    // gas sponsorship, we override the `isGasFeeSponsored` flag to `false` so
    // the transaction meta object in state has the correct value for the
    // transaction details on the activity list to not show as sponsored. One
    // limitation on the activity list will be that pre-populated transactions
    // on fresh installs will not show as sponsored even if they were because
    // this is not easily observable onchain for all cases.
    //
    // Money Account withdrawals are sponsored on Monad by design (the money
    // account has no native MON). `useIsGaslessSupported` can disagree with
    // the 7702 publish hook; clearing the flag here made the hook skip and
    // published the parent `execute()` instead — which mines and moves
    // nothing when that parent is still the empty placeholder.
    txToApprove.isGasFeeSponsored =
      isGaslessSupported &&
      transactionMeta.isGasFeeSponsored &&
      !isSponsorshipOptedOut;
    const shouldClearExternalSign =
      transactionMeta.isExternalSign &&
      (!isGaslessSupported ||
        isSponsorshipOptedOut ||
        shouldRedirectToHwSigningPage);
    if (shouldClearExternalSign) {
      txToApprove.isExternalSign = false;
    }

    if (isGaslessSupportedSTX) {
      handleSmartTransaction(txToApprove);
    } else if (selectedGasFeeToken) {
      handleGasless7702(txToApprove);
    }

    if (shouldRedirectToHwSigningPage) {
      redirectToHwSigningPage(txToApprove);
      return false;
    }
    try {
      await dispatch(
        updateAndApproveTx(
          txToApprove,
          !isPayingWithHardwareWallet,
          isPayingWithHardwareWallet ? t('swapConfirmWithHwWallet') : '',
          payingAccount,
        ),
      );
      return true;
    } catch (error) {
      if (!isHardwareWalletError(error)) {
        // Non-hardware wallet errors - just rethrow
        throw error;
      }
      if (isUserRejectedHardwareWalletError(error)) {
        // User intentionally rejected on device; do not show hardware error modal.
        return false;
      }
      showErrorModal(error);
      return false;
    }
  }, [
    handleGasless7702,
    handleSmartTransaction,
    customNonceValue,
    dispatch,
    isAmountPending,
    isGaslessSupported,
    isGaslessSupportedSTX,
    isPayingWithHardwareWallet,
    isSponsorshipOptedOut,
    payingAccount,
    redirectToHwSigningPage,
    selectedGasFeeToken,
    shouldRedirectToHwSigningPage,
    showErrorModal,
    transactionMeta,
    t,
  ]);

  return {
    onTransactionConfirm,
  };
}
