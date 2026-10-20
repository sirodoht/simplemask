import React from 'react';

import { fireEvent, screen } from '@testing-library/react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import mockState from '../../../../test/data/mock-state.json';
import { renderWithProvider } from '../../../../test/lib/render-helpers-navigate';
import {
  englishText as messages,
  getText as tEn,
} from '../../../../shared/lib/text';
import type { SettingsSearchResult } from '../useSettingsSearch';
import { SettingsSearchResults } from './settings-search-results';

jest.mock('../../../../shared/lib/passkey', () => ({
  getPasskeyAuthMethodKey: () => 'passkeyAuthMethodBiometrics',
}));

const createMockStore = () => configureMockStore([thunk])(mockState);

const mockItems: SettingsSearchResult[] = [
  {
    settingId: 'local-currency',
    tabLabelKey: 'preferencesAndDisplay',
    titleKey: 'localCurrency',
    tabRoute: '/settings/preferences-and-display',
    iconName: 'Customize',
  },
  {
    settingId: 'theme',
    tabLabelKey: 'preferencesAndDisplay',
    titleKey: 'theme',
    tabRoute: '/settings/preferences-and-display',
    iconName: 'Customize',
  },
];

describe('SettingsSearchResults', () => {
  it('renders search result items', () => {
    renderWithProvider(
      <SettingsSearchResults results={mockItems} onClickResult={jest.fn()} />,
      createMockStore(),
    );

    expect(
      screen.getByText(
        `${messages.preferencesAndDisplay} > ${messages.localCurrency}`,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(`${messages.preferencesAndDisplay} > ${messages.theme}`),
    ).toBeInTheDocument();
  });

  it('collapses a duplicated sub-page title in the breadcrumb', () => {
    const sectionItem: SettingsSearchResult = {
      settingId: 'wallet-activity',
      parentTabLabelKey: 'notifications',
      tabLabelKey: 'notificationsSettingsWalletActivityTitle',
      titleKey: 'notificationsSettingsWalletActivityTitle',
      tabRoute: '/settings/notifications/wallet-activity',
      iconName: 'Notification',
    };

    renderWithProvider(
      <SettingsSearchResults
        results={[sectionItem]}
        onClickResult={jest.fn()}
      />,
      createMockStore(),
    );

    expect(
      screen.getByText(
        `${messages.notifications} > ${messages.notificationsSettingsWalletActivityTitle}`,
      ),
    ).toBeInTheDocument();
  });

  it('collapses a tab item whose title matches the tab label', () => {
    const allowNotificationsItem: SettingsSearchResult = {
      settingId: 'allow-notifications',
      tabLabelKey: 'notifications',
      titleKey: 'notifications',
      tabRoute: '/settings/notifications',
      iconName: 'Notification',
    };

    renderWithProvider(
      <SettingsSearchResults
        results={[allowNotificationsItem]}
        onClickResult={jest.fn()}
      />,
      createMockStore(),
    );

    expect(screen.getByText(messages.notifications)).toBeInTheDocument();
  });

  it('resolves passkey title keys with auth-method substitution', () => {
    const passkeyItem: SettingsSearchResult = {
      settingId: 'passkey',
      tabLabelKey: 'securityAndPassword',
      titleKey: 'unlockWithPasskey',
      tabRoute: '/settings/security-and-password',
      iconName: 'SecurityKey',
    };

    renderWithProvider(
      <SettingsSearchResults
        results={[passkeyItem]}
        onClickResult={jest.fn()}
      />,
      createMockStore(),
    );

    expect(
      screen.getByText(
        `${messages.securityAndPassword} > ${tEn('unlockWithPasskey', [tEn('passkeyAuthMethodBiometrics')])}`,
      ),
    ).toBeInTheDocument();
  });

  it('calls onClickResult when a result is clicked', () => {
    const onClickResult = jest.fn();
    renderWithProvider(
      <SettingsSearchResults
        results={mockItems}
        onClickResult={onClickResult}
      />,
      createMockStore(),
    );

    const items = screen.getAllByTestId('settings-search-result-item');
    fireEvent.click(items[0]);

    expect(onClickResult).toHaveBeenCalledWith(mockItems[0]);
  });

  it('shows no-match message and request link when results are empty', () => {
    renderWithProvider(
      <SettingsSearchResults results={[]} onClickResult={jest.fn()} />,
      createMockStore(),
    );

    expect(
      screen.getByText(messages.settingsSearchMatchingNotFound),
    ).toBeInTheDocument();
    expect(
      screen.getByText(messages.settingsSearchRequestHere),
    ).toBeInTheDocument();

    const link = screen.getByText(messages.settingsSearchRequestHere);
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('target', '_blank');
  });
});
