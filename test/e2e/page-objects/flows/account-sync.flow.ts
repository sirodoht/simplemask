import { Driver } from '../../webdriver/driver';
import { getCleanAppState } from '../../helpers';
import {
  BASE_ACCOUNT_SYNC_INTERVAL,
  BASE_ACCOUNT_SYNC_TIMEOUT,
} from '../../tests/identity/account-syncing/helpers';

/**
 * Waits until the AccountTreeController's `isAccountTreeSyncingInProgress`
 * flag is false.  This is more reliable than
 * `checkHasAccountSyncingSyncedAtLeastOnce` for cases where a second sync is
 * triggered (e.g. after adding an account) because that flag is
 * never reset to false once it becomes true.
 *
 * @param driver - The WebDriver instance.
 */
export async function waitUntilAccountTreeSyncIdle(
  driver: Driver,
): Promise<void> {
  await driver.waitUntil(
    async () => {
      const uiState = await getCleanAppState(driver);
      return uiState?.metamask?.isAccountTreeSyncingInProgress === false;
    },
    {
      interval: BASE_ACCOUNT_SYNC_INTERVAL,
      timeout: BASE_ACCOUNT_SYNC_TIMEOUT,
    },
  );
}
