import { isObject } from '@metamask/utils';
import type { Migrate } from './types';

export const version = 242;

/**
 * Remove product caches and enrollment state while preserving wallet keys and transactions.
 *
 * @param versionedData - Persisted wallet state.
 * @param changedKeys - Controller keys that must be persisted.
 */
export const migrate = (async (versionedData, changedKeys) => {
  versionedData.meta.version = version;
  const state = versionedData.data;
  const moneyState = state.MoneyAccountController;
  if (isObject(moneyState) && isObject(moneyState.moneyAccounts)) {
    const historicalMoneyAccounts = Object.fromEntries(
      Object.entries(moneyState.moneyAccounts).flatMap(([id, account]) =>
        isObject(account) &&
        typeof account.address === 'string' &&
        isObject(account.options) &&
        isObject(account.options.entropy) &&
        typeof account.options.entropy.id === 'string'
          ? [
              [
                id,
                {
                  address: account.address,
                  options: { entropy: { id: account.options.entropy.id } },
                },
              ],
            ]
          : [],
      ),
    );
    if (Object.keys(historicalMoneyAccounts).length) {
      state.AppStateController = {
        ...(isObject(state.AppStateController) ? state.AppStateController : {}),
        historicalMoneyAccounts,
      };
      changedKeys.add('AppStateController');
    }
  }
  for (const key of [
    'SubscriptionController',
    'ShieldController',
    'ClaimsController',
    'MoneyAccountController',
    'MoneyAccountUpgradeController',
    'MoneyAccountBalanceService',
    'TransactionPayController',
  ]) {
    if (Object.hasOwn(state, key)) {
      delete state[key];
      changedKeys.add(key);
    }
  }
  const appState = state.AppStateController;
  if (!isObject(appState)) {
    return;
  }
  for (const key of [
    'shieldSubscriptionError',
    'shieldEndingToastLastClickedOrClosed',
    'shieldPausedToastLastClickedOrClosed',
    'showShieldEntryModalOnce',
    'pendingShieldCohort',
    'pendingShieldCohortTxType',
    'defaultSubscriptionPaymentOptions',
    'shieldSubscriptionMetricsProps',
    'musdConversionEducationSeen',
    'musdConversionDismissedCtaKeys',
    'moneyEarnBannerDismissedTokenKeys',
  ]) {
    if (Object.hasOwn(appState, key)) {
      delete appState[key];
      changedKeys.add('AppStateController');
    }
  }
  if (
    isObject(appState.pendingRedirectRoute) &&
    typeof appState.pendingRedirectRoute.path === 'string' &&
    /^\/(?:shield-plan|settings\/transaction-shield|money(?:-[a-z-]+)?|musd)(?:\/|\?|$)/u.test(
      appState.pendingRedirectRoute.path,
    )
  ) {
    appState.pendingRedirectRoute = null;
    changedKeys.add('AppStateController');
  }
}) satisfies Migrate;
