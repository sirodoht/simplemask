import { isObject } from '@metamask/utils';
import type { Migrate } from './types';

export const version = 240;

/**
 * Remove fiat checkout state and order syncing, preserving on-chain history.
 *
 * @param versionedData - Persisted wallet state.
 * @param changedKeys - Controller keys that must be persisted.
 */
export const migrate = (async (versionedData, changedKeys) => {
  versionedData.meta.version = version;
  const state = versionedData.data;
  if (Object.hasOwn(state, 'RampsController')) {
    delete state.RampsController;
    changedKeys.add('RampsController');
  }
  const userStorage = state.UserStorageController;
  if (isObject(userStorage) && userStorage.isRampsSyncingEnabled !== false) {
    userStorage.isRampsSyncingEnabled = false;
    changedKeys.add('UserStorageController');
  }
  const appState = state.AppStateController;
  if (
    isObject(appState) &&
    isObject(appState.pendingRedirectRoute) &&
    typeof appState.pendingRedirectRoute.path === 'string' &&
    /^\/(?:ramps|buy|sell)(?:\/|\?|$)/u.test(appState.pendingRedirectRoute.path)
  ) {
    appState.pendingRedirectRoute = null;
    changedKeys.add('AppStateController');
  }
}) satisfies Migrate;
