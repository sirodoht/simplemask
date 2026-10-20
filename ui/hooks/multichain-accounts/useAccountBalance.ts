import { useSelector } from 'react-redux';
import { useCallback } from 'react';
import { formatWithThreshold } from '../../components/app/assets/util/formatWithThreshold';
import { getCurrentCurrency } from '../../ducks/metamask/metamask';

export function useDisplayBalanceCalc() {
  const fallbackCurrency = useSelector(getCurrentCurrency);
  const locale = 'en';

  const displayBalanceCalc = useCallback(
    (balance: number = 0, currency: string = fallbackCurrency) => {
      const displayBalance = formatWithThreshold(balance, 0.01, locale, {
        style: 'currency',
        currency,
      });

      return displayBalance;
    },
    [fallbackCurrency, locale],
  );

  return displayBalanceCalc;
}
