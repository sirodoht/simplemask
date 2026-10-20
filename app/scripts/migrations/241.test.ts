import { describe, expect, it } from '@jest/globals';
import { migrate, version } from './241';
import type { Migrate } from './types';

describe(`migration #${version}`, () => {
  it.each([
    '/swaps/prepare-swap-page',
    '/bridge',
    '/cross-chain/swaps/prepare-bridge-page',
    '/batch-sell/select',
  ])(
    'clears trading caches and %s while retaining wallet data',
    async (path) => {
      const wallet = {
        KeyringController: { vault: 'encrypted-vault' },
        AccountsController: {
          internalAccounts: { selectedAccount: 'account' },
        },
        TransactionController: {
          transactions: [{ id: 'swap-settlement', hash: '0x123' }],
        },
      };
      const state: Parameters<Migrate>[0] = {
        meta: { version: version - 1 },
        data: {
          ...wallet,
          BridgeController: { quotes: [{ id: 'quote' }] },
          BridgeStatusController: { txHistory: { quote: {} } },
          SwapsController: {},
          AppStateController: {
            pendingRedirectRoute: { path },
            dappSwapComparisonData: { request: {} },
          },
        },
      };
      const changed = new Set<string>();
      await migrate(state, changed);
      expect(state.meta.version).toBe(version);
      expect(state.data).toStrictEqual({
        ...wallet,
        AppStateController: { pendingRedirectRoute: null },
      });
      expect(changed).toEqual(
        new Set([
          'BridgeController',
          'BridgeStatusController',
          'SwapsController',
          'AppStateController',
        ]),
      );
      const secondPass = new Set<string>();
      await migrate(state, secondPass);
      expect(secondPass.size).toBe(0);
    },
  );

  it.each([
    undefined,
    null,
    'invalid',
    { pendingRedirectRoute: { path: '/send' } },
  ])('preserves unrelated navigation: %j', async (appState) => {
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
