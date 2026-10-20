import { createSelector } from 'reselect';
import { isStrictHexString, type Hex } from '@metamask/utils';
import { KeyringTypes, type KeyringObject } from '@metamask/keyring-controller';
import type { HistoricalMoneyAccount } from '../../../shared/types/historical-money-account';

export type PrimaryMoneyAccount = HistoricalMoneyAccount & { address: Hex };
type State = {
  metamask: {
    keyrings: KeyringObject[];
    historicalMoneyAccounts?: Record<string, HistoricalMoneyAccount>;
  };
};

/** Resolve saved account ownership for history without initializing product services. */
export const selectPrimaryMoneyAccount = createSelector(
  (state: State) => state.metamask.keyrings,
  (state: State) => state.metamask.historicalMoneyAccounts,
  (keyrings, accounts): PrimaryMoneyAccount | undefined => {
    const primary = keyrings?.find(({ type }) => type === KeyringTypes.hd);
    const account = Object.values(accounts ?? {}).find(
      (candidate) => candidate.options.entropy.id === primary?.metadata.id,
    );
    return account && isStrictHexString(account.address)
      ? { ...account, address: account.address }
      : undefined;
  },
);
