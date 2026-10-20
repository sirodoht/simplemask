import { describe, expect, it } from '@jest/globals';
import { migrate, version } from './236';
import type { Migrate } from './types';

describe(`migration #${version}`, () => {
  it('removes Perps state and navigation while preserving the vault and transaction history', async () => {
    const vault = { vault: 'encrypted-test-vault' };
    const transactions = {
      transactions: [
        { id: 'deposit', type: 'perpsDeposit', status: 'confirmed' },
      ],
    };
    const transfer = { id: 'transfer', type: 'eth_received' };
    const state: Parameters<Migrate>[0] = {
      meta: { version: version - 1 },
      data: {
        PerpsController: { positions: [] },
        AppStateController: {
          perpsTabBadgeSeen: true,
          lastPerpsDepositEntryPoint: 'test',
          defaultHomeActiveTabName: 'perps',
          lastVisitedRoute: { name: 'perps', path: '/perps/market/ETH' },
          pendingRedirectRoute: { path: '/perps-home' },
        },
        PreferencesController: {
          preferences: {
            perpsSelectedCandlePeriod: '1h',
            hideZeroBalanceTokens: true,
          },
        },
        NotificationServicesController: {
          metamaskNotificationsList: [
            {
              id: 'order',
              // eslint-disable-next-line @typescript-eslint/naming-convention
              notification_type: 'perps',
            },
            transfer,
          ],
          metamaskNotificationsReadList: ['order', 'transfer'],
        },
        KeyringController: vault,
        TransactionController: transactions,
      },
    };
    const changed = new Set<string>();
    await migrate(state, changed);
    expect(state.data).toStrictEqual({
      AppStateController: {
        defaultHomeActiveTabName: 'tokens',
        pendingRedirectRoute: null,
      },
      PreferencesController: { preferences: { hideZeroBalanceTokens: true } },
      NotificationServicesController: {
        metamaskNotificationsList: [transfer],
        metamaskNotificationsReadList: ['transfer'],
      },
      KeyringController: vault,
      TransactionController: transactions,
    });
    expect(changed).toEqual(
      new Set([
        'PerpsController',
        'AppStateController',
        'PreferencesController',
        'NotificationServicesController',
      ]),
    );
    expect(state.meta.version).toBe(version);
    const secondPass = new Set<string>();
    await migrate(state, secondPass);
    expect(secondPass.size).toBe(0);
  });

  it.each([undefined, null, 'invalid'])(
    'tolerates missing or malformed controllers: %j',
    async (controller) => {
      const state: Parameters<Migrate>[0] = {
        meta: { version: version - 1 },
        data: {
          AppStateController: controller,
          PreferencesController: controller,
          NotificationServicesController: controller,
        },
      };
      const changed = new Set<string>();
      await migrate(state, changed);
      expect(changed.size).toBe(0);
    },
  );
});
