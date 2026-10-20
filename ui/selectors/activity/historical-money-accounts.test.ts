import { KeyringTypes, type KeyringObject } from '@metamask/keyring-controller';
import { selectPrimaryMoneyAccount } from './historical-money-accounts';

describe('selectPrimaryMoneyAccount', () => {
  const account = {
    address: '0x123' as const,
    options: { entropy: { id: 'seed-id' } },
  };
  const state = {
    metamask: {
      keyrings: [
        {
          type: KeyringTypes.hd,
          metadata: { id: 'seed-id' },
        },
      ] as KeyringObject[],
      historicalMoneyAccounts: { account },
    },
  };

  it('resolves saved ownership without product state', () => {
    expect(selectPrimaryMoneyAccount(state)).toEqual(account);
  });

  it('does not associate a different seed with the saved account', () => {
    expect(
      selectPrimaryMoneyAccount({
        metamask: {
          ...state.metamask,
          keyrings: [
            {
              type: KeyringTypes.hd,
              metadata: { id: 'other-seed' },
            },
          ] as KeyringObject[],
        },
      }),
    ).toBeUndefined();
  });

  it('returns no account in a new wallet', () => {
    expect(
      selectPrimaryMoneyAccount({ metamask: { keyrings: [] } }),
    ).toBeUndefined();
  });
});
