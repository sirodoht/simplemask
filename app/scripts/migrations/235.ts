import { isObject } from '@metamask/utils';
import { TRIGGER_TYPES } from '@metamask/notification-services-controller/notification-services';
import type { Migrate } from './types';

export const version = 235;

/**
 * Remove saved feature announcements while retaining wallet notifications.
 *
 * @param versionedData - The stored wallet state.
 * @param changedControllers - Controller keys that must be persisted.
 */
export const migrate = (async (versionedData, changedControllers) => {
  versionedData.meta.version = version;
  const state = versionedData.data as Record<string, unknown>;
  const notifications = state.NotificationServicesController;
  if (!isObject(notifications)) {
    return;
  }

  if (notifications.isFeatureAnnouncementsEnabled !== false) {
    notifications.isFeatureAnnouncementsEnabled = false;
    changedControllers.add('NotificationServicesController');
  }

  if (Array.isArray(notifications.metamaskNotificationsList)) {
    const removedIds = new Set<unknown>();
    const retained = notifications.metamaskNotificationsList.filter(
      (notification) => {
        if (
          isObject(notification) &&
          notification.type === TRIGGER_TYPES.FEATURES_ANNOUNCEMENT
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
      changedControllers.add('NotificationServicesController');
    }
  }
}) satisfies Migrate;
