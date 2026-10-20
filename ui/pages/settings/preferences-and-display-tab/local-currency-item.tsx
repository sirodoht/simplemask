import React from 'react';

import { useSelector } from 'react-redux';
import { getText } from '../../../helpers/utils/text';
import { getCurrentCurrency } from '../../../ducks/metamask/metamask';
import { CURRENCY_ROUTE } from '../../../helpers/constants/routes';
import { SettingsSelectItem } from '../shared';
import { PREFERENCES_ITEMS } from '../search-config';

export const LocalCurrencyItem = () => {
  const t = getText;
  const currentCurrency = useSelector(getCurrentCurrency);

  return (
    <SettingsSelectItem
      label={t(PREFERENCES_ITEMS['local-currency'])}
      to={CURRENCY_ROUTE}
      value={currentCurrency.toUpperCase()}
    />
  );
};
