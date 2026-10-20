import React, { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { renderHook } from '@testing-library/react';
import { NotificationServicesController } from '@metamask/notification-services-controller';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
  useUnreadNotificationsCounter,
  useReadNotificationsCounter,
} from './useCounter';

const { TRIGGER_TYPES } = NotificationServicesController.Constants;

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

const mockState = {
  metamask: {
    isNotificationServicesEnabled: true,
    metamaskNotificationsList: [
      {
        id: 'advert-unread',
        type: TRIGGER_TYPES.FEATURES_ANNOUNCEMENT,
        isRead: false,
      },
      {
        id: 'advert-read',
        type: TRIGGER_TYPES.FEATURES_ANNOUNCEMENT,
        isRead: true,
      },
      {
        id: 'transfer-unread',
        type: TRIGGER_TYPES.ETH_RECEIVED,
        isRead: false,
      },
      { id: 'transfer-read', type: TRIGGER_TYPES.ETH_SENT, isRead: true },
    ],
  },
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={mockStore(mockState)}>{children}</Provider>
);

describe('useUnreadNotificationsCounter', () => {
  it('excludes announcements from the unread count', () => {
    const { result } = renderHook(() => useUnreadNotificationsCounter(), {
      wrapper,
    });
    expect(result.current.notificationsUnreadCount).toBe(1);
  });
});

describe('useReadNotificationsCounter', () => {
  it('counts read wallet notifications without announcements', () => {
    const { result } = renderHook(() => useReadNotificationsCounter(), {
      wrapper,
    });
    expect(result.current.notificationsReadCount).toBe(1);
  });
});
