import { describe, expect, it } from '@jest/globals';
import { migrate, version } from './238';
import type { Migrate } from './types';

describe(`migration #${version}`, () => {
  it('removes collection caches and navigation while preserving token balances and transactions', async () => {
    const transactions = {
      transactions: [{ id: 'nft-transfer', type: 'tokenMethodTransferFrom' }],
    };
    const tokens = { allTokens: { account: { '0x1': [] } } };
    const state: Parameters<Migrate>[0] = {
      meta: { version: version - 1 },
      data: {
        NftController: { allNfts: {} },
        NftDetectionController: {},
        PreferencesController: {
          openSeaEnabled: true,
          useNftDetection: true,
          preferences: { displayNftMedia: true, hideZeroBalanceTokens: false },
        },
        AppStateController: {
          nftsDropdownState: {},
          defaultHomeActiveTabName: 'nfts',
          pendingRedirectRoute: { path: '/import-nfts' },
        },
        TransactionController: transactions,
        TokensController: tokens,
      },
    };
    const changed = new Set<string>();
    await migrate(state, changed);
    expect(state.data).toStrictEqual({
      PreferencesController: { preferences: { hideZeroBalanceTokens: false } },
      AppStateController: {
        defaultHomeActiveTabName: 'tokens',
        pendingRedirectRoute: null,
      },
      TransactionController: transactions,
      TokensController: tokens,
    });
    expect(changed).toEqual(
      new Set([
        'NftController',
        'NftDetectionController',
        'PreferencesController',
        'AppStateController',
      ]),
    );
    expect(state.meta.version).toBe(version);
    const secondPass = new Set<string>();
    await migrate(state, secondPass);
    expect(secondPass.size).toBe(0);
  });

  it.each([undefined, null, 'invalid'])(
    'tolerates missing or malformed controllers: %j',
    async (controller) => {
      const state: Parameters<Migrate>[0] = {
        meta: { version: version - 1 },
        data: {
          PreferencesController: controller,
          AppStateController: controller,
        },
      };
      const changed = new Set<string>();
      await migrate(state, changed);
      expect(changed.size).toBe(0);
    },
  );
});
