import { isObject } from '@metamask/utils';

const WALLET_ACTIVITY_TYPES = new Set([
  'eth_sent',
  'eth_received',
  'erc20_sent',
  'erc20_received',
  'erc721_sent',
  'erc721_received',
  'erc1155_sent',
  'erc1155_received',
  'metamask_swap_completed',
  'rocketpool_stake_completed',
  'rocketpool_unstake_completed',
  'lido_stake_completed',
  'lido_withdrawal_requested',
  'lido_withdrawal_completed',
  'lido_stake_ready_to_be_withdrawn',
]);

/**
 * Allow remote wallet activity and CLI transaction notifications.
 *
 * @param notification - Untrusted API or push data.
 * @returns Whether this producer serves a retained wallet function.
 */
export function isRetainedRemoteNotification(notification: unknown): boolean {
  return (
    isObject(notification) &&
    (notification.notification_type === 'wallet_activity' ||
      notification.notification_type === 'agentic_cli')
  );
}

/**
 * Keep wallet status, including older saved activity and local Snap messages.
 *
 * @param notification - A saved or processed notification.
 * @returns Whether the notification belongs in the wallet inbox.
 */
export function isRetainedNotification(notification: unknown): boolean {
  if (!isObject(notification)) {
    return false;
  }
  return (
    notification.type === 'snap' ||
    isRetainedRemoteNotification(notification) ||
    (notification.notification_type === undefined &&
      typeof notification.type === 'string' &&
      WALLET_ACTIVITY_TYPES.has(notification.type))
  );
}
