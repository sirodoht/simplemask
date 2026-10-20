import { getIsSidePanelFeatureEnabled } from '../../shared/lib/environment';

/**
 * Custom hook to check if sidepanel feature is enabled.
 * Checks browser API availability.
 * Returns false for Firefox, which has no sidePanel API.
 *
 * @returns boolean - True if sidepanel feature is enabled, false otherwise
 */
export const useSidePanelEnabled = (): boolean => {
  return getIsSidePanelFeatureEnabled();
};
