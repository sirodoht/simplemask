import React, { useMemo } from 'react';
import { SettingItemConfig } from '../types';
import { SettingsTab, createToggleItem, createSelectItem } from '../shared';
import {
  getManageInstitutionalWallets,
  getShowExtensionInFullSizeView,
  getTheme,
} from '../../../selectors';
import {
  setManageInstitutionalWallets,
  setShowExtensionInFullSizeView,
} from '../../../store/actions';
import { MetaMetricsEventName } from '../../../../shared/constants/metametrics';
import { ThemeType } from '../../../../shared/constants/preferences';
import { THEME_ROUTE } from '../../../helpers/constants/routes';
import { PREFERENCES_ITEMS } from '../search-config';
import { AccountIdenticonItem } from './account-identicon-item';
import { LocalCurrencyItem } from './local-currency-item';
import { ShowDefaultAddressItem } from './show-default-address-item';
import { THEME_LABEL_MAP } from './theme-utils';

const ThemeItem = createSelectItem({
  name: 'ThemeItem',
  titleKey: PREFERENCES_ITEMS.theme,
  valueSelector: getTheme,
  formatValue: (theme, t) =>
    t(THEME_LABEL_MAP[theme as ThemeType] ?? THEME_LABEL_MAP[ThemeType.os]),
  route: THEME_ROUTE,
});

const ShowExtensionItem = createToggleItem({
  name: 'ShowExtensionItem',
  titleKey: PREFERENCES_ITEMS['show-extension'],
  descriptionKey: 'showExtensionInFullSizeViewDescription',
  selector: getShowExtensionInFullSizeView,
  action: setShowExtensionInFullSizeView,
  dataTestId: 'show-extension-in-full-size-view',
  trackEvent: {
    event: MetaMetricsEventName.SettingsUpdated,
    properties: (newValue) => ({
      /* eslint-disable @typescript-eslint/naming-convention */
      settings_group: 'preferences_and_display',
      settings_type: 'open_full_screen',
      old_value: !newValue,
      new_value: newValue,
      open_full_screen: newValue,
      /* eslint-enable @typescript-eslint/naming-convention */
      location: 'Preferences and Display Settings',
    }),
  },
});

const ManageInstitutionalWalletItem = createToggleItem({
  name: 'ManageInstitutionalWalletItem',
  titleKey: PREFERENCES_ITEMS['manage-institutional-wallet'],
  descriptionKey: 'manageInstitutionalWalletsDescription',
  selector: getManageInstitutionalWallets,
  action: setManageInstitutionalWallets,
  dataTestId: 'manage-institutional-wallets',
  trackEventProperty: 'manage_institutional_wallets',
});

const PreferencesAndDisplayTab = () => {
  /** Registry of setting items for the page. Add new items here. */
  const items = useMemo<SettingItemConfig[]>(
    () => [
      { id: 'theme', component: ThemeItem },
      { id: 'local-currency', component: LocalCurrencyItem },
      { id: 'account-identicon', component: AccountIdenticonItem },
      { id: 'show-default-address', component: ShowDefaultAddressItem },
      {
        id: 'show-extension',
        component: ShowExtensionItem,
        hasDividerBefore: true,
      },
      {
        id: 'manage-institutional-wallet',
        component: ManageInstitutionalWalletItem,
      },
    ],
    [],
  );

  return <SettingsTab items={items} />;
};

export default PreferencesAndDisplayTab;
