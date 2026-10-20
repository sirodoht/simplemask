import { describe, expect, it } from '@jest/globals';
import { migrate, version } from './237';
import type { Migrate } from './types';

describe(`migration #${version}`, () => {
  it('removes rewards and referral data while preserving accounts and permissions', async () => {
    const vault = { vault: 'encrypted-test-vault' };
    const permissions = { subjects: { 'https://example.com': {} } };
    const state: Parameters<Migrate>[0] = {
      meta: { version: version - 1 },
      data: {
        RewardsController: { rewardsSubscriptionTokens: { account: 'token' } },
        RewardsDataService: { cache: [] },
        PreferencesController: { referrals: {}, useExternalServices: true },
        AppStateController: { pendingRedirectRoute: { path: '/rewards' } },
        KeyringController: vault,
        PermissionController: permissions,
      },
    };
    const changed = new Set<string>();
    await migrate(state, changed);
    expect(state.data).toStrictEqual({
      PreferencesController: { useExternalServices: true },
      AppStateController: { pendingRedirectRoute: null },
      KeyringController: vault,
      PermissionController: permissions,
    });
    expect(changed).toEqual(
      new Set([
        'RewardsController',
        'RewardsDataService',
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
