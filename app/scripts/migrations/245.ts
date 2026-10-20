import { isObject } from '@metamask/utils';
import type { Migrate } from './types';

export const version = 245;

// Keep migration identifiers fixed even if the runtime integrations change.
const retired = new Set([
  'npm:@metamask/bitcoin-wallet-snap',
  'npm:@metamask/solana-wallet-snap',
  'npm:@metamask/tron-wallet-snap',
  'npm:@metamask/stellar-wallet-snap',
]);

/**
 * Retire non-EVM Snap execution and permissions, preserving encrypted key data.
 *
 * @param versionedData - Persisted wallet state.
 * @param changedKeys - Controllers requiring persistence.
 */
export const migrate = (async (versionedData, changedKeys) => {
  versionedData.meta.version = version;
  const state = versionedData.data;
  const controller = state.SnapController;
  if (isObject(controller) && isObject(controller.snaps)) {
    for (const id of retired) {
      delete controller.snaps[id];
    }
    // snapStates and unencryptedSnapStates may hold account recovery data.
    // Preserve these alongside the keyring vault, without executable Snaps.
    changedKeys.add('SnapController');
  }
  const cronjobs = state.CronjobController;
  if (isObject(cronjobs) && isObject(cronjobs.events)) {
    cronjobs.events = Object.fromEntries(
      Object.entries(cronjobs.events).filter(
        ([, event]) =>
          !isObject(event) ||
          typeof event.snapId !== 'string' ||
          !retired.has(event.snapId),
      ),
    );
    changedKeys.add('CronjobController');
  }
  const interfaces = state.SnapInterfaceController;
  if (isObject(interfaces) && isObject(interfaces.interfaces)) {
    interfaces.interfaces = Object.fromEntries(
      Object.entries(interfaces.interfaces).filter(
        ([, entry]) =>
          !isObject(entry) ||
          typeof entry.snapId !== 'string' ||
          !retired.has(entry.snapId),
      ),
    );
    changedKeys.add('SnapInterfaceController');
  }
  const notifications = state.NotificationServicesController;
  if (
    isObject(notifications) &&
    Array.isArray(notifications.metamaskNotificationsList)
  ) {
    const removedIds = new Set();
    notifications.metamaskNotificationsList =
      notifications.metamaskNotificationsList.filter((entry) => {
        if (
          isObject(entry) &&
          entry.type === 'snap' &&
          isObject(entry.data) &&
          typeof entry.data.origin === 'string' &&
          retired.has(entry.data.origin)
        ) {
          removedIds.add(entry.id);
          return false;
        }
        return true;
      });
    if (Array.isArray(notifications.metamaskNotificationsReadList)) {
      notifications.metamaskNotificationsReadList =
        notifications.metamaskNotificationsReadList.filter(
          (id) => !removedIds.has(id),
        );
    }
    changedKeys.add('NotificationServicesController');
  }
  const permissions = state.PermissionController;
  if (isObject(permissions) && isObject(permissions.subjects)) {
    for (const id of retired) {
      delete permissions.subjects[id];
    }
    for (const subject of Object.values(permissions.subjects)) {
      if (!isObject(subject) || !isObject(subject.permissions)) {
        continue;
      }
      delete subject.permissions['endowment:assets'];
      delete subject.permissions['endowment:protocol'];
      const walletSnap = subject.permissions.wallet_snap;
      if (!isObject(walletSnap) || !Array.isArray(walletSnap.caveats)) {
        continue;
      }
      for (const caveat of walletSnap.caveats) {
        if (
          isObject(caveat) &&
          caveat.type === 'snapIds' &&
          isObject(caveat.value)
        ) {
          for (const id of retired) {
            delete caveat.value[id];
          }
          if (Object.keys(caveat.value).length === 0) {
            delete subject.permissions.wallet_snap;
          }
        }
      }
    }
    changedKeys.add('PermissionController');
  }
}) satisfies Migrate;
