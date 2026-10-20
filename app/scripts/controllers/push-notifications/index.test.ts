/* eslint-disable @typescript-eslint/naming-convention */
import type { PushAnalyticsPayload } from '@metamask/notification-services-controller/push-services';
import { it } from '@jest/globals';
import { installPushNotificationFilter, onPushNotificationClicked } from '.';

jest.mock('../../platforms/extension', () =>
  jest.fn().mockImplementation(() => ({
    getExtensionURL: jest
      .fn()
      .mockReturnValue('chrome-extension://id/home.html'),
  })),
);

const mockOpenWindow = jest.fn().mockResolvedValue(null);

beforeAll(() => {
  Object.assign(globalThis, { clients: { openWindow: mockOpenWindow } });
});

beforeEach(() => {
  mockOpenWindow.mockClear();
});

describe('onPushNotificationClicked', () => {
  const makeEvent = (notificationId = 'event-id'): NotificationEvent =>
    ({
      notification: {
        close: jest.fn(),
        data: {
          notification_id: notificationId,
          notification_type: 'wallet_activity',
        },
      },
      waitUntil: jest.fn(),
    }) as unknown as NotificationEvent;

  it('uses provided payload notification_id for navigation', async () => {
    const event = makeEvent();
    const payload: PushAnalyticsPayload = {
      notification_id: 'payload-id',
      notification_type: 'wallet_activity',
      notification_subtype: 'eth_received',
    };

    await onPushNotificationClicked(event, payload);

    expect(event.notification.close).toHaveBeenCalled();
    expect(mockOpenWindow).toHaveBeenCalledWith(
      'chrome-extension://id/home.html#notifications/payload-id',
    );
  });

  it('falls back to event.notification.data when no payload given', async () => {
    const event = makeEvent('event-id');

    await onPushNotificationClicked(event);

    expect(event.notification.close).toHaveBeenCalled();
    expect(mockOpenWindow).toHaveBeenCalledWith(
      'chrome-extension://id/home.html#notifications/event-id',
    );
  });

  it('closes an old marketing notification without opening a page', async () => {
    const event = makeEvent();
    await onPushNotificationClicked(event, {
      notification_id: 'campaign',
      notification_type: 'marketing',
      notification_subtype: 'promotion',
    });
    expect(event.notification.close).toHaveBeenCalled();
    expect(mockOpenWindow).not.toHaveBeenCalled();
  });

  it('keeps a notification id inside its own route segment', async () => {
    await onPushNotificationClicked(makeEvent('id/../settings?ad=true'));
    expect(mockOpenWindow).toHaveBeenCalledWith(
      'chrome-extension://id/home.html#notifications/id%2F..%2Fsettings%3Fad%3Dtrue',
    );
  });
});

describe('push delivery filter', () => {
  const dispatchPush = (payload: unknown, malformed = false) => {
    const target = new EventTarget();
    installPushNotificationFilter(
      target as unknown as Pick<ServiceWorkerGlobalScope, 'addEventListener'>,
    );
    const renderBanner = jest.fn();
    target.addEventListener('push', renderBanner);
    const event = new Event('push');
    Object.defineProperty(event, 'data', {
      value: {
        json: () => {
          if (malformed) {
            throw new SyntaxError('Invalid push payload');
          }
          return payload;
        },
      },
    });
    target.dispatchEvent(event);
    return renderBanner;
  };

  it.each(['marketing', 'perps', 'social_ai', 'new_campaign'])(
    'blocks %s before the banner handler runs',
    (producer) => {
      expect(
        dispatchPush({ data: { notification_type: producer } }),
      ).not.toHaveBeenCalled();
    },
  );

  it.each(['wallet_activity', 'agentic_cli'])('delivers %s', (producer) => {
    expect(
      dispatchPush({ data: { notification_type: producer } }),
    ).toHaveBeenCalledTimes(1);
  });

  it('blocks malformed and unclassified payloads', () => {
    expect(dispatchPush(undefined, true)).not.toHaveBeenCalled();
    expect(
      dispatchPush({ notification: { title: 'Campaign' } }),
    ).not.toHaveBeenCalled();
  });
});
