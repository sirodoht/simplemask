/* eslint-disable @typescript-eslint/naming-convention -- Persisted controller and analytics keys. */
import { describe, expect, it } from '@jest/globals';
import { migrate, version } from './246';
import type { Migrate } from './types';

const musd = 'eip155:1/erc20:0xacA92E438df0B2401fF60dA7E4337B687a2435DA';
const native = 'eip155:1/slip44:60';

describe(`migration #${version}`, () => {
  it('removes attribution while preserving consent, queued wallet events, and installation date', async () => {
    const data: Parameters<Migrate>[0] = {
      meta: { version: version - 1 },
      data: {
        AppMetadataController: {
          firstTimeInfo: { date: 123 },
          installAttribution: { cookieId: 'website-cookie' },
        },
        AnalyticsController: {
          optedIn: true,
          eventQueue: {
            event: {
              type: 'identify',
              traits: {
                cookie_id: 'cookie',
                ga_client_id: 'client',
                install_date_ext: '2026-01-01',
              },
              context: { marketingCampaignCookieId: 'campaign', locale: 'en' },
            },
          },
          preConsentEventQueue: {
            install: {
              type: 'track',
              eventName: 'App Installed',
              properties: {
                utm_campaign: 'campaign',
                install_source: 'deeplink',
                deeplink_path: 'https://metamask.io/link',
                category: 'App',
              },
            },
          },
        },
        KeyringController: { vault: 'encrypted' },
        PreferencesController: {
          preferences: { showTickerWidget: true, hideZeroBalanceTokens: false },
        },
      },
    };
    const changed = new Set<string>();
    await migrate(data, changed);
    expect(data.data.AppMetadataController).toEqual({
      firstTimeInfo: { date: 123 },
    });
    expect(data.data.AnalyticsController).toEqual({
      optedIn: true,
      eventQueue: {
        event: {
          type: 'identify',
          traits: { install_date_ext: '2026-01-01' },
          context: { locale: 'en' },
        },
      },
      preConsentEventQueue: {
        install: {
          type: 'track',
          eventName: 'App Installed',
          properties: { category: 'App' },
        },
      },
    });
    expect(data.data.KeyringController).toEqual({ vault: 'encrypted' });
    expect(data.data.PreferencesController).toEqual({
      preferences: { hideZeroBalanceTokens: false },
    });
    expect(changed).toEqual(
      new Set([
        'PreferencesController',
        'AppMetadataController',
        'AnalyticsController',
      ]),
    );
  });

  it('drops only seeded zero balances, retaining holdings, explicit imports, and native assets', async () => {
    const data: Parameters<Migrate>[0] = {
      meta: { version: version - 1 },
      data: {
        AssetsController: {
          assetsBalance: {
            empty: { [musd]: { amount: '0' }, [native]: { amount: '0' } },
            funded: { [musd]: { amount: '0.000001' } },
            tiny: { [musd]: { amount: '1e-400' } },
            imported: { [musd]: { amount: '0' } },
          },
          customAssets: { imported: [musd.toLowerCase()] },
        },
      },
    };
    const changed = new Set<string>();
    await migrate(data, changed);
    expect(data.data.AssetsController).toEqual({
      assetsBalance: {
        empty: { [native]: { amount: '0' } },
        funded: { [musd]: { amount: '0.000001' } },
        tiny: { [musd]: { amount: '1e-400' } },
        imported: { [musd]: { amount: '0' } },
      },
      customAssets: { imported: [musd.toLowerCase()] },
    });
    expect(changed).toEqual(new Set(['AssetsController']));
    const secondPass = new Set<string>();
    await migrate(data, secondPass);
    expect(secondPass.size).toBe(0);
  });

  it('accepts empty state', async () => {
    const data: Parameters<Migrate>[0] = {
      meta: { version: version - 1 },
      data: {},
    };
    const changed = new Set<string>();
    await migrate(data, changed);
    expect(data.meta.version).toBe(version);
    expect(changed.size).toBe(0);
  });
});
