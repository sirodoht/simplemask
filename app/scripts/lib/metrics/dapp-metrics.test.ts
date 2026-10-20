import {
  ENVIRONMENT_TYPE_POPUP,
  ENVIRONMENT_TYPE_SIDEPANEL,
} from '../../../../shared/constants/app';
import { MetaMetricsEventName } from '../../../../shared/constants/metametrics';
import { createEventBuilder, trackEvent } from '../../controllers/analytics';
import { createDappMetrics, type DappMetricsController } from './dapp-metrics';

jest.mock('../../controllers/analytics', () => ({
  createEventBuilder: jest.fn(),
  trackEvent: jest.fn(),
}));

jest.mock('../util', () => ({
  shouldEmitDappViewedEvent: jest.fn(() => true),
}));

jest.mock('../getIframeProperties', () => ({
  getIframeProperties: jest.fn(() => ({})),
}));

const tabActivatedListeners: ((info: { tabId: number }) => void)[] = [];

jest.mock('webextension-polyfill', () => ({
  tabs: {
    onActivated: {
      addListener: (listener: (info: { tabId: number }) => void) => {
        tabActivatedListeners.push(listener);
      },
    },
  },
}));

describe('createDappMetrics', () => {
  const buildMock = jest.fn(() => ({ built: true }));
  const addProperties = jest.fn(() => ({ build: buildMock }));
  const addCategory = jest.fn(() => ({ addProperties }));
  const createBuilder = jest.fn(() => ({ addCategory }));

  beforeEach(() => {
    jest.clearAllMocks();
    tabActivatedListeners.length = 0;
    (createEventBuilder as jest.Mock).mockImplementation(createBuilder);
    addCategory.mockImplementation(() => ({ addProperties }));
    addProperties.mockImplementation(() => ({ build: buildMock }));
    buildMock.mockReturnValue({ built: true });
  });

  function createController(
    overrides: Record<string, unknown> = {},
  ): DappMetricsController {
    return {
      getState: () => ({
        analyticsId: 'analytics-id',
        consentDecisionMade: true,
        optedIn: true,
      }),
      getPermittedAccounts: () => ['0xabc'],
      controllerMessenger: {
        call: jest.fn((method: string) => {
          if (method === 'AccountsController:getState') {
            return { internalAccounts: { accounts: { a: {}, b: {} } } };
          }
          if (method === 'PermissionController:hasPermissions') {
            return true;
          }
          return undefined;
        }),
      },
      permissionController: {
        state: {
          subjects: {
            'https://dapp.test': {
              origin: 'https://dapp.test',
              permissions: {},
            },
          },
        },
      },
      appStateController: {
        state: {
          appActiveTab: {
            id: 1,
            title: 'My Dapp',
            origin: 'https://dapp.test',
            protocol: 'https:',
            url: 'https://dapp.test',
            host: 'dapp.test',
            href: 'https://dapp.test',
          },
        },
      },
      remoteFeatureFlagController: { state: { remoteFeatureFlags: {} } },
      ...overrides,
    } as unknown as DappMetricsController;
  }

  it('shouldEmitAppOpened returns false when UI is already open', () => {
    const { shouldEmitAppOpened } = createDappMetrics({
      getController: () => createController(),
      isAnyUiOpen: () => true,
    });

    expect(shouldEmitAppOpened(ENVIRONMENT_TYPE_POPUP)).toBe(false);
  });

  it('trackAppOpened emits AppOpened when UI is closed and metrics opted in', () => {
    const { trackAppOpened } = createDappMetrics({
      getController: () => createController(),
      isAnyUiOpen: () => false,
    });

    trackAppOpened(ENVIRONMENT_TYPE_SIDEPANEL);

    expect(createEventBuilder).toHaveBeenCalledWith(
      MetaMetricsEventName.AppOpened,
    );
    expect(trackEvent).toHaveBeenCalled();
  });

  it('trackDappView emits DappViewed for a connected loaded tab', () => {
    const { trackDappView } = createDappMetrics({
      getController: () => createController(),
      isAnyUiOpen: () => false,
    });

    trackDappView({
      sender: {
        tab: { id: 9, title: 'My Dapp', url: 'https://dapp.test/page' },
        url: 'https://dapp.test/page',
        frameId: 0,
      },
    });

    expect(createEventBuilder).toHaveBeenCalledWith(
      MetaMetricsEventName.DappViewed,
    );
    expect(trackEvent).toHaveBeenCalled();
  });

  it('installOnNavigateToTabListener emits DappViewed when navigating to a connected tab', () => {
    const controller = createController();
    const { trackDappView, installOnNavigateToTabListener } = createDappMetrics(
      {
        getController: () => controller,
        isAnyUiOpen: () => false,
      },
    );

    trackDappView({
      sender: {
        tab: { id: 3, title: 'My Dapp', url: 'https://dapp.test' },
        url: 'https://dapp.test',
        frameId: 0,
      },
    });

    installOnNavigateToTabListener();
    (trackEvent as jest.Mock).mockClear();

    tabActivatedListeners[0]({ tabId: 3 });

    expect(trackEvent).toHaveBeenCalled();
  });

  it('does not start a referral flow when navigating to a connected former partner', () => {
    const origin = 'https://app.hyperliquid.xyz';
    const controller = createController({
      permissionController: {
        state: { subjects: { [origin]: { origin, permissions: {} } } },
      },
      remoteFeatureFlagController: {
        state: {
          remoteFeatureFlags: {
            extensionUxDefiReferralPartners: { hyperliquid: true },
          },
        },
      },
    });
    const { trackDappView, installOnNavigateToTabListener } = createDappMetrics(
      {
        getController: () => controller,
        isAnyUiOpen: () => false,
      },
    );
    trackDappView({
      sender: {
        tab: { id: 3, title: 'Connected dApp', url: origin },
        url: origin,
        frameId: 0,
      },
    });
    installOnNavigateToTabListener();
    tabActivatedListeners[0]({ tabId: 3 });

    expect(controller.controllerMessenger.call).not.toHaveBeenCalledWith(
      'LegacyBackgroundApiService:handleDefiReferral',
      expect.anything(),
      expect.anything(),
      expect.anything(),
    );
    expect(trackEvent).toHaveBeenCalled();
  });

  it('trackDappView does not overwrite senderOriginMapping for the same tab', () => {
    const controller = createController({
      permissionController: {
        state: {
          subjects: {
            'https://first.test': {
              origin: 'https://first.test',
              permissions: {},
            },
            'https://second.test': {
              origin: 'https://second.test',
              permissions: {},
            },
          },
        },
      },
    });
    const { trackDappView, installOnNavigateToTabListener } = createDappMetrics(
      {
        getController: () => controller,
        isAnyUiOpen: () => false,
      },
    );

    const port = (senderUrl: string) => ({
      sender: {
        tab: { id: 42, title: 'Loaded', url: 'https://tab.test' },
        url: senderUrl,
        frameId: 0,
      },
    });

    trackDappView(port('https://first.test'));
    trackDappView(port('https://second.test'));

    installOnNavigateToTabListener();
    (trackEvent as jest.Mock).mockClear();
    (createEventBuilder as jest.Mock).mockClear();

    tabActivatedListeners[0]({ tabId: 42 });

    expect(createEventBuilder).toHaveBeenCalledTimes(1);
    expect(buildMock).toHaveBeenCalledWith({
      referrer: { url: 'https://first.test' },
      excludeMetaMetricsId: true,
    });
  });
});
