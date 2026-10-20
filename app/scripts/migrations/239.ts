import { isObject } from '@metamask/utils';
import type { Migrate } from './types';

export const version = 239;

/**
 * Remove DeFi position caches and retired dashboard navigation.
 *
 * @param versionedData - Persisted wallet state.
 * @param changedKeys - Controller keys that must be persisted.
 */
export const migrate = (async (versionedData, changedKeys) => {
  versionedData.meta.version = version;
  const state = versionedData.data;
  for (const key of ['DeFiPositionsController', 'DeFiPositionsControllerV2']) {
    if (Object.hasOwn(state, key)) {
      delete state[key];
      changedKeys.add(key);
    }
  }
  const appState = state.AppStateController;
  if (isObject(appState)) {
    if (appState.defaultHomeActiveTabName === 'defi') {
      appState.defaultHomeActiveTabName = 'tokens';
      changedKeys.add('AppStateController');
    }
    if (
      isObject(appState.pendingRedirectRoute) &&
      typeof appState.pendingRedirectRoute.path === 'string' &&
      /^\/defi(?:\/|\?|$)/u.test(appState.pendingRedirectRoute.path)
    ) {
      appState.pendingRedirectRoute = null;
      changedKeys.add('AppStateController');
    }
  }
}) satisfies Migrate;
