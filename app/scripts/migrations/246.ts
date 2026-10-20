import { isObject } from '@metamask/utils';
import type { Migrate } from './types';

export const version = 246;

const attributionKeys = [
  'cookie_id',
  'ga_client_id',
  'marketingCampaignCookieId',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'install_source',
  'deeplink_path',
];

/**
 * Remove website attribution and automatically seeded, empty promotional assets.
 * Retain analytics consent, wallet holdings, and explicitly imported tokens.
 *
 * @param versionedData - Persisted wallet state.
 * @param changedKeys - Controllers requiring persistence.
 */
export const migrate = (async (versionedData, changedKeys) => {
  versionedData.meta.version = version;
  const state = versionedData.data;
  const preferences = state.PreferencesController;
  if (
    isObject(preferences) &&
    isObject(preferences.preferences) &&
    'showTickerWidget' in preferences.preferences
  ) {
    delete preferences.preferences.showTickerWidget;
    changedKeys.add('PreferencesController');
  }
  const metadata = state.AppMetadataController;
  if (isObject(metadata) && 'installAttribution' in metadata) {
    delete metadata.installAttribution;
    changedKeys.add('AppMetadataController');
  }

  const analytics = state.AnalyticsController;
  if (isObject(analytics)) {
    for (const queueName of ['eventQueue', 'preConsentEventQueue']) {
      const queue = analytics[queueName];
      if (!isObject(queue)) {
        continue;
      }
      for (const event of Object.values(queue)) {
        if (!isObject(event)) {
          continue;
        }
        for (const field of ['properties', 'traits', 'context']) {
          const values = event[field];
          if (!isObject(values)) {
            continue;
          }
          for (const key of attributionKeys) {
            if (key in values) {
              delete values[key];
              changedKeys.add('AnalyticsController');
            }
          }
        }
      }
    }
  }

  const assets = state.AssetsController;
  if (!isObject(assets) || !isObject(assets.assetsBalance)) {
    return;
  }
  const customAssets = isObject(assets.customAssets) ? assets.customAssets : {};
  for (const [accountId, balances] of Object.entries(assets.assetsBalance)) {
    if (!isObject(balances)) {
      continue;
    }
    const imported = customAssets[accountId];
    for (const [assetId, balance] of Object.entries(balances)) {
      if (
        /^eip155:(1|59144|143)\/erc20:0xaca92e438df0b2401ff60da7e4337b687a2435da$/iu.test(
          assetId,
        ) &&
        isObject(balance) &&
        typeof balance.amount === 'string' &&
        /^0+(?:\.0+)?$/u.test(balance.amount.trim()) &&
        !(
          Array.isArray(imported) &&
          imported.some(
            (id) =>
              typeof id === 'string' &&
              id.toLowerCase() === assetId.toLowerCase(),
          )
        )
      ) {
        delete balances[assetId];
        changedKeys.add('AssetsController');
      }
    }
  }
}) satisfies Migrate;
