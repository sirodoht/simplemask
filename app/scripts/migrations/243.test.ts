/* eslint-disable @typescript-eslint/naming-convention -- Notification API field names. */
import { migrate, version } from './243';
import type { Migrate } from './types';

describe(`migration #${version}`, () => {
  it('removes campaigns without changing wallet activity, keys, or transactions', async () => {
    const wallet = {
      KeyringController: { vault: 'encrypted' },
      TransactionController: { transactions: [{ id: 'pending' }] },
    };
    const retained = [
      { id: 'eth', type: 'eth_received', notification_type: 'wallet_activity' },
      { id: 'legacy', type: 'erc20_sent' },
      { id: 'cli', type: 'platform', notification_type: 'agentic_cli' },
      { id: 'snap', type: 'snap' },
    ];
    const data: Parameters<Migrate>[0] = {
      meta: { version: version - 1 },
      data: {
        ...wallet,
        NotificationServicesController: {
          isFeatureAnnouncementsEnabled: true,
          isNotificationServicesEnabled: true,
          metamaskNotificationsReadList: ['ad', 'eth', 'older-wallet-activity'],
          metamaskNotificationsList: [
            ...retained,
            { id: 'ad', type: 'features_announcement' },
            {
              id: 'campaign',
              type: 'platform',
              notification_type: 'marketing',
            },
            {
              id: 'new',
              type: 'platform',
              notification_type: 'unknown_campaign',
            },
          ],
        },
      },
    };
    const changed = new Set<string>();
    await migrate(data, changed);
    expect(data.data).toStrictEqual({
      ...wallet,
      NotificationServicesController: {
        isFeatureAnnouncementsEnabled: false,
        isNotificationServicesEnabled: true,
        metamaskNotificationsReadList: ['eth', 'older-wallet-activity'],
        metamaskNotificationsList: retained,
      },
    });
    expect(changed).toEqual(new Set(['NotificationServicesController']));
    const secondPass = new Set<string>();
    await migrate(data, secondPass);
    expect(secondPass.size).toBe(0);
  });

  it('does not create notification state for a wallet without it', async () => {
    const data: Parameters<Migrate>[0] = {
      meta: { version: version - 1 },
      data: {},
    };
    await migrate(data, new Set());
    expect(data).toEqual({ meta: { version }, data: {} });
  });

  it('retires marketing consent without changing product analytics consent', async () => {
    const data: Parameters<Migrate>[0] = {
      meta: { version: version - 1 },
      data: {
        AnalyticsController: {
          optedIn: true,
          consentDecisionMade: true,
          optedInToMarketing: true,
          marketingConsentDecisionMade: false,
          marketingCampaignCookieId: 'old-campaign',
        },
      },
    };
    const changed = new Set<string>();
    await migrate(data, changed);
    expect(data.data.AnalyticsController).toEqual({
      optedIn: true,
      consentDecisionMade: true,
      optedInToMarketing: false,
      marketingConsentDecisionMade: true,
      marketingCampaignCookieId: null,
    });
    expect(changed).toEqual(new Set(['AnalyticsController']));
  });
});
