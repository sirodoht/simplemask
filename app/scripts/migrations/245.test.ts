/* eslint-disable @typescript-eslint/naming-convention -- Persisted RPC permission keys. */
import { migrate, version } from './245';
import type { Migrate } from './types';

const retired = 'npm:@metamask/solana-wallet-snap';
const retained = 'npm:@metamask/ens-resolver-snap';

describe(`migration #${version}`, () => {
  it('removes retired Snap execution, jobs, and grants while retaining keys and EVM Snaps', async () => {
    const keys = { vault: 'encrypted-vault' };
    const snapStates = { [retired]: 'encrypted-recovery-data' };
    const unencryptedSnapStates = { [retired]: 'saved-account-data' };
    const accounts = { internalAccounts: { accounts: { archived: {} } } };
    const data: Parameters<Migrate>[0] = {
      meta: { version: version - 1 },
      data: {
        KeyringController: keys,
        AccountsController: accounts,
        SnapController: {
          snaps: {
            [retired]: { enabled: true, sourceCode: 'retired' },
            [retained]: { enabled: true, sourceCode: 'retained' },
          },
          snapStates,
          unencryptedSnapStates,
        },
        CronjobController: {
          events: {
            retired: { snapId: retired },
            retained: { snapId: retained },
          },
        },
        SnapInterfaceController: {
          interfaces: {
            old: { snapId: retired },
            kept: { snapId: retained },
          },
        },
        NotificationServicesController: {
          metamaskNotificationsList: [
            { id: 'old', type: 'snap', data: { origin: retired } },
            { id: 'kept', type: 'snap', data: { origin: retained } },
            { id: 'transaction', type: 'eth_sent' },
          ],
          metamaskNotificationsReadList: ['old', 'kept'],
        },
        PermissionController: {
          subjects: {
            [retired]: { permissions: { 'endowment:network-access': {} } },
            [retained]: {
              permissions: {
                'endowment:name-lookup': {},
                'endowment:assets': {},
                'endowment:protocol': {},
              },
            },
            dapp: {
              permissions: {
                eth_accounts: {},
                wallet_snap: {
                  caveats: [
                    {
                      type: 'snapIds',
                      value: { [retired]: {}, [retained]: {} },
                    },
                  ],
                },
              },
            },
            retiredOnly: {
              permissions: {
                wallet_snap: {
                  caveats: [{ type: 'snapIds', value: { [retired]: {} } }],
                },
              },
            },
          },
        },
      },
    };
    const changed = new Set<string>();
    await migrate(data, changed);

    expect(data.meta.version).toBe(version);
    expect(data.data.KeyringController).toBe(keys);
    expect(data.data.AccountsController).toBe(accounts);
    expect(data.data.SnapController).toStrictEqual({
      snaps: { [retained]: { enabled: true, sourceCode: 'retained' } },
      snapStates,
      unencryptedSnapStates,
    });
    expect(data.data.CronjobController).toStrictEqual({
      events: { retained: { snapId: retained } },
    });
    expect(data.data.SnapInterfaceController).toStrictEqual({
      interfaces: { kept: { snapId: retained } },
    });
    expect(data.data.NotificationServicesController).toStrictEqual({
      metamaskNotificationsList: [
        { id: 'kept', type: 'snap', data: { origin: retained } },
        { id: 'transaction', type: 'eth_sent' },
      ],
      metamaskNotificationsReadList: ['kept'],
    });
    expect(data.data.PermissionController).toStrictEqual({
      subjects: {
        [retained]: { permissions: { 'endowment:name-lookup': {} } },
        dapp: {
          permissions: {
            eth_accounts: {},
            wallet_snap: {
              caveats: [{ type: 'snapIds', value: { [retained]: {} } }],
            },
          },
        },
        retiredOnly: { permissions: {} },
      },
    });
    expect([...changed]).toStrictEqual([
      'SnapController',
      'CronjobController',
      'SnapInterfaceController',
      'NotificationServicesController',
      'PermissionController',
    ]);
  });

  it('accepts empty state and can be repeated', async () => {
    const data: Parameters<Migrate>[0] = {
      meta: { version: version - 1 },
      data: {},
    };
    const changed = new Set<string>();
    await migrate(data, changed);
    await migrate(data, changed);
    expect(data).toStrictEqual({ meta: { version }, data: {} });
    expect(changed.size).toBe(0);
  });
});
