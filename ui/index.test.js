import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { FirstTimeFlowType } from '../shared/constants/onboarding';
import * as browserRuntimeUtils from '../shared/lib/browser-runtime.utils';
import * as actions from './store/actions';
import * as selectors from './selectors';
import * as metamaskBaseSelectors from './ducks/metamask/base-selectors';
import { SEEDLESS_PASSWORD_OUTDATED_CHECK_INTERVAL_MS } from './constants';
import { getCleanAppState, runInitialActions } from '.';

jest.mock('./store/actions', () => ({
  ...jest.requireActual('./store/actions'),
  checkIsSeedlessPasswordOutdated: jest.fn(),
}));

jest.mock('./selectors', () => ({
  ...jest.requireActual('./selectors'),
  getNetworkToAutomaticallySwitchTo: jest.fn(),
  getFirstTimeFlowType: jest.fn(),
  getIsSocialLoginFlow: jest.fn(),
}));

jest.mock('./ducks/metamask/base-selectors', () => ({
  ...jest.requireActual('./ducks/metamask/base-selectors'),
  getIsUnlocked: jest.fn(),
}));

describe('Index Tests', () => {
  afterAll(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should get clean app state with socialLoginEmail undefined', async () => {
    const mockVersion = '1.0.0';
    const mockUserAgent = 'test-user-agent';

    jest.spyOn(global.platform, 'getVersion').mockReturnValue(mockVersion);
    jest
      .spyOn(window.navigator, 'userAgent', 'get')
      .mockReturnValue(mockUserAgent);

    const mockState = {
      metamask: {
        completedOnboarding: true,
        socialLoginEmail: 'test@test.com',
      },
    };
    const store = configureMockStore([thunk])({
      ...mockState,
    });

    const cleanAppState = await getCleanAppState(store);
    expect(cleanAppState).toStrictEqual({
      metamask: {
        ...mockState.metamask,
        socialLoginEmail: undefined,
      },
      version: mockVersion,
      browser: mockUserAgent,
    });
  });

  it('should remove QR sync state from downloaded state logs', async () => {
    const mockVersion = '1.0.0';
    const mockUserAgent = 'test-user-agent';

    jest.spyOn(global.platform, 'getVersion').mockReturnValue(mockVersion);
    jest
      .spyOn(window.navigator, 'userAgent', 'get')
      .mockReturnValue(mockUserAgent);

    const mockState = {
      metamask: {
        qrSyncPhase: 'displaying-qr',
        qrSyncConnectionStatus: 'connected',
        qrSyncSessionId: 'session-123',
        qrSyncQrPayload: 'qr-payload',
        syncOffer: { isOnboardingCompleted: true },
        qrSyncSelectedAccountGroupIds: ['entropy-1/0'],
        qrSyncError: { code: 'SYNC_FAILED', message: 'failed' },
        qrSyncCreatedAt: 1,
        qrSyncUpdatedAt: 2,
      },
    };
    const store = configureMockStore([thunk])({
      ...mockState,
    });

    const cleanAppState = await getCleanAppState(store);
    expect(cleanAppState).toStrictEqual({
      metamask: {
        socialLoginEmail: undefined,
      },
      version: mockVersion,
      browser: mockUserAgent,
    });
  });

  describe('runInitialActions', () => {
    beforeEach(() => {
      jest.useFakeTimers();

      jest
        .spyOn(browserRuntimeUtils, 'getBrowserName')
        .mockReturnValue('chrome');
      selectors.getNetworkToAutomaticallySwitchTo.mockReturnValue(undefined);
      metamaskBaseSelectors.getIsUnlocked.mockImplementation(
        (state) => state.metamask.isUnlocked,
      );
      selectors.getFirstTimeFlowType.mockImplementation(
        (state) => state.metamask.firstTimeFlowType,
      );
      selectors.getIsSocialLoginFlow.mockImplementation(
        (state) => state.metamask.isSocialLoginFlow,
      );
    });

    afterEach(() => {
      jest.clearAllTimers();
      jest.useRealTimers();
      jest.restoreAllMocks();
    });

    it('dispatches the outdated-password check on the initial run when the wallet is unlocked', async () => {
      const checkIsSeedlessPasswordOutdatedAction = {
        type: 'CHECK_IS_SEEDLESS_PASSWORD_OUTDATED',
      };
      jest
        .spyOn(actions, 'checkIsSeedlessPasswordOutdated')
        .mockReturnValue(checkIsSeedlessPasswordOutdatedAction);

      const store = {
        getState: jest.fn().mockReturnValue({
          metamask: {
            browserEnvironment: {},
            isUnlocked: true,
            firstTimeFlowType: FirstTimeFlowType.socialCreate,
            isSocialLoginFlow: true,
          },
        }),
        dispatch: jest.fn().mockResolvedValue(undefined),
      };

      await runInitialActions(store);

      expect(actions.checkIsSeedlessPasswordOutdated).toHaveBeenCalledWith(
        false,
        false,
      );
      expect(store.dispatch).toHaveBeenCalledWith(
        checkIsSeedlessPasswordOutdatedAction,
      );
    });

    it('dispatches the outdated-password check on the interval tick when the wallet is unlocked', async () => {
      const checkIsSeedlessPasswordOutdatedAction = {
        type: 'CHECK_IS_SEEDLESS_PASSWORD_OUTDATED',
      };
      jest
        .spyOn(actions, 'checkIsSeedlessPasswordOutdated')
        .mockReturnValue(checkIsSeedlessPasswordOutdatedAction);

      const store = {
        getState: jest.fn().mockReturnValue({
          metamask: {
            browserEnvironment: {},
            isUnlocked: true,
            firstTimeFlowType: FirstTimeFlowType.socialCreate,
            isSocialLoginFlow: true,
          },
        }),
        dispatch: jest.fn().mockResolvedValue(undefined),
      };

      await runInitialActions(store);
      actions.checkIsSeedlessPasswordOutdated.mockClear();
      store.dispatch.mockClear();

      await jest.advanceTimersByTimeAsync(
        SEEDLESS_PASSWORD_OUTDATED_CHECK_INTERVAL_MS,
      );

      expect(actions.checkIsSeedlessPasswordOutdated).toHaveBeenCalledWith(
        false,
        false,
      );
      expect(store.dispatch).toHaveBeenCalledWith(
        checkIsSeedlessPasswordOutdatedAction,
      );
    });

    it('stops the outdated-password interval after reset to a non-social login flow', async () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      const checkIsSeedlessPasswordOutdatedAction = {
        type: 'CHECK_IS_SEEDLESS_PASSWORD_OUTDATED',
      };
      jest
        .spyOn(actions, 'checkIsSeedlessPasswordOutdated')
        .mockReturnValue(checkIsSeedlessPasswordOutdatedAction);

      const store = {
        getState: jest
          .fn()
          .mockReturnValueOnce({
            metamask: {
              browserEnvironment: {},
              isUnlocked: true,
              firstTimeFlowType: FirstTimeFlowType.socialCreate,
              isSocialLoginFlow: true,
            },
          })
          .mockReturnValue({
            metamask: {
              browserEnvironment: {},
              isUnlocked: true,
              firstTimeFlowType: FirstTimeFlowType.create,
              isSocialLoginFlow: false,
            },
          }),
        dispatch: jest.fn().mockResolvedValue(undefined),
      };

      await runInitialActions(store);
      clearIntervalSpy.mockClear();
      actions.checkIsSeedlessPasswordOutdated.mockClear();
      store.dispatch.mockClear();
      store.getState.mockClear();

      await jest.advanceTimersByTimeAsync(
        SEEDLESS_PASSWORD_OUTDATED_CHECK_INTERVAL_MS,
      );

      expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
      expect(actions.checkIsSeedlessPasswordOutdated).not.toHaveBeenCalled();
      expect(store.dispatch).not.toHaveBeenCalled();
      expect(store.getState).toHaveBeenCalledTimes(1);

      await jest.advanceTimersByTimeAsync(
        SEEDLESS_PASSWORD_OUTDATED_CHECK_INTERVAL_MS,
      );

      expect(store.getState).toHaveBeenCalledTimes(1);
    });
  });
});
