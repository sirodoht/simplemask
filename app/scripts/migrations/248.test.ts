import { describe, expect, it } from '@jest/globals';
import { migrate, version } from './248';
import type { Migrate } from './types';

describe(`migration #${version}`, () => {
  it('removes only language preferences and is idempotent', async () => {
    const state: Parameters<Migrate>[0] = {
      meta: { version: version - 1 },
      data: {
        PreferencesController: {
          currentLocale: 'ar',
          textDirection: 'rtl',
          preferences: { hideZeroBalanceTokens: true },
        },
        KeyringController: { vault: 'encrypted' },
        TransactionController: { transactions: [{ id: 'existing' }] },
      },
    };
    const changed = new Set<string>();
    await migrate(state, changed);
    expect(state.meta.version).toBe(version);
    expect(state.data).toEqual({
      PreferencesController: { preferences: { hideZeroBalanceTokens: true } },
      KeyringController: { vault: 'encrypted' },
      TransactionController: { transactions: [{ id: 'existing' }] },
    });
    expect(changed).toEqual(new Set(['PreferencesController']));
    changed.clear();
    await migrate(state, changed);
    expect(changed.size).toBe(0);
  });

  it('accepts an empty state', async () => {
    const state: Parameters<Migrate>[0] = {
      meta: { version: version - 1 },
      data: {},
    };
    const changed = new Set<string>();
    await migrate(state, changed);
    expect(state.data).toEqual({});
    expect(changed.size).toBe(0);
  });
});
