import { describe, expect, it } from '@jest/globals';
import { migrate, version } from './239';
import type { Migrate } from './types';

describe(`migration #${version}`, () => {
  it('discards both position caches while preserving accounts, balances, and transactions', async () => {
    const retained = {
      KeyringController: { vault: 'encrypted-vault' },
      AccountsController: { internalAccounts: { selectedAccount: 'account' } },
      AssetsController: { assets: { token: { balance: '100' } } },
      TransactionController: { transactions: [{ id: 'defi-contract-call' }] },
    };
    const state: Parameters<Migrate>[0] = {
      meta: { version: version - 1 },
      data: {
        ...retained,
        DeFiPositionsController: { allDeFiPositions: {} },
        DeFiPositionsControllerV2: { allDeFiPositionsV2: {} },
        AppStateController: {
          defaultHomeActiveTabName: 'defi',
          pendingRedirectRoute: { path: '/defi/0x1/protocol' },
        },
      },
    };
    const changed = new Set<string>();
    await migrate(state, changed);
    expect(state.meta.version).toBe(version);
    expect(state.data).toStrictEqual({
      ...retained,
      AppStateController: {
        defaultHomeActiveTabName: 'tokens',
        pendingRedirectRoute: null,
      },
    });
    expect(changed).toEqual(
      new Set([
        'DeFiPositionsController',
        'DeFiPositionsControllerV2',
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
    {
      defaultHomeActiveTabName: 'activity',
      pendingRedirectRoute: { path: '/send' },
    },
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
