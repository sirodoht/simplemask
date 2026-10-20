import { detectSnapLocation } from '@metamask/snaps-controllers';
import { isRetiredWalletSnap } from '../../../shared/lib/snaps/retired-wallet-snaps';

/**
 * Resolve supported Snaps without downloading retired wallet integrations.
 *
 * @param location - Snap identifier.
 * @param options - Location and fetch options.
 * @returns The supported Snap's location.
 */
export const detectSupportedSnapLocation: typeof detectSnapLocation = (
  location,
  options,
) => {
  if (isRetiredWalletSnap(location.toString())) {
    throw new Error('This wallet integration is no longer supported.');
  }
  return detectSnapLocation(location, options);
};
