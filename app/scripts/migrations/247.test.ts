import { describe, it, expect } from '@jest/globals';
import { migrate, version } from './247';
import type { Migrate } from './types';

describe(`migration #${version}`, () => {
  it.each(['ar', 'ja', 'en_GB', 'en'])(
    'normalizes %s and preserves wallet data',
    async (locale) => {
      const state: Parameters<Migrate>[0] = {
        meta: { version: version - 1 },
        data: {
          PreferencesController: {
            currentLocale: locale,
            textDirection: 'rtl',
            preferences: { hideZeroBalanceTokens: true },
          },
          KeyringController: { vault: 'encrypted' },
          TransactionController: { transactions: [{ id: 'existing' }] },
        },
      };
      const before = structuredClone(state.data);
      const changed = new Set<string>();
      await migrate(state, changed);
      expect(state.meta.version).toBe(version);
      expect(state.data).toEqual({
        ...before,
        PreferencesController: {
          currentLocale: 'en',
          textDirection: 'auto',
          preferences: { hideZeroBalanceTokens: true },
        },
      });
      expect(changed).toEqual(new Set(['PreferencesController']));
      changed.clear();
      await migrate(state, changed);
      expect(changed.size).toBe(0);
    },
  );

  it('accepts state without preferences', async () => {
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
