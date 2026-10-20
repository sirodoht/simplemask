// We are defining that this file uses a webworker global scope.
// eslint-disable-next-line spaced-comment
/// <reference lib="webworker" />

import type { PushAnalyticsPayload } from '@metamask/notification-services-controller/push-services';
import { isRetainedRemoteNotification } from '../../../../shared/lib/retained-notifications';
import ExtensionPlatform from '../../platforms/extension';

const sw = self as unknown as ServiceWorkerGlobalScope;
const extensionPlatform = new ExtensionPlatform();

/**
 * Filter before Firebase handles a push and displays its OS notification.
 *
 * @param target - The service worker receiving push events.
 */
export function installPushNotificationFilter(
  target: Pick<ServiceWorkerGlobalScope, 'addEventListener'> = sw,
): void {
  target.addEventListener(
    'push',
    (event: PushEvent) => {
      try {
        if (isRetainedRemoteNotification(event.data?.json()?.data)) {
          return;
        }
      } catch {
        // Malformed pushes must not reach Firebase's automatic banner renderer.
      }
      event.stopImmediatePropagation();
    },
    { capture: true },
  );
}

export async function onPushNotificationReceived(
  _payload: PushAnalyticsPayload,
): Promise<void> {
  // The OS renders the banner from the Web Push payload, and core re-fetches
  // the inbox when it receives the push message.
}

export async function onPushNotificationClicked(
  event: NotificationEvent,
  payload?: PushAnalyticsPayload,
) {
  // Close notification
  event.notification.close();

  // Get Data
  const data: PushAnalyticsPayload = payload ?? event?.notification?.data;
  if (!isRetainedRemoteNotification(data) || !data.notification_id) {
    return;
  }

  // Navigate
  const destination = `${extensionPlatform.getExtensionURL(
    null,
    null,
  )}#notifications/${encodeURIComponent(data.notification_id)}`;
  event.waitUntil(sw.clients.openWindow(destination));
}
