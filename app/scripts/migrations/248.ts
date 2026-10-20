import { isObject } from '@metamask/utils';
import type { Migrate } from './types';

export const version = 248;

/**
 * Remove language preferences now that the application has no locale state.
 *
 * @param versionedData - Persisted wallet state.
 * @param changedControllers - Controllers requiring persistence.
 */
export const migrate = (async (versionedData, changedControllers) => {
  versionedData.meta.version = version;
  const preferences = versionedData.data.PreferencesController;
  if (!isObject(preferences)) {
    return;
  }
  for (const key of ['currentLocale', 'textDirection']) {
    if (key in preferences) {
      delete preferences[key];
      changedControllers.add('PreferencesController');
    }
  }
}) satisfies Migrate;
