import { isEvmAccountType } from '@metamask/keyring-api';
import type { AccountsControllerState } from '@metamask/accounts-controller';
import { createSelector } from 'reselect';

export type AccountsState = {
  metamask: AccountsControllerState;
};

const selectInternalAccounts = (state: AccountsState) =>
  state.metamask.internalAccounts.accounts;

const selectSelectedInternalAccountId = (state: AccountsState) =>
  state.metamask.internalAccounts.selectedAccount;

export const getSelectedInternalAccount = createSelector(
  [selectSelectedInternalAccountId, selectInternalAccounts],
  (accountId, accounts) => {
    if (!accountId) {
      return accounts[accountId];
    }
    const selected = accounts[accountId];
    return selected && isEvmAccountType(selected.type)
      ? selected
      : Object.values(accounts).filter((account) =>
          isEvmAccountType(account.type),
        )[0];
  },
);

/**
 * Same as `getSelectedInternalAccount`, but might potentially be `undefined`:
 * - This might happen during the onboarding
 *
 * @param state - The accounts state
 * @returns The selected internal account or undefined
 */
export function getMaybeSelectedInternalAccount(state: AccountsState) {
  const accountId = state.metamask.internalAccounts?.selectedAccount;
  const account = accountId
    ? state.metamask.internalAccounts?.accounts[accountId]
    : undefined;
  return account && isEvmAccountType(account.type)
    ? account
    : Object.values(state.metamask.internalAccounts?.accounts ?? {}).find(
        (candidate) => isEvmAccountType(candidate.type),
      );
}
