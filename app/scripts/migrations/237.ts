import { isObject } from '@metamask/utils';
import type { Migrate } from './types';

export const version = 237;

/**
 * Remove rewards credentials, caches, and referral preferences.
 *
 * @param versionedData - Persisted wallet state.
 * @param changedKeys - Controller keys that must be persisted.
 */
export const migrate = (async (versionedData, changedKeys) => {
  versionedData.meta.version = version;
  const state = versionedData.data as Record<string, unknown>;
  for (const key of ['RewardsController', 'RewardsDataService']) {
    if (Object.hasOwn(state, key)) {
      delete state[key];
      changedKeys.add(key);
    }
  }

  const preferences = state.PreferencesController;
  if (isObject(preferences) && Object.hasOwn(preferences, 'referrals')) {
    delete preferences.referrals;
    changedKeys.add('PreferencesController');
  }

  const appState = state.AppStateController;
  if (
    isObject(appState) &&
    isObject(appState.pendingRedirectRoute) &&
    typeof appState.pendingRedirectRoute.path === 'string' &&
    /^\/rewards(?:\/|\?|$)/u.test(appState.pendingRedirectRoute.path)
  ) {
    appState.pendingRedirectRoute = null;
    changedKeys.add('AppStateController');
  }
}) satisfies Migrate;
