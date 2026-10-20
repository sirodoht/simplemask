import { describe, expect, it } from '@jest/globals';
import { migrate, version } from './242';
import type { Migrate } from './types';

describe(`migration #${version}`, () => {
  it('keeps only account ownership needed for saved transaction history', async () => {
    const state: Parameters<Migrate>[0] = {
      meta: { version: version - 1 },
      data: {
        MoneyAccountController: {
          moneyAccounts: {
            account: {
              address: '0x123',
              options: { entropy: { id: 'seed-id' } },
              ignoredProductMetadata: true,
            },
            invalid: { address: 123 },
          },
        },
        AppStateController: { pendingRedirectRoute: { path: '/send' } },
      },
    };
    await migrate(state, new Set());
    expect(state.data).toStrictEqual({
      AppStateController: {
        pendingRedirectRoute: { path: '/send' },
        historicalMoneyAccounts: {
          account: {
            address: '0x123',
            options: { entropy: { id: 'seed-id' } },
          },
        },
      },
    });
  });

  it.each([
    '/shield-plan',
    '/settings/transaction-shield/manage-plan',
    '/money-home',
    '/money-activity',
    '/musd/convert',
  ])(
    'retires product state and %s without changing wallet data',
    async (path) => {
      const wallet = {
        KeyringController: { vault: 'encrypted-vault-with-money-keyring' },
        AccountsController: {
          internalAccounts: { selectedAccount: 'account' },
        },
        TokensController: {
          allTokens: { '0x1': { account: [{ symbol: 'mUSD' }] } },
        },
        TransactionController: {
          transactions: [{ id: 'deposit', metamaskPay: { targetFiat: '10' } }],
        },
      };
      const state: Parameters<Migrate>[0] = {
        meta: { version: version - 1 },
        data: {
          ...wallet,
          SubscriptionController: { subscriptions: [{ id: 'subscription' }] },
          ShieldController: { coverage: {} },
          ClaimsController: { drafts: [] },
          MoneyAccountController: { moneyAccounts: {} },
          MoneyAccountUpgradeController: {},
          MoneyAccountBalanceService: {},
          TransactionPayController: { transactionData: {} },
          AppStateController: {
            pendingRedirectRoute: { path },
            shieldSubscriptionError: null,
            pendingShieldCohort: 'cohort',
            musdConversionEducationSeen: true,
            moneyEarnBannerDismissedTokenKeys: ['token'],
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
      expect(changed.size).toBe(8);
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
  ])('preserves unrelated app state: %j', async (appState) => {
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
