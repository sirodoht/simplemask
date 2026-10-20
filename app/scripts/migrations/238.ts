import { isObject } from '@metamask/utils';
import type { Migrate } from './types';

export const version = 238;

/**
 * Remove NFT collection tracking and settings while preserving transactions.
 *
 * @param versionedData - Persisted wallet state.
 * @param changedKeys - Controller keys that must be persisted.
 */
export const migrate = (async (versionedData, changedKeys) => {
  versionedData.meta.version = version;
  const state = versionedData.data as Record<string, unknown>;
  for (const key of ['NftController', 'NftDetectionController']) {
    if (Object.hasOwn(state, key)) {
      delete state[key];
      changedKeys.add(key);
    }
  }
  const preferences = state.PreferencesController;
  if (isObject(preferences)) {
    for (const key of ['openSeaEnabled', 'useNftDetection']) {
      if (Object.hasOwn(preferences, key)) {
        delete preferences[key];
        changedKeys.add('PreferencesController');
      }
    }
    if (
      isObject(preferences.preferences) &&
      Object.hasOwn(preferences.preferences, 'displayNftMedia')
    ) {
      delete preferences.preferences.displayNftMedia;
      changedKeys.add('PreferencesController');
    }
  }
  const appState = state.AppStateController;
  if (isObject(appState)) {
    if (Object.hasOwn(appState, 'nftsDropdownState')) {
      delete appState.nftsDropdownState;
      changedKeys.add('AppStateController');
    }
    if (appState.defaultHomeActiveTabName === 'nfts') {
      appState.defaultHomeActiveTabName = 'tokens';
      changedKeys.add('AppStateController');
    }
    if (
      isObject(appState.pendingRedirectRoute) &&
      typeof appState.pendingRedirectRoute.path === 'string' &&
      /^\/(?:import-nfts|confirm-add-suggested-nft|asset\/[^/]+\/image)(?:\/|\?|$)/u.test(
        appState.pendingRedirectRoute.path,
      )
    ) {
      appState.pendingRedirectRoute = null;
      changedKeys.add('AppStateController');
    }
  }
}) satisfies Migrate;
