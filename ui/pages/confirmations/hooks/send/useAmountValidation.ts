import { useMemo } from 'react';

import { Numeric } from '../../../../../shared/lib/Numeric';
import { getText } from '../../../../helpers/utils/text';
import {
  fromTokenMinUnitsNumeric,
  isValidPositiveNumericString,
  normalizeAmount,
} from '../../utils/send';
import { useSendContext } from '../../context/send';
import { Asset, AssetStandard } from '../../types/send';
import { useBalance } from './useBalance';

export const useAmountValidation = () => {
  const t = getText;
  const { asset, value } = useSendContext();
  const { rawBalanceNumeric } = useBalance();
  const amountError = useMemo(() => {
    if (!value) {
      return undefined;
    }
    const normalizedValue = normalizeAmount(value);
    return (
      validatePositiveNumericString(normalizedValue, t) ||
      validateERC1155Balance(asset as Asset, normalizedValue, t) ||
      validateTokenBalance(
        normalizedValue,
        rawBalanceNumeric,
        asset?.decimals,
        t,
      )
    );
  }, [asset, rawBalanceNumeric, t, value]);
  return { amountError };
};

export function validateERC1155Balance(
  asset: Asset,
  value: string | undefined,
  t: typeof getText,
): string | undefined {
  if (asset?.standard !== AssetStandard.ERC1155) {
    return undefined;
  }

  if (asset?.balance && value) {
    const valueInt = parseInt(value, 10);
    const balanceInt = parseInt(asset.balance.toString(), 10);
    if (valueInt > balanceInt) {
      return t('insufficientFundsSend');
    }
  }

  return undefined;
}

export function validateTokenBalance(
  amount: string,
  rawBalanceNumeric: Numeric,
  decimals: number | undefined,
  t: typeof getText,
): string | undefined {
  const amountInputNumeric = fromTokenMinUnitsNumeric(amount, 10, decimals);
  if (rawBalanceNumeric.lessThan(amountInputNumeric)) {
    return t('insufficientFundsSend');
  }
  return undefined;
}

export function validatePositiveNumericString(
  value: string,
  t: typeof getText,
): string | undefined {
  if (!isValidPositiveNumericString(value)) {
    return t('invalidValue');
  }
  return undefined;
}
