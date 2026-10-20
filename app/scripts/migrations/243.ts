import { isObject } from '@metamask/utils';
import { isRetainedNotification } from '../../../shared/lib/retained-notifications';
import type { Migrate } from './types';

export const version = 243;

/**
 * Remove saved marketing messages while preserving wallet activity.
 *
 * @param versionedData - Persisted wallet state.
 * @param changedKeys - Controllers that need to be persisted.
 */
export const migrate = (async (versionedData, changedKeys) => {
  versionedData.meta.version = version;
  const analytics = versionedData.data.AnalyticsController;
  if (
    isObject(analytics) &&
    (analytics.optedInToMarketing !== false ||
      analytics.marketingConsentDecisionMade !== true)
  ) {
    analytics.optedInToMarketing = false;
    analytics.marketingConsentDecisionMade = true;
    changedKeys.add('AnalyticsController');
  }
  if (isObject(analytics) && analytics.marketingCampaignCookieId) {
    analytics.marketingCampaignCookieId = null;
    changedKeys.add('AnalyticsController');
  }
  const state = versionedData.data.NotificationServicesController;
  if (!isObject(state)) {
    return;
  }
  if (Array.isArray(state.metamaskNotificationsList)) {
    const retained = state.metamaskNotificationsList.filter(
      isRetainedNotification,
    );
    if (retained.length !== state.metamaskNotificationsList.length) {
      const removedIds = new Set(
        state.metamaskNotificationsList
          .filter((notification) => !isRetainedNotification(notification))
          .flatMap((notification) =>
            isObject(notification) && typeof notification.id === 'string'
              ? [notification.id]
              : [],
          ),
      );
      if (Array.isArray(state.metamaskNotificationsReadList)) {
        state.metamaskNotificationsReadList =
          state.metamaskNotificationsReadList.filter(
            (id) => !removedIds.has(id),
          );
      }
      state.metamaskNotificationsList = retained;
      changedKeys.add('NotificationServicesController');
    }
  }
  if (state.isFeatureAnnouncementsEnabled !== false) {
    state.isFeatureAnnouncementsEnabled = false;
    changedKeys.add('NotificationServicesController');
  }
}) satisfies Migrate;
