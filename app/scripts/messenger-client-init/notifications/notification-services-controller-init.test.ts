import { Controller as NotificationServicesController } from '@metamask/notification-services-controller/notification-services';
import {
  Messenger,
  MOCK_ANY_NAMESPACE,
  type MockAnyNamespace,
  type MessengerActions,
  type MessengerEvents,
} from '@metamask/messenger';
import { buildControllerInitRequestMock } from '../test/utils';
import { MessengerClientInitRequest } from '../types';
import {
  getNotificationServicesControllerMessenger,
  type NotificationServicesControllerMessenger,
} from '../messengers/notifications';
import { getRootMessenger } from '../../lib/messenger';
import { NotificationServicesControllerInit } from './notification-services-controller-init';

jest.mock('@metamask/notification-services-controller/notification-services');
jest.mock('../../../../package.json', () => ({
  version: '1.2.3',
}));

function buildInitRequestMock(): jest.Mocked<
  MessengerClientInitRequest<NotificationServicesControllerMessenger>
> {
  const baseControllerMessenger = getRootMessenger();

  return {
    ...buildControllerInitRequestMock(),
    controllerMessenger: getNotificationServicesControllerMessenger(
      baseControllerMessenger,
    ),
    initMessenger: undefined,
  };
}

describe('NotificationServicesControllerInit', () => {
  const arrange = () => {
    const NotificationServicesControllerClassMock = jest.mocked(
      NotificationServicesController,
    );

    const requestMock = buildInitRequestMock();

    return {
      NotificationServicesControllerClassMock,
      requestMock,
    };
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns controller instance', () => {
    const { requestMock } = arrange();
    const result = NotificationServicesControllerInit(requestMock);
    expect(result.messengerClient).toBeInstanceOf(
      NotificationServicesController,
    );
  });

  it('initializes with correct messenger and state', () => {
    const { requestMock, NotificationServicesControllerClassMock } = arrange();
    NotificationServicesControllerInit(requestMock);

    expect(NotificationServicesControllerClassMock).toHaveBeenCalledWith({
      messenger: requestMock.controllerMessenger,
      state: { isFeatureAnnouncementsEnabled: false },
      env: {
        featureAnnouncements: {
          platform: 'extension',
          spaceId: '',
          accessToken: '',
          platformVersion: expect.any(String),
        },
        locale: expect.any(Function),
      },
    });
  });

  it('does not fetch announcements even when remote marketing preferences enable them', async () => {
    const { Controller } = jest.requireActual<
      typeof import('@metamask/notification-services-controller/notification-services')
    >('@metamask/notification-services-controller/notification-services');
    const rootMessenger = getRootMessenger();
    const dependencies = new Messenger<
      MockAnyNamespace,
      MessengerActions<NotificationServicesControllerMessenger>,
      MessengerEvents<NotificationServicesControllerMessenger>,
      typeof rootMessenger
    >({ namespace: MOCK_ANY_NAMESPACE, parent: rootMessenger });
    const getPreferences = jest.fn().mockResolvedValue({
      marketing: { inAppNotificationsEnabled: true },
    });
    dependencies.registerActionHandler(
      'AuthenticatedUserStorageService:getNotificationPreferences',
      getPreferences,
    );
    dependencies.registerActionHandler(
      'AuthenticationController:isSignedIn',
      () => true,
    );
    dependencies.registerActionHandler(
      'AuthenticationController:getBearerToken',
      jest.fn().mockRejectedValue(new Error('Offline')),
    );
    const fetchSpy = jest
      .spyOn(global, 'fetch')
      .mockRejectedValue(new Error('Unexpected announcement request'));
    const controller = new Controller({
      messenger: getNotificationServicesControllerMessenger(rootMessenger),
      state: { isNotificationServicesEnabled: true },
      env: {
        featureAnnouncements: {
          platform: 'extension',
          spaceId: 'announcement-space',
          accessToken: 'test-token',
          platformVersion: '13.55.0',
        },
      },
    });

    try {
      await controller.fetchAndUpdateMetamaskNotifications();

      expect(fetchSpy).not.toHaveBeenCalled();
      expect(getPreferences).not.toHaveBeenCalled();
    } finally {
      fetchSpy.mockRestore();
    }
  });
});
