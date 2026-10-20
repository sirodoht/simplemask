import { isObject } from '@metamask/utils';
import type { Migrate } from './types';

export const version = 236;

/**
 * Remove Perps caches and navigation without deleting accounts or transactions.
 *
 * @param versionedData - Persisted wallet state.
 * @param changedKeys - Controller keys that must be persisted.
 */
export const migrate = (async (versionedData, changedKeys) => {
  versionedData.meta.version = version;
  const state = versionedData.data as Record<string, unknown>;
  if (Object.hasOwn(state, 'PerpsController')) {
    delete state.PerpsController;
    changedKeys.add('PerpsController');
  }

  const appState = state.AppStateController;
  if (isObject(appState)) {
    for (const key of ['perpsTabBadgeSeen', 'lastPerpsDepositEntryPoint']) {
      if (Object.hasOwn(appState, key)) {
        delete appState[key];
        changedKeys.add('AppStateController');
      }
    }
    if (appState.defaultHomeActiveTabName === 'perps') {
      appState.defaultHomeActiveTabName = 'tokens';
      changedKeys.add('AppStateController');
    }
    if (Object.hasOwn(appState, 'lastVisitedRoute')) {
      delete appState.lastVisitedRoute;
      changedKeys.add('AppStateController');
    }
    if (
      isObject(appState.pendingRedirectRoute) &&
      typeof appState.pendingRedirectRoute.path === 'string' &&
      /^\/perps(?:\/|-|$)/u.test(appState.pendingRedirectRoute.path)
    ) {
      appState.pendingRedirectRoute = null;
      changedKeys.add('AppStateController');
    }
  }

  const preferencesController = state.PreferencesController;
  if (
    isObject(preferencesController) &&
    isObject(preferencesController.preferences) &&
    Object.hasOwn(
      preferencesController.preferences,
      'perpsSelectedCandlePeriod',
    )
  ) {
    delete preferencesController.preferences.perpsSelectedCandlePeriod;
    changedKeys.add('PreferencesController');
  }

  const notifications = state.NotificationServicesController;
  if (
    isObject(notifications) &&
    Array.isArray(notifications.metamaskNotificationsList)
  ) {
    const removedIds = new Set<unknown>();
    const retained = notifications.metamaskNotificationsList.filter(
      (notification) => {
        if (
          isObject(notification) &&
          notification.notification_type === 'perps'
        ) {
          removedIds.add(notification.id);
          return false;
        }
        return true;
      },
    );
    if (retained.length !== notifications.metamaskNotificationsList.length) {
      notifications.metamaskNotificationsList = retained;
      if (Array.isArray(notifications.metamaskNotificationsReadList)) {
        notifications.metamaskNotificationsReadList =
          notifications.metamaskNotificationsReadList.filter(
            (id) => !removedIds.has(id),
          );
      }
      changedKeys.add('NotificationServicesController');
    }
  }
}) satisfies Migrate;
