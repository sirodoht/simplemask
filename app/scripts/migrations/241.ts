import { isObject } from '@metamask/utils';
import type { Migrate } from './types';

export const version = 241;

/**
 * Retire trading quotes and navigation without changing wallet transactions.
 *
 * @param versionedData - Persisted wallet state.
 * @param changedKeys - Controller keys that must be persisted.
 */
export const migrate = (async (versionedData, changedKeys) => {
  versionedData.meta.version = version;
  const state = versionedData.data;
  for (const key of [
    'BridgeController',
    'BridgeStatusController',
    'SwapsController',
  ]) {
    if (Object.hasOwn(state, key)) {
      delete state[key];
      changedKeys.add(key);
    }
  }
  const appState = state.AppStateController;
  if (!isObject(appState)) {
    return;
  }
  if (Object.hasOwn(appState, 'dappSwapComparisonData')) {
    delete appState.dappSwapComparisonData;
    changedKeys.add('AppStateController');
  }
  if (
    isObject(appState.pendingRedirectRoute) &&
    typeof appState.pendingRedirectRoute.path === 'string' &&
    /^\/(?:swaps|bridge|cross-chain|batch-sell)(?:\/|\?|$)/u.test(
      appState.pendingRedirectRoute.path,
    )
  ) {
    appState.pendingRedirectRoute = null;
    changedKeys.add('AppStateController');
  }
}) satisfies Migrate;
