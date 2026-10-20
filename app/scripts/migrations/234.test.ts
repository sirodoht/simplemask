import { describe, expect, it } from '@jest/globals';
import type { Migrate } from './types';
import { migrate, version } from './234';

describe(`migration #${version}`, () => {
  it('removes promotional state while preserving wallet data and preferences', async () => {
    const state = {
      meta: { version: version - 1 },
      data: {
        AnnouncementController: { announcements: { campaign: {} } },
        AppStateController: {
          slides: [{ id: 'promotion' }],
          showDownloadMobileAppSlide: false,
          defaultHomeActiveTabName: 'tokens',
          recoveryPhraseReminderLastShown: 123,
        },
        KeyringController: { vault: 'encrypted-test-vault' },
        TransactionController: { transactions: [{ id: 'transaction' }] },
      },
    };
    const changedControllers = new Set<string>();

    await migrate(state, changedControllers);

    expect(state).toStrictEqual({
      meta: { version },
      data: {
        AppStateController: {
          defaultHomeActiveTabName: 'tokens',
          recoveryPhraseReminderLastShown: 123,
        },
        KeyringController: { vault: 'encrypted-test-vault' },
        TransactionController: { transactions: [{ id: 'transaction' }] },
      },
    });
    expect(changedControllers).toStrictEqual(
      new Set(['AnnouncementController', 'AppStateController']),
    );
  });

  it.each([
    undefined,
    null,
    'invalid',
    {},
    { defaultHomeActiveTabName: 'tokens' },
  ])('handles absent or unexpected app state: %j', async (appState) => {
    const data = appState === undefined ? {} : { AppStateController: appState };
    const state: Parameters<Migrate>[0] = {
      meta: { version: version - 1 },
      data,
    };
    const changedControllers = new Set<string>();

    await migrate(state, changedControllers);

    expect(state.data).toStrictEqual(data);
    expect(state.meta.version).toBe(version);
    expect(changedControllers.size).toBe(0);
  });

  it('is idempotent', async () => {
    const state = {
      meta: { version: version - 1 },
      data: { AppStateController: { slides: [] } },
    };
    await migrate(state, new Set<string>());
    const changedControllers = new Set<string>();

    await migrate(state, changedControllers);

    expect(changedControllers.size).toBe(0);
    expect(state.data).toStrictEqual({ AppStateController: {} });
  });
});
