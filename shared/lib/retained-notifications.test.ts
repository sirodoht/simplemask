/* eslint-disable @typescript-eslint/naming-convention -- Notification API field names. */
import { it as testCase } from '@jest/globals';
import {
  isRetainedNotification,
  isRetainedRemoteNotification,
} from './retained-notifications';

describe('retained notifications', () => {
  testCase.each(['wallet_activity', 'agentic_cli'])(
    'keeps %s delivery',
    (producer) => {
      const notification = { notification_type: producer };
      expect(isRetainedRemoteNotification(notification)).toBe(true);
      expect(isRetainedNotification(notification)).toBe(true);
    },
  );

  testCase.each([
    'marketing',
    'perps',
    'social_ai',
    'price_alert',
    'new_campaign',
  ])('rejects %s even if it borrows an activity type', (producer) => {
    const notification = {
      notification_type: producer,
      type: 'eth_received',
    };
    expect(isRetainedRemoteNotification(notification)).toBe(false);
    expect(isRetainedNotification(notification)).toBe(false);
  });

  testCase.each([
    'snap',
    'eth_received',
    'erc20_sent',
    'metamask_swap_completed',
  ])(
    'preserves saved %s activity without accepting it as a remote push',
    (type) => {
      expect(isRetainedNotification({ type })).toBe(true);
      expect(isRetainedRemoteNotification({ type })).toBe(false);
    },
  );

  testCase.each([
    null,
    undefined,
    {},
    { type: 'features_announcement' },
    { type: 'platform' },
  ])('rejects unsupported data: %j', (notification) => {
    expect(isRetainedNotification(notification)).toBe(false);
    expect(isRetainedRemoteNotification(notification)).toBe(false);
  });
});
