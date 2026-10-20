import { isObject } from '@metamask/utils';
import type { Migrate } from './types';

export const version = 247;

/**
 * Switch existing wallets to English without changing other preferences.
 *
 * @param versionedData - Persisted wallet state.
 * @param changedControllers - Controllers requiring persistence.
 */
export const migrate = (async (versionedData, changedControllers) => {
  versionedData.meta.version = version;
  const preferences = versionedData.data.PreferencesController;
  if (
    isObject(preferences) &&
    (preferences.currentLocale !== 'en' || preferences.textDirection !== 'auto')
  ) {
    preferences.currentLocale = 'en';
    preferences.textDirection = 'auto';
    changedControllers.add('PreferencesController');
  }
}) satisfies Migrate;
