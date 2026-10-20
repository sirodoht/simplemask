// TODO: remove dead code in this file and related files now that code fences are gone

import { createSelector } from 'reselect';
import { getBooleanFeatureFlag } from '../../../shared/lib/remote-feature-flag-utils';
import { EXTENSION_TRUST_AND_SECURITY_TDP_FLAG } from '../../../shared/lib/assets/security-trust-feature-flags';
import { TOKEN_DETAILS_ADVANCED_CHARTS_FLAG } from '../../../shared/lib/assets/advanced-charts-feature-flags';
import { getRemoteFeatureFlags } from '../../../shared/lib/selectors/remote-feature-flags';

export {
  BFT_CHILD_PREFERENCES,
  getIsBasicFunctionalityConsolidationEnabled,
  getIsBasicFunctionalityToggleEnabled,
  getShouldShowBasicFunctionalityMigrationModal,
  getShouldShowBasicFunctionalityMigrationToast,
} from './basic-functionality';

export const getIsTransactionLabelsEnabled = createSelector(
  getRemoteFeatureFlags,
  ({ extensionTransactionLabels }) => Boolean(extensionTransactionLabels),
);

/**
 * Get the state of the `extensionUxTokenManagementFilter` remote feature flag.
 * When enabled, the asset list import-tokens entry point opens a full-screen
 * Token Management page where users can toggle tokens on/off, replacing the
 * legacy import-tokens modal.
 *
 * @param _state - The MetaMask state object
 * @returns boolean - True if the feature is enabled, false otherwise.
 */
export const getIsTokenManagementFilterEnabled = createSelector(
  getRemoteFeatureFlags,
  ({ extensionUxTokenManagementFilter }) =>
    getBooleanFeatureFlag(extensionUxTokenManagementFilter, false),
);

/**
 * Get the state of the `extensionUxNetworkManagement` remote feature flag.
 *
 * @param _state - The MetaMask state object
 * @returns boolean - True if the feature is enabled, false otherwise.
 */
export const getIsNetworkManagementEnabled = createSelector(
  getRemoteFeatureFlags,
  ({ extensionUxNetworkManagement }) =>
    getBooleanFeatureFlag(extensionUxNetworkManagement, false),
);

/**
 * Get the state of the `extensionUxChainlist` remote feature flag.
 *
 * @param _state - The MetaMask state object
 * @returns boolean - True if the feature is enabled, false otherwise.
 */
export const getIsChainlistEnabled = createSelector(
  getRemoteFeatureFlags,
  ({ extensionUxChainlist }) =>
    getBooleanFeatureFlag(extensionUxChainlist, false),
);

/**
 * Get the state of the `extensionUxChainlistV2` remote feature flag.
 * LaunchDarkly key: `extension-ux-chainlist-v-2`.
 *
 * When enabled, the add-network name field suggests Chainlist networks.
 * When disabled, Add from Chainlist stays the button behind
 * `extensionUxChainlist`.
 *
 * @param _state - The MetaMask state object
 * @returns boolean - True if the feature is enabled, false otherwise.
 */
export const getIsChainlistV2Enabled = createSelector(
  getRemoteFeatureFlags,
  (remoteFeatureFlags) =>
    getBooleanFeatureFlag(remoteFeatureFlags.extensionUxChainlistV2, false),
);

/**
 * Get the state of the `extensionTrustAndSecurityTdp` remote feature flag.
 * LD key: `extension-trust-and-security-tdp` (camelCased in extension state).
 *
 * @param _state - The MetaMask state object
 * @returns boolean - True when Security & Trust TDP surfaces should be shown.
 */
export const getIsSecurityTrustTdpEnabled = createSelector(
  getRemoteFeatureFlags,
  (remoteFeatureFlags) =>
    getBooleanFeatureFlag(
      remoteFeatureFlags[EXTENSION_TRUST_AND_SECURITY_TDP_FLAG],
      false,
    ),
);

/**
 * Selector that returns whether the TradingView advanced charts integration
 * should be shown on the Token Details Page.
 *
 * When enabled, the Token Details Page renders the TradingView advanced chart
 * iframe instead of the legacy Chart.js line chart.
 *
 * @param _state - The MetaMask state object
 * @returns boolean - True when the advanced chart integration should be shown.
 */
export const getIsAdvancedChartsEnabled = createSelector(
  getRemoteFeatureFlags,
  (remoteFeatureFlags) => {
    const rawFlagValue = remoteFeatureFlags[TOKEN_DETAILS_ADVANCED_CHARTS_FLAG];
    return getBooleanFeatureFlag(rawFlagValue, false);
  },
);
