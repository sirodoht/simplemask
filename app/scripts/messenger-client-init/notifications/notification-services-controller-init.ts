import { Controller as NotificationServicesController } from '@metamask/notification-services-controller/notification-services';
import { MessengerClientInitFunction } from '../types';
import { type NotificationServicesControllerMessenger } from '../messengers/notifications';
import packageJson from '../../../../package.json';
import { isRetainedNotification } from '../../../../shared/lib/retained-notifications';

const APP_VERSION = packageJson.version;

export const NotificationServicesControllerInit: MessengerClientInitFunction<
  NotificationServicesController,
  NotificationServicesControllerMessenger
> = ({ controllerMessenger, persistedState, getMessengerClient }) => {
  const messengerClient = new NotificationServicesController({
    messenger: controllerMessenger,
    state: {
      ...persistedState.NotificationServicesController,
      isFeatureAnnouncementsEnabled: false,
      metamaskNotificationsList:
        persistedState.NotificationServicesController?.metamaskNotificationsList?.filter(
          isRetainedNotification,
        ) ?? [],
    },
    env: {
      // Core also uses this object's platform for wallet notifications.
      // The tracked Yarn patch removes announcement fetching entirely.
      featureAnnouncements: {
        platform: 'extension',
        spaceId: '',
        accessToken: '',
        platformVersion: APP_VERSION,
      },
      locale: () => 'en',
    },
  });

  return {
    messengerClient,
  };
};
