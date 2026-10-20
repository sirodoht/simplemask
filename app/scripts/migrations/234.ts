import { hasProperty, isObject } from '@metamask/utils';
import type { Migrate } from './types';

export const version = 234;

/**
 * Remove persisted promotional content without changing wallet data.
 *
 * @param versionedData - The stored wallet state.
 * @param changedControllers - Controller keys that must be persisted.
 */
export const migrate = (async (versionedData, changedControllers) => {
  versionedData.meta.version = version;
  const state = versionedData.data as Record<string, unknown>;

  if (hasProperty(state, 'AnnouncementController')) {
    delete state.AnnouncementController;
    changedControllers.add('AnnouncementController');
  }

  if (isObject(state.AppStateController)) {
    for (const key of ['slides', 'showDownloadMobileAppSlide']) {
      if (hasProperty(state.AppStateController, key)) {
        delete state.AppStateController[key];
        changedControllers.add('AppStateController');
      }
    }
  }
}) satisfies Migrate;
