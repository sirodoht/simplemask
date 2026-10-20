import { describe, expect, it } from '@jest/globals';
import { migrate, version } from './240';
import type { Migrate } from './types';

describe(`migration #${version}`, () => {
  it('removes provider orders and disables their sync while preserving wallet data', async () => {
    const retained = {
      KeyringController: { vault: 'encrypted-vault' },
      AccountsController: { internalAccounts: { selectedAccount: 'account' } },
      TransactionController: {
        transactions: [{ id: 'fiat-settlement', hash: '0x123' }],
      },
    };
    const state: Parameters<Migrate>[0] = {
      meta: { version: version - 1 },
      data: {
        ...retained,
        RampsController: { orders: [{ id: 'provider-order' }], userRegion: {} },
        UserStorageController: {
          isRampsSyncingEnabled: true,
          isAccountSyncingEnabled: true,
        },
        AppStateController: {
          pendingRedirectRoute: { path: '/ramps/build-quote' },
        },
      },
    };
    const changed = new Set<string>();
    await migrate(state, changed);
    expect(state.meta.version).toBe(version);
    expect(state.data).toStrictEqual({
      ...retained,
      UserStorageController: {
        isRampsSyncingEnabled: false,
        isAccountSyncingEnabled: true,
      },
      AppStateController: { pendingRedirectRoute: null },
    });
    expect(changed).toEqual(
      new Set([
        'RampsController',
        'UserStorageController',
        'AppStateController',
      ]),
    );
    const secondPass = new Set<string>();
    await migrate(state, secondPass);
    expect(secondPass.size).toBe(0);
  });

  it.each([
    undefined,
    null,
    'invalid',
    { pendingRedirectRoute: { path: '/send' } },
  ])('preserves unrelated or missing navigation: %j', async (appState) => {
    const state: Parameters<Migrate>[0] = {
      meta: { version: version - 1 },
      data: { AppStateController: appState },
    };
    const changed = new Set<string>();
    await migrate(state, changed);
    expect(state.data.AppStateController).toEqual(appState);
    expect(changed.size).toBe(0);
  });
});
