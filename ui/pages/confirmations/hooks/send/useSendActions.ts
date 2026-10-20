import { Hex } from '@metamask/utils';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  CONFIRM_TRANSACTION_ROUTE,
  DEFAULT_ROUTE,
} from '../../../../helpers/constants/routes';
import { useInAppBack } from '../../../../hooks/useInAppBack';
import { setMaxValueMode } from '../../../../ducks/send-max-value/send-max-value';
import { ConfirmationLoader } from '../useConfirmationNavigation';
import { normalizeAmount, submitEvmTransaction } from '../../utils/send';
import { useSendContext } from '../../context/send';
import { useDispatch } from '../../../../store/hooks';
import { useSendType } from './useSendType';

export const useSendActions = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    asset,
    chainId,
    from,
    hexData,
    maxValueMode,
    toResolved: to,
    value,
  } = useSendContext();
  const { isEvmSendType } = useSendType();
  const handleBack = useInAppBack(DEFAULT_ROUTE);

  const handleSubmit = useCallback(async () => {
    if (!asset) {
      return;
    }
    const toAddress = to;
    if (!isEvmSendType) {
      throw new Error('Only EVM transactions are supported');
    }
    {
      const transactionPromise = dispatch(
        await submitEvmTransaction({
          asset,
          chainId: chainId as Hex,
          from: from as Hex,
          hexData: hexData as Hex,
          to: toAddress as Hex,
          value: normalizeAmount(value),
        }),
      );
      const params = new URLSearchParams();
      params.set('loader', ConfirmationLoader.Send);
      const route = `${CONFIRM_TRANSACTION_ROUTE}?${params.toString()}`;
      navigate(route);

      const transactionMeta = await transactionPromise;

      if (maxValueMode && transactionMeta) {
        dispatch(
          setMaxValueMode({
            transactionId: transactionMeta.id,
            enabled: true,
          }),
        );
      }
    }
  }, [
    asset,
    chainId,
    dispatch,
    from,
    hexData,
    navigate,
    isEvmSendType,
    maxValueMode,
    to,
    value,
  ]);

  const handleCancel = useCallback(() => {
    navigate(DEFAULT_ROUTE);
  }, [navigate]);

  return { handleSubmit, handleCancel, handleBack };
};
