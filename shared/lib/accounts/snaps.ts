import { SnapId } from '@metamask/snaps-sdk';
import {
  stripSnapPrefix,
  getLocalizedSnapManifest,
} from '@metamask/snaps-utils';
// eslint-disable-next-line import-x/no-restricted-paths
import { SnapKeyringBuilderMessenger } from '../../../app/scripts/lib/snap-keyring/types';

/**
 * Get the localized Snap name or some fallback name otherwise.
 *
 * @param snapId - Snap ID.
 * @param messenger - Snap keyring messenger.
 * @returns The Snap name.
 */
export function getSnapName(
  snapId: SnapId,
  messenger: SnapKeyringBuilderMessenger,
) {
  const { currentLocale } = messenger.call('PreferencesController:getState');
  const snap = messenger.call('SnapController:getSnap', snapId);

  if (!snap) {
    return stripSnapPrefix(snapId);
  }

  if (snap.localizationFiles) {
    const localizedManifest = getLocalizedSnapManifest(
      snap.manifest,
      currentLocale,
      snap.localizationFiles,
    );
    return localizedManifest.proposedName;
  }

  return snap.manifest.proposedName;
}
