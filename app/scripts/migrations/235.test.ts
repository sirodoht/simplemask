import { describe, expect, it } from '@jest/globals';
import { TRIGGER_TYPES } from '@metamask/notification-services-controller/notification-services';
import type { Migrate } from './types';
import { migrate, version } from './235';

describe(`migration #${version}`, () => {
  it('removes announcements and their read IDs while retaining wallet state', async () => {
    const transaction = { id: 'transfer', type: TRIGGER_TYPES.ETH_RECEIVED };
    const state = {
      meta: { version: version - 1 },
      data: {
        NotificationServicesController: {
          isFeatureAnnouncementsEnabled: true,
          isNotificationServicesEnabled: true,
          metamaskNotificationsList: [
            { id: 'advert', type: TRIGGER_TYPES.FEATURES_ANNOUNCEMENT },
            transaction,
          ],
          metamaskNotificationsReadList: ['advert', 'transfer'],
        },
        KeyringController: { vault: 'encrypted-test-vault' },
      },
    };
    const changedControllers = new Set<string>();

    await migrate(state, changedControllers);

    expect(state).toStrictEqual({
      meta: { version },
      data: {
        NotificationServicesController: {
          isFeatureAnnouncementsEnabled: false,
          isNotificationServicesEnabled: true,
          metamaskNotificationsList: [transaction],
          metamaskNotificationsReadList: ['transfer'],
        },
        KeyringController: { vault: 'encrypted-test-vault' },
      },
    });
    expect(changedControllers).toEqual(
      new Set(['NotificationServicesController']),
    );

    const secondPassChanges = new Set<string>();
    await migrate(state, secondPassChanges);
    expect(secondPassChanges.size).toBe(0);
  });

  it.each([undefined, null, 'invalid'])(
    'handles absent or malformed notification state: %j',
    async (notifications) => {
      const state: Parameters<Migrate>[0] = {
        meta: { version: version - 1 },
        data: { NotificationServicesController: notifications },
      };
      const changedControllers = new Set<string>();

      await migrate(state, changedControllers);

      expect(state.meta.version).toBe(version);
      expect(state.data.NotificationServicesController).toBe(notifications);
      expect(changedControllers.size).toBe(0);
    },
  );
});
