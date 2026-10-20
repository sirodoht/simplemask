import { migrate, version } from './244';
import type { Migrate } from './types';

describe(`migration #${version}`, () => {
  it('retires non-EVM services and permissions while preserving encrypted keys and EVM history', async () => {
    const accounts = {
      evm: { type: 'eip155:eoa', address: '0x1234' },
      sol: { type: 'solana:data-account', address: 'old-solana-address' },
    };
    const keys = { vault: 'encrypted-vault-with-all-keyrings' };
    const transactions = { transactions: [{ id: 'evm-history' }] };
    const data: Parameters<Migrate>[0] = {
      meta: { version: version - 1 },
      data: {
        KeyringController: keys,
        TransactionController: transactions,
        AccountsController: {
          internalAccounts: { accounts, selectedAccount: 'sol' },
        },
        MultichainAssetsController: { accountsAssets: {} },
        MultichainBalancesController: { balances: {} },
        MultichainAssetsRatesController: { conversionRates: {} },
        MultichainTransactionsController: { nonEvmTransactions: {} },
        MultichainNetworkController: {
          isEvmSelected: false,
          selectedMultichainNetworkChainId: 'solana:mainnet',
        },
        NetworkEnablementController: {
          enabledNetworkMap: {
            eip155: { '0x1': false },
            solana: { mainnet: true },
          },
        },
        PermissionController: {
          subjects: {
            dapp: {
              permissions: {
                'endowment:caip25': {
                  caveats: [
                    {
                      value: {
                        requiredScopes: {
                          'eip155:1': { accounts: ['eip155:1:0x1234'] },
                          'solana:mainnet': {},
                        },
                        optionalScopes: {},
                      },
                    },
                  ],
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
    expect(data.data.TransactionController).toBe(transactions);
    expect(data.data.AccountsController).toEqual({
      internalAccounts: { accounts, selectedAccount: 'evm' },
    });
    expect(data.data.MultichainTransactionsController).toBeUndefined();
    expect(data.data.MultichainNetworkController).toEqual({
      isEvmSelected: true,
      multichainNetworkConfigurationsByChainId: {},
    });
    expect(data.data.NetworkEnablementController).toEqual({
      enabledNetworkMap: { eip155: { '0x1': true } },
    });
    expect(JSON.stringify(data.data.PermissionController)).not.toContain(
      'solana:mainnet',
    );
    expect(JSON.stringify(data.data.PermissionController)).toContain(
      'eip155:1:0x1234',
    );
    expect(changed.has('KeyringController')).toBe(false);
    expect(changed.has('TransactionController')).toBe(false);
  });

  it('does not create controller state in an empty wallet', async () => {
    const data: Parameters<Migrate>[0] = {
      meta: { version: version - 1 },
      data: {},
    };
    const changed = new Set<string>();
    await migrate(data, changed);
    expect(data).toEqual({ meta: { version }, data: {} });
    expect(changed.size).toBe(0);
  });
});
