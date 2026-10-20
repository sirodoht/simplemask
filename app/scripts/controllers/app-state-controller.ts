import { v4 as uuid } from 'uuid';
import log from 'loglevel';
import { ApprovalType } from '@metamask/controller-utils';
import {
  BaseController,
  ControllerGetStateAction,
  ControllerStateChangeEvent,
  StateMetadata,
} from '@metamask/base-controller';
import {
  ApprovalControllerAcceptRequestAction,
  ApprovalControllerAddRequestAction,
} from '@metamask/approval-controller';
import { DeferredPromise, createDeferredPromise } from '@metamask/utils';
import type { QrScanRequest, SerializedUR } from '@metamask/eth-qr-keyring';
import type { Messenger } from '@metamask/messenger';
import { Browser } from 'webextension-polyfill';
import {
  KeyringControllerGetStateAction,
  KeyringControllerUnlockEvent,
} from '@metamask/keyring-controller';
import { ProfileMetricsControllerSkipInitialDelayAction } from '@metamask/profile-metrics-controller';
import { ErrorCode } from '@metamask/hw-wallet-sdk';

import { MINUTE } from '../../../shared/constants/time';
import { AUTO_LOCK_TIMEOUT_ALARM } from '../../../shared/constants/alarms';
import { isManifestV3 } from '../../../shared/lib/mv3.utils';
import {
  ENVIRONMENT_TYPE_BACKGROUND,
  POLLING_TOKEN_ENVIRONMENT_TYPES,
  ORIGIN_METAMASK,
} from '../../../shared/constants/app';
import { DEFAULT_AUTO_LOCK_TIME_LIMIT } from '../../../shared/constants/preferences';
import { LastInteractedConfirmationInfo } from '../../../shared/types/confirm';
import { SecurityAlertResponse } from '../lib/ppom/types';
import {
  AccountOverviewTabKey,
  StorageWriteErrorType,
} from '../../../shared/constants/app-state';
import type {
  ThrottledOrigins,
  ThrottledOrigin,
} from '../../../shared/types/origin-throttling';
import {
  ScanAddressResponse,
  CachedScanAddressResponse,
  GetAddressSecurityAlertResponse,
  AddAddressSecurityAlertResponse,
} from '../../../shared/lib/trust-signals';
import { PendingRedirectRoute } from '../../../shared/lib/pending-redirect-state';
import type { DeferredDeepLink } from '../../../shared/lib/deep-links/types';
import type { Preferences } from '../../../shared/types/preferences';
import type { HistoricalMoneyAccount } from '../../../shared/types/historical-money-account';
import {
  createHardwareWalletError,
  HardwareWalletType,
  toHardwareWalletError,
} from '../../../shared/lib/hardware-wallets';
import { LegacyBackgroundApiServiceSetLockedAction } from '../services/legacy-background-api-service-method-action-types';
import type {
  PreferencesControllerGetStateAction,
  PreferencesControllerStateChangeEvent,
} from './preferences-controller';
import { AppStateControllerMethodActions } from './app-state-controller-method-action-types';

export type AppStateControllerState = {
  activeQrCodeScanRequest: QrScanRequest | null;
  /** True when QR scan completed successfully, false when cancelled/rejected, null when no recent completion. Used to avoid navigating to activity on rejection. */
  lastQrScanCompletedSuccessfully: boolean | null;
  addressSecurityAlertResponses: Record<string, CachedScanAddressResponse>;
  appActiveTab?: {
    id: number;
    title: string;
    origin: string;
    protocol: string;
    url: string;
    host: string;
    href: string;
    favIconUrl?: string;
  };
  browserEnvironment: Record<string, string>;
  connectedStatusPopoverHasBeenShown: boolean;
  // States used for displaying the changed network toast
  currentExtensionPopupId: number;
  currentPopupId?: number;
  defaultHomeActiveTabName: AccountOverviewTabKey | null;
  fullScreenGasPollTokens: string[];
  // This key is only used for checking if the user had set advancedGasFee
  // prior to Migration 92.3 where we split out the setting to support
  // multiple networks.
  // TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31860
  // eslint-disable-next-line @typescript-eslint/naming-convention
  hadAdvancedGasFeesSetPriorToMigration92_3: boolean;
  pendingExtensionVersion: string | null;
  lastInteractedConfirmationInfo?: LastInteractedConfirmationInfo;
  lastUpdatedAt: number | null;
  lastUpdatedFromVersion: string | null;
  lastViewedUserSurvey: number | null;
  newPrivacyPolicyToastClickedOrClosed: boolean | null;
  newPrivacyPolicyToastShownDate: number | null;
  arcUsageNoticeShown: boolean;
  pna25Acknowledged: boolean;
  notificationGasPollTokens: string[];
  onboardingDate: number | null;
  outdatedBrowserWarningLastShown: number | null;
  popupGasPollTokens: string[];
  sidePanelGasPollTokens: string[];
  productTour?: string;
  recoveryPhraseReminderHasBeenShown: boolean;
  recoveryPhraseReminderLastShown: number;
  signatureSecurityAlertResponses: Record<string, SecurityAlertResponse>;
  historicalMoneyAccounts: Record<string, HistoricalMoneyAccount>;
  snapsInstallPrivacyWarningShown?: boolean;
  termsOfUseLastAgreed?: number;
  throttledOrigins: ThrottledOrigins;
  timeoutMinutes: number;
  trezorModel: string | null;
  updateModalLastDismissedAt: number | null;
  hasShownMultichainAccountsIntroModal: boolean;
  /**
   * The pending redirect route to be applied after the default page is loaded.
   * If this is set, next time default page is loaded, the redirect will be applied.
   */
  pendingRedirectRoute: PendingRedirectRoute | null;
  deferredDeepLink?: DeferredDeepLink;

  /**
   * Whether the wallet reset is in progress.
   */
  isWalletResetInProgress: boolean;

  /**
   * The type of storage write error that occurred, or null if no error.
   * When not null, indicates the storage error toast should be shown.
   * Used to show specific error messages (e.g., disk space vs general error).
   */
  storageWriteErrorType: StorageWriteErrorType | null;

  /**
   * When true, unlock UI must not auto-start biometrics unlock (cross-surface).
   * Used to avoid immediately re-prompting biometrics after the user manually locks the wallet.
   */
  passkeyAutoUnlockSuppressed: boolean;
  /**
   * Timestamp when the legacy passkey PRF migration reminder was last shown.
   */
  lastShownPrfMigrationReminderAt: number | null;
};

const controllerName = 'AppStateController';

/**
 * Returns the state of the {@link AppStateController}.
 */
export type AppStateControllerGetStateAction = ControllerGetStateAction<
  typeof controllerName,
  AppStateControllerState
>;

/**
 * Actions exposed by the {@link AppStateController}.
 */
export type AppStateControllerActions =
  | AppStateControllerGetStateAction
  | AppStateControllerMethodActions;

/**
 * Actions that this controller is allowed to call.
 */
export type AllowedActions =
  | ApprovalControllerAddRequestAction
  | ApprovalControllerAcceptRequestAction
  | KeyringControllerGetStateAction
  | LegacyBackgroundApiServiceSetLockedAction
  | PreferencesControllerGetStateAction
  | ProfileMetricsControllerSkipInitialDelayAction;

/**
 * Event emitted when the state of the {@link AppStateController} changes.
 */
export type AppStateControllerStateChangeEvent = ControllerStateChangeEvent<
  typeof controllerName,
  AppStateControllerState
>;

export type AppStateControllerUnlockChangeEvent = {
  type: 'AppStateController:unlockChange';
  payload: [];
};

/**
 * Events emitted by {@link AppStateController}.
 */
export type AppStateControllerEvents =
  | AppStateControllerStateChangeEvent
  | AppStateControllerUnlockChangeEvent;

/**
 * Events that this controller is allowed to subscribe.
 */
export type AllowedEvents =
  | KeyringControllerUnlockEvent
  | PreferencesControllerStateChangeEvent;

export type AppStateControllerMessenger = Messenger<
  typeof controllerName,
  AppStateControllerActions | AllowedActions,
  AppStateControllerEvents | AllowedEvents
>;

type PollingTokenType =
  | 'popupGasPollTokens'
  | 'notificationGasPollTokens'
  | 'fullScreenGasPollTokens'
  | 'sidePanelGasPollTokens';

type AppStateControllerInitState = Partial<
  Omit<
    AppStateControllerState,
    | 'signatureSecurityAlertResponses'
    | 'addressSecurityAlertResponses'
    | 'currentExtensionPopupId'
  >
>;

export type AppStateControllerOptions = {
  state?: AppStateControllerInitState;
  messenger: AppStateControllerMessenger;
  extension: Browser;
};

const getDefaultAppStateControllerState = (): AppStateControllerState => ({
  activeQrCodeScanRequest: null,
  lastQrScanCompletedSuccessfully: null,
  appActiveTab: undefined,
  browserEnvironment: {},
  connectedStatusPopoverHasBeenShown: true,
  defaultHomeActiveTabName: null,
  fullScreenGasPollTokens: [],
  // TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31860
  // eslint-disable-next-line @typescript-eslint/naming-convention
  hadAdvancedGasFeesSetPriorToMigration92_3: false,
  pendingExtensionVersion: null,
  lastUpdatedAt: null,
  lastUpdatedFromVersion: null,
  lastViewedUserSurvey: null,
  newPrivacyPolicyToastClickedOrClosed: null,
  newPrivacyPolicyToastShownDate: null,
  arcUsageNoticeShown: false,
  pna25Acknowledged: false,
  notificationGasPollTokens: [],
  onboardingDate: null,
  outdatedBrowserWarningLastShown: null,
  popupGasPollTokens: [],
  sidePanelGasPollTokens: [],
  productTour: 'accountIcon',
  recoveryPhraseReminderHasBeenShown: false,
  recoveryPhraseReminderLastShown: new Date().getTime(),
  throttledOrigins: {},
  timeoutMinutes: DEFAULT_AUTO_LOCK_TIME_LIMIT,
  trezorModel: null,
  updateModalLastDismissedAt: null,
  hasShownMultichainAccountsIntroModal: false,
  pendingRedirectRoute: null,
  historicalMoneyAccounts: {},
  isWalletResetInProgress: false,
  storageWriteErrorType: null,
  passkeyAutoUnlockSuppressed: false,
  lastShownPrfMigrationReminderAt: null,
  ...getInitialStateOverrides(),
});

/**
 * Return initial state for properties that should overwrite persisted state.
 *
 * TODO: Stop persisting state that we want to override, so that we can remove this function.
 *
 * @returns Initial state for properties that should overwrite persisted state.
 */
function getInitialStateOverrides() {
  return {
    addressSecurityAlertResponses: {},
    currentExtensionPopupId: 0,
    signatureSecurityAlertResponses: {},
  };
}

const controllerMetadata: StateMetadata<AppStateControllerState> = {
  activeQrCodeScanRequest: {
    includeInStateLogs: false,
    persist: false,
    includeInDebugSnapshot: true,
    usedInUi: true,
  },
  lastQrScanCompletedSuccessfully: {
    includeInStateLogs: false,
    persist: false,
    includeInDebugSnapshot: true,
    usedInUi: true,
  },
  addressSecurityAlertResponses: {
    includeInStateLogs: true,
    persist: false,
    includeInDebugSnapshot: true,
    usedInUi: true,
  },
  appActiveTab: {
    includeInStateLogs: true,
    persist: false,
    includeInDebugSnapshot: true,
    usedInUi: true,
  },
  browserEnvironment: {
    includeInStateLogs: true,
    persist: true,
    includeInDebugSnapshot: true,
    usedInUi: true,
  },
  connectedStatusPopoverHasBeenShown: {
    includeInStateLogs: true,
    persist: true,
    includeInDebugSnapshot: true,
    usedInUi: true,
  },
  currentExtensionPopupId: {
    includeInStateLogs: true,
    persist: false,
    includeInDebugSnapshot: true,
    usedInUi: true,
  },
  currentPopupId: {
    includeInStateLogs: true,
    persist: false,
    includeInDebugSnapshot: true,
    usedInUi: true,
  },
  defaultHomeActiveTabName: {
    includeInStateLogs: true,
    persist: true,
    includeInDebugSnapshot: true,
    usedInUi: true,
  },
  fullScreenGasPollTokens: {
    includeInStateLogs: true,
    persist: false,
    includeInDebugSnapshot: true,
    usedInUi: true,
  },
  // TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31860
  // eslint-disable-next-line @typescript-eslint/naming-convention
  hadAdvancedGasFeesSetPriorToMigration92_3: {
    includeInStateLogs: true,
    persist: true,
    includeInDebugSnapshot: true,
    usedInUi: false,
  },
  pendingExtensionVersion: {
    includeInStateLogs: true,
    persist: false,
    includeInDebugSnapshot: true,
    usedInUi: true,
  },
  lastInteractedConfirmationInfo: {
    includeInStateLogs: true,
    persist: true,
    includeInDebugSnapshot: true,
    usedInUi: true,
  },
  lastUpdatedAt: {
    includeInStateLogs: true,
    persist: true,
    includeInDebugSnapshot: true,
    usedInUi: true,
  },
  lastUpdatedFromVersion: {
    includeInStateLogs: true,
    persist: true,
    includeInDebugSnapshot: true,
    usedInUi: true,
  },
  lastViewedUserSurvey: {
    includeInStateLogs: true,
    persist: true,
    includeInDebugSnapshot: true,
    usedInUi: true,
  },
  newPrivacyPolicyToastClickedOrClosed: {
    includeInStateLogs: true,
    persist: true,
    includeInDebugSnapshot: true,
    usedInUi: true,
  },
  newPrivacyPolicyToastShownDate: {
    includeInStateLogs: true,
    persist: true,
    includeInDebugSnapshot: true,
    usedInUi: true,
  },
  arcUsageNoticeShown: {
    includeInStateLogs: true,
    persist: true,
    includeInDebugSnapshot: true,
    usedInUi: true,
  },
  pna25Acknowledged: {
    includeInStateLogs: true,
    persist: true,
    includeInDebugSnapshot: true,
    usedInUi: true,
  },
  notificationGasPollTokens: {
    includeInStateLogs: true,
    persist: false,
    includeInDebugSnapshot: true,
    usedInUi: true,
  },
  onboardingDate: {
    includeInStateLogs: true,
    persist: true,
    includeInDebugSnapshot: true,
    usedInUi: true,
  },
  outdatedBrowserWarningLastShown: {
    includeInStateLogs: true,
    persist: true,
    includeInDebugSnapshot: true,
    usedInUi: true,
  },
  popupGasPollTokens: {
    includeInStateLogs: true,
    persist: false,
    includeInDebugSnapshot: true,
    usedInUi: true,
  },
  sidePanelGasPollTokens: {
    includeInStateLogs: true,
    persist: false,
    includeInDebugSnapshot: true,
    usedInUi: true,
  },
  productTour: {
    includeInStateLogs: true,
    persist: true,
    includeInDebugSnapshot: true,
    usedInUi: true,
  },
  recoveryPhraseReminderHasBeenShown: {
    includeInStateLogs: true,
    persist: true,
    includeInDebugSnapshot: true,
    usedInUi: true,
  },
  recoveryPhraseReminderLastShown: {
    includeInStateLogs: true,
    persist: true,
    includeInDebugSnapshot: true,
    usedInUi: true,
  },
  signatureSecurityAlertResponses: {
    includeInStateLogs: true,
    persist: false,
    includeInDebugSnapshot: true,
    usedInUi: true,
  },
  historicalMoneyAccounts: {
    includeInStateLogs: false,
    persist: true,
    includeInDebugSnapshot: false,
    usedInUi: true,
  },
  snapsInstallPrivacyWarningShown: {
    includeInStateLogs: true,
    persist: true,
    includeInDebugSnapshot: true,
    usedInUi: true,
  },
  termsOfUseLastAgreed: {
    includeInStateLogs: true,
    persist: true,
    includeInDebugSnapshot: true,
    usedInUi: true,
  },
  throttledOrigins: {
    includeInStateLogs: true,
    persist: false,
    includeInDebugSnapshot: true,
    usedInUi: true,
  },
  timeoutMinutes: {
    includeInStateLogs: true,
    persist: true,
    includeInDebugSnapshot: true,
    usedInUi: false,
  },
  trezorModel: {
    includeInStateLogs: true,
    persist: true,
    includeInDebugSnapshot: true,
    usedInUi: false,
  },
  updateModalLastDismissedAt: {
    includeInStateLogs: true,
    persist: true,
    includeInDebugSnapshot: true,
    usedInUi: true,
  },
  hasShownMultichainAccountsIntroModal: {
    persist: true,
    includeInDebugSnapshot: true,
    usedInUi: true,
    includeInStateLogs: true,
  },
  pendingRedirectRoute: {
    includeInStateLogs: true,
    persist: false,
    includeInDebugSnapshot: true,
    usedInUi: true,
  },
  isWalletResetInProgress: {
    persist: true,
    includeInDebugSnapshot: true,
    usedInUi: true,
    includeInStateLogs: true,
  },
  storageWriteErrorType: {
    includeInStateLogs: true,
    persist: false,
    includeInDebugSnapshot: true,
    usedInUi: true,
  },
  passkeyAutoUnlockSuppressed: {
    includeInStateLogs: true,
    persist: false,
    includeInDebugSnapshot: true,
    usedInUi: true,
  },
  lastShownPrfMigrationReminderAt: {
    includeInStateLogs: true,
    persist: true,
    includeInDebugSnapshot: true,
    usedInUi: true,
  },
  deferredDeepLink: {
    includeInStateLogs: false,
    persist: true,
    includeInDebugSnapshot: false,
    usedInUi: true,
  },
};

const MESSENGER_EXPOSED_METHODS = [
  'addAddressSecurityAlertResponse',
  'addPollingToken',
  'addSignatureSecurityAlertResponse',
  'cancelQrCodeScan',
  'clearAppActiveTab',
  'clearPollingTokens',
  'completeQrCodeScan',
  'getAddressSecurityAlertResponse',
  'getCurrentPopupId',
  'getIsWalletResetInProgress',
  'getLastInteractedConfirmationInfo',
  'getSignatureSecurityAlertResponse',
  'getThrottledOriginState',
  'getUnlockPromise',
  'removeDeferredDeepLink',
  'removePollingToken',
  'requestQrCodeScan',
  'setAppActiveTab',
  'setArcUsageNoticeShown',
  'setBrowserEnvironment',
  'setConnectedStatusPopoverHasBeenShown',
  'setCurrentExtensionPopupId',
  'setCurrentPopupId',
  'setDefaultHomeActiveTabName',
  'setDeferredDeepLink',
  'setHasShownMultichainAccountsIntroModal',
  'setIsWalletResetInProgress',
  'setLastActiveTime',
  'setLastInteractedConfirmationInfo',
  'setLastUpdatedAt',
  'setLastUpdatedFromVersion',
  'setLastViewedUserSurvey',
  'setNewPrivacyPolicyToastClickedOrClosed',
  'setNewPrivacyPolicyToastShownDate',
  'setOnboardingDate',
  'setOutdatedBrowserWarningLastShown',
  'setPasskeyAutoUnlockSuppressed',
  'setLastShownPrfMigrationReminderAt',
  'setPendingExtensionVersion',
  'setPendingRedirectRoute',
  'setPna25Acknowledged',
  'setProductTour',
  'setRecoveryPhraseReminderHasBeenShown',
  'setRecoveryPhraseReminderLastShown',
  'setSnapsInstallPrivacyWarningShownStatus',
  'setStorageWriteErrorType',
  'setTermsOfUseLastAgreed',
  'setTrezorModel',
  'setUpdateModalLastDismissedAt',
  'updateThrottledOriginState',
] as const;

export class AppStateController extends BaseController<
  typeof controllerName,
  AppStateControllerState,
  AppStateControllerMessenger
> {
  readonly #extension: AppStateControllerOptions['extension'];

  #timer: NodeJS.Timeout | null;

  readonly waitingForUnlock: { resolve: () => void }[];

  #approvalRequestId: string | null;

  #qrCodeScanPromise: DeferredPromise<SerializedUR> | null = null;

  constructor({ state = {}, messenger, extension }: AppStateControllerOptions) {
    super({
      name: controllerName,
      metadata: controllerMetadata,
      state: {
        ...getDefaultAppStateControllerState(),
        ...state,
        ...getInitialStateOverrides(),
      },
      messenger,
    });

    this.#extension = extension;
    this.#timer = null;

    // Clearing an alarm does not remove the listeners, so we only need to register the listener once.
    if (isManifestV3) {
      this.#extension.alarms.onAlarm.addListener(
        (alarmInfo: { name: string }) => {
          if (alarmInfo.name === AUTO_LOCK_TIMEOUT_ALARM) {
            this.messenger.call('LegacyBackgroundApiService:setLocked');
            this.#extension.alarms.clear(AUTO_LOCK_TIMEOUT_ALARM);
          }
        },
      );
    }

    this.waitingForUnlock = [];

    messenger.subscribe(
      'KeyringController:unlock',
      this.#handleUnlock.bind(this),
    );

    messenger.subscribe(
      'PreferencesController:stateChange',
      ({ preferences }: { preferences: Partial<Preferences> }) => {
        const currentState = this.state;
        if (
          typeof preferences?.autoLockTimeLimit === 'number' &&
          currentState.timeoutMinutes !== preferences.autoLockTimeLimit
        ) {
          this.#setInactiveTimeout(preferences.autoLockTimeLimit);
        }
      },
    );

    const { preferences } = messenger.call('PreferencesController:getState');
    if (typeof preferences.autoLockTimeLimit === 'number') {
      this.#setInactiveTimeout(preferences.autoLockTimeLimit);
    }

    this.messenger.registerMethodActionHandlers(
      this,
      MESSENGER_EXPOSED_METHODS,
    );

    this.#approvalRequestId = null;
  }

  /**
   * Get a Promise that resolves when the extension is unlocked.
   * This Promise will never reject.
   *
   * @param shouldShowUnlockRequest - Whether the extension notification
   * popup should be opened.
   * @returns A promise that resolves when the extension is
   * unlocked, or immediately if the extension is already unlocked.
   */
  getUnlockPromise(shouldShowUnlockRequest: boolean): Promise<void> {
    return new Promise((resolve) => {
      const { isUnlocked } = this.messenger.call('KeyringController:getState');

      if (isUnlocked) {
        resolve();
      } else {
        this.#waitForUnlock(resolve, shouldShowUnlockRequest);
      }
    });
  }

  /**
   * Adds a Promise's resolve function to the waitingForUnlock queue.
   * Also opens the extension popup if specified.
   *
   * @param resolve - A Promise's resolve function that will
   * be called when the extension is unlocked.
   * @param shouldShowUnlockRequest - Whether the extension notification
   * popup should be opened.
   */
  #waitForUnlock(resolve: () => void, shouldShowUnlockRequest: boolean): void {
    this.waitingForUnlock.push({ resolve });
    this.messenger.publish('AppStateController:unlockChange');
    if (shouldShowUnlockRequest) {
      this.#requestApproval();
    }
  }

  /**
   * Drains the waitingForUnlock queue, resolving all the related Promises.
   */
  #handleUnlock(): void {
    if (this.waitingForUnlock.length > 0) {
      while (this.waitingForUnlock.length > 0) {
        this.waitingForUnlock.shift()?.resolve();
      }
      this.messenger.publish('AppStateController:unlockChange');
    }

    this.#acceptApproval();
  }

  /**
   * Sets the default home tab
   *
   * @param defaultHomeActiveTabName - the tab name
   */
  setDefaultHomeActiveTabName(
    defaultHomeActiveTabName: AccountOverviewTabKey | null,
  ): void {
    this.update((state) => {
      state.defaultHomeActiveTabName = defaultHomeActiveTabName;
    });
  }

  /**
   * Record that the user has seen the connected status info popover
   */
  setConnectedStatusPopoverHasBeenShown(): void {
    this.update((state) => {
      state.connectedStatusPopoverHasBeenShown = true;
    });
  }

  /**
   * Record that the user has been shown the recovery phrase reminder.
   */
  setRecoveryPhraseReminderHasBeenShown(): void {
    this.update((state) => {
      state.recoveryPhraseReminderHasBeenShown = true;
    });
  }

  setOnboardingDate(): void {
    this.update((state) => {
      state.onboardingDate = Date.now();
    });
  }

  setLastViewedUserSurvey(id: number) {
    this.update((state) => {
      state.lastViewedUserSurvey = id;
    });
  }

  /**
   * Sets whether the unlock screen should suppress automatic passkey WebAuthn.
   *
   * @param suppressed - When true, auto passkey unlock is suppressed.
   */
  setPasskeyAutoUnlockSuppressed(suppressed: boolean): void {
    this.update((state) => {
      state.passkeyAutoUnlockSuppressed = suppressed;
    });
  }

  /**
   * Records when the legacy passkey PRF migration reminder was last shown.
   *
   * @param lastShown - Timestamp when the reminder was shown.
   */
  setLastShownPrfMigrationReminderAt(lastShown: number): void {
    this.update((state) => {
      state.lastShownPrfMigrationReminderAt = lastShown;
    });
  }

  setNewPrivacyPolicyToastClickedOrClosed(): void {
    this.update((state) => {
      state.newPrivacyPolicyToastClickedOrClosed = true;
    });
  }

  setNewPrivacyPolicyToastShownDate(time: number): void {
    this.update((state) => {
      state.newPrivacyPolicyToastShownDate = time;
    });
  }

  setArcUsageNoticeShown(): void {
    this.update((state) => {
      state.arcUsageNoticeShown = true;
    });
  }

  setPna25Acknowledged(acknowledged: boolean, disableDelay = false): void {
    this.update((state) => {
      state.pna25Acknowledged = acknowledged;
    });
    if (disableDelay && acknowledged) {
      this.messenger.call('ProfileMetricsController:skipInitialDelay');
    }
  }

  /**
   * Sets the storage write error type, which controls whether to show the storage error toast.
   * When errorType is not null, the toast will be shown with the appropriate message.
   * This is called when set operations fail (storage.local or IndexedDB).
   *
   * @param errorType - The type of storage write error, or null to hide the toast
   */
  setStorageWriteErrorType(errorType: StorageWriteErrorType | null): void {
    this.update((state) => {
      state.storageWriteErrorType = errorType;
    });
  }

  /**
   * Record the timestamp of the last time the user has seen the recovery phrase reminder
   *
   * @param lastShown - timestamp when user was last shown the reminder.
   */
  setRecoveryPhraseReminderLastShown(lastShown: number): void {
    this.update((state) => {
      state.recoveryPhraseReminderLastShown = lastShown;
    });
  }

  /**
   * Record the timestamp of the last time the user has acceoted the terms of use
   *
   * @param lastAgreed - timestamp when user last accepted the terms of use
   */
  setTermsOfUseLastAgreed(lastAgreed: number): void {
    this.update((state) => {
      state.termsOfUseLastAgreed = lastAgreed;
    });
  }

  /**
   * Record if popover for snaps privacy warning has been shown
   * on the first install of a snap.
   *
   * @param shown - shown status
   */
  setSnapsInstallPrivacyWarningShownStatus(shown: boolean): void {
    this.update((state) => {
      state.snapsInstallPrivacyWarningShown = shown;
    });
  }

  /**
   * Record the timestamp of the last time the user has seen the outdated browser warning
   *
   * @param lastShown - Timestamp (in milliseconds) of when the user was last shown the warning.
   */
  setOutdatedBrowserWarningLastShown(lastShown: number): void {
    this.update((state) => {
      state.outdatedBrowserWarningLastShown = lastShown;
    });
  }

  /**
   * Sets the last active time to the current time.
   */
  setLastActiveTime(): void {
    this.#resetTimer();
  }

  /**
   * Set the version of the pending extension update, or null when no update is available or after update is applied.
   *
   * @param version - Version string of the available update, or null to clear.
   */
  setPendingExtensionVersion(version: string | null): void {
    this.update((state) => {
      state.pendingExtensionVersion = version;
    });
  }

  /**
   * Record the timestamp of the last time the user has dismissed the update modal
   *
   * @param updateModalLastDismissedAt - timestamp of the last time the user has dismissed the update modal.
   */
  setUpdateModalLastDismissedAt(updateModalLastDismissedAt: number): void {
    this.update((state) => {
      state.updateModalLastDismissedAt = updateModalLastDismissedAt;
    });
  }

  /**
   * Record the timestamp of the last time the user has updated
   *
   * @param lastUpdatedAt - timestamp of the last time the user has updated
   */
  setLastUpdatedAt(lastUpdatedAt: number): void {
    this.update((state) => {
      state.lastUpdatedAt = lastUpdatedAt;
    });
  }

  /**
   * Record the previous version the user updated from
   *
   * @param fromVersion - the version the user updated from
   */
  setLastUpdatedFromVersion(fromVersion: string): void {
    this.update((state) => {
      state.lastUpdatedFromVersion = fromVersion;
    });
  }

  /**
   * Sets the inactive timeout for the app
   *
   * @param timeoutMinutes - The inactive timeout in minutes.
   */
  #setInactiveTimeout(timeoutMinutes: number): void {
    this.update((state) => {
      state.timeoutMinutes = timeoutMinutes;
    });

    this.#resetTimer();
  }

  /**
   * Resets the internal inactive timer
   *
   * If the {@code timeoutMinutes} state is falsy (i.e., zero) then a new
   * timer will not be created.
   *
   */
  #resetTimer(): void {
    const { timeoutMinutes } = this.state;

    if (this.#timer) {
      clearTimeout(this.#timer);
    } else if (isManifestV3) {
      this.#extension.alarms.clear(AUTO_LOCK_TIMEOUT_ALARM);
    }

    if (!timeoutMinutes) {
      return;
    }

    // This is a temporary fix until we add a state migration.
    // Due to a historical bug in the (now-removed) legacy advanced settings
    // tab, it was possible for timeoutMinutes to be saved as a string, as
    // explained in PR 25109. `alarms.create` will fail in that case. We are
    // converting this to a number here to prevent that failure. Once
    // we add a migration to update the malformed state to the right type,
    // we will remove this conversion.
    const timeoutToSet = Number(timeoutMinutes);

    if (isManifestV3) {
      this.#extension.alarms.create(AUTO_LOCK_TIMEOUT_ALARM, {
        delayInMinutes: timeoutToSet,
        periodInMinutes: timeoutToSet,
      });
    } else {
      this.#timer = setTimeout(
        this.messenger.call.bind(
          this.messenger,
          'LegacyBackgroundApiService:setLocked',
        ),
        timeoutToSet * MINUTE,
      );
    }
  }

  /**
   * Sets the current browser and OS environment
   *
   * @param os
   * @param browser
   */
  setBrowserEnvironment(os: string, browser: string): void {
    this.update((state) => {
      state.browserEnvironment = { os, browser };
    });
  }

  /**
   * Adds a pollingToken for a given environmentType
   *
   * @param pollingToken
   * @param pollingTokenType
   */
  addPollingToken(
    pollingToken: string,
    pollingTokenType: PollingTokenType,
  ): void {
    if (
      pollingTokenType.toString() !==
        POLLING_TOKEN_ENVIRONMENT_TYPES[ENVIRONMENT_TYPE_BACKGROUND] &&
      this.#isValidPollingTokenType(pollingTokenType)
    ) {
      this.#updatePollingTokens(pollingToken, pollingTokenType);
    }
  }

  /**
   * Updates the polling token in the state.
   *
   * @param pollingToken
   * @param pollingTokenType
   */
  #updatePollingTokens(
    pollingToken: string,
    pollingTokenType: PollingTokenType,
  ) {
    this.update((state) => {
      state[pollingTokenType].push(pollingToken);
    });
  }

  /**
   * removes a pollingToken for a given environmentType
   *
   * @param pollingToken
   * @param pollingTokenType
   */
  removePollingToken(
    pollingToken: string,
    pollingTokenType: PollingTokenType,
  ): void {
    if (
      pollingTokenType.toString() !==
      POLLING_TOKEN_ENVIRONMENT_TYPES[ENVIRONMENT_TYPE_BACKGROUND]
    ) {
      const currentTokens: string[] = this.state[pollingTokenType];
      if (this.#isValidPollingTokenType(pollingTokenType)) {
        this.update((state) => {
          state[pollingTokenType] = currentTokens.filter(
            (token: string) => token !== pollingToken,
          );
        });
      }
    }
  }

  /**
   * Validates whether the given polling token type is a valid one.
   *
   * @param pollingTokenType
   * @returns true if valid, false otherwise.
   */
  #isValidPollingTokenType(pollingTokenType: PollingTokenType): boolean {
    const validTokenTypes: PollingTokenType[] = [
      'popupGasPollTokens',
      'notificationGasPollTokens',
      'fullScreenGasPollTokens',
      'sidePanelGasPollTokens',
    ];

    return validTokenTypes.includes(pollingTokenType);
  }

  /**
   * clears all pollingTokens
   */
  clearPollingTokens(): void {
    this.update((state) => {
      state.popupGasPollTokens = [];
      state.notificationGasPollTokens = [];
      state.fullScreenGasPollTokens = [];
      state.sidePanelGasPollTokens = [];
    });
  }

  /**
   * Sets whether the multichain intro modal has been shown to the user
   *
   * @param hasShown - Whether the modal has been shown
   */
  setHasShownMultichainAccountsIntroModal(hasShown: boolean): void {
    this.update((state) => {
      state.hasShownMultichainAccountsIntroModal = hasShown;
    });
  }

  /**
   * Sets the product tour to be shown to the user
   *
   * @param productTour - Tour name to show (e.g., 'accountIcon') or empty string to hide
   */
  setProductTour(productTour: string): void {
    this.update((state) => {
      state.productTour = productTour;
    });
  }

  /**
   * Sets a unique ID for the current extension popup
   *
   * @param currentExtensionPopupId
   */
  setCurrentExtensionPopupId(currentExtensionPopupId: number): void {
    this.update((state) => {
      state.currentExtensionPopupId = currentExtensionPopupId;
    });
  }

  /**
   * Sets a property indicating the model of the user's Trezor hardware wallet
   *
   * @param trezorModel - The Trezor model.
   */
  setTrezorModel(trezorModel: string | null): void {
    this.update((state) => {
      state.trezorModel = trezorModel;
    });
  }

  getSignatureSecurityAlertResponse(
    securityAlertId: string,
  ): SecurityAlertResponse {
    return this.state.signatureSecurityAlertResponses[securityAlertId];
  }

  addSignatureSecurityAlertResponse(
    securityAlertResponse: SecurityAlertResponse,
  ): void {
    if (securityAlertResponse.securityAlertId) {
      this.update((state) => {
        state.signatureSecurityAlertResponses[
          String(securityAlertResponse.securityAlertId)
        ] = securityAlertResponse;
      });
    }
  }

  getAddressSecurityAlertResponse: GetAddressSecurityAlertResponse = (
    cacheKey: string,
  ): ScanAddressResponse | undefined => {
    const cached = this.state.addressSecurityAlertResponses[cacheKey];

    if (!cached) {
      return undefined;
    }

    // Check if the cached response has expired (15 minute TTL)
    const now = Date.now();
    const ADDRESS_SECURITY_ALERT_TTL = 15 * MINUTE;
    if (now - cached.timestamp > ADDRESS_SECURITY_ALERT_TTL) {
      // Remove expired entry
      this.update((state) => {
        delete state.addressSecurityAlertResponses[cacheKey];
      });
      return undefined;
    }

    // Return the response without the timestamp
    const { timestamp, ...response } = cached;
    return response;
  };

  addAddressSecurityAlertResponse: AddAddressSecurityAlertResponse = (
    cacheKey: string,
    addressSecurityAlertResponse: ScanAddressResponse,
  ): void => {
    this.update((state) => {
      state.addressSecurityAlertResponses[cacheKey] = {
        ...addressSecurityAlertResponse,
        timestamp: Date.now(),
      };
    });
  };

  /**
   * A setter for the currentPopupId which indicates the id of popup window that's currently active.
   * Pass `undefined` to clear when the popup is closed.
   *
   * @param currentPopupId
   */
  setCurrentPopupId(currentPopupId: number | undefined): void {
    this.update((state) => {
      state.currentPopupId = currentPopupId;
    });
  }

  /**
   * The function returns information about the last confirmation user interacted with
   */
  getLastInteractedConfirmationInfo():
    | LastInteractedConfirmationInfo
    | undefined {
    return this.state.lastInteractedConfirmationInfo;
  }

  /**
   * Update the information about the last confirmation user interacted with
   *
   * @param lastInteractedConfirmationInfo
   */
  setLastInteractedConfirmationInfo(
    lastInteractedConfirmationInfo: LastInteractedConfirmationInfo | undefined,
  ): void {
    this.update((state) => {
      state.lastInteractedConfirmationInfo = lastInteractedConfirmationInfo;
    });
  }

  /**
   * A getter to retrieve currentPopupId saved in the appState
   */
  getCurrentPopupId(): number | undefined {
    return this.state.currentPopupId;
  }

  #requestApproval(): void {
    // If we already have a pending request this is a no-op
    if (this.#approvalRequestId) {
      return;
    }
    this.#approvalRequestId = uuid();

    this.messenger
      .call(
        'ApprovalController:addRequest',
        {
          id: this.#approvalRequestId,
          origin: ORIGIN_METAMASK,
          type: ApprovalType.Unlock,
        },
        true,
      )
      .catch(() => {
        // If the promise fails, we allow a new popup to be triggered
        this.#approvalRequestId = null;
      });
  }

  #acceptApproval(): void {
    if (!this.#approvalRequestId) {
      return;
    }
    try {
      this.messenger.call(
        'ApprovalController:acceptRequest',
        this.#approvalRequestId,
      );
    } catch (error) {
      log.error('Failed to unlock approval request', error);
    }

    this.#approvalRequestId = null;
  }

  getThrottledOriginState(origin: string): ThrottledOrigin {
    return this.state.throttledOrigins[origin];
  }

  updateThrottledOriginState(
    origin: string,
    throttledOriginState: ThrottledOrigin,
  ): void {
    this.update((state) => {
      state.throttledOrigins[origin] = throttledOriginState;
    });
  }

  /**
   * Completes a QR code scan by resolving the promise with the scanned data.
   *
   * @param scannedData - The data that was scanned from the QR code.
   * @throws If no QR code scan is in progress.
   */
  completeQrCodeScan(scannedData: SerializedUR): void {
    if (!this.#qrCodeScanPromise) {
      throw new Error('No QR code scan is in progress.');
    }

    this.update((state) => {
      state.activeQrCodeScanRequest = null;
      state.lastQrScanCompletedSuccessfully = true;
    });

    this.#qrCodeScanPromise.resolve(scannedData);
    this.#qrCodeScanPromise = null;
  }

  /**
   * Cancels the current QR code scan, if one is in progress.
   * This will reject the promise with an error.
   *
   * @param error - The error (or serialized form) to reject the promise with.
   * Callers across the extension-port boundary may pass a plain string or a
   * serialized `HardwareWalletError` JSON shape because `Error` instances do
   * not survive port serialization. Missing payloads default to
   * `ErrorCode.UserCancelled`.
   * @throws If no QR code scan is in progress.
   */
  cancelQrCodeScan(error?: unknown): void {
    if (!this.#qrCodeScanPromise) {
      throw new Error('No QR code scan is in progress.');
    }

    this.update((state) => {
      state.activeQrCodeScanRequest = null;
      state.lastQrScanCompletedSuccessfully = false;
    });

    this.#qrCodeScanPromise.reject(
      toHardwareWalletError(
        error ??
          createHardwareWalletError(
            ErrorCode.UserCancelled,
            HardwareWalletType.Qr,
            'Scan cancelled',
          ),
        HardwareWalletType.Qr,
      ),
    );
    this.#qrCodeScanPromise = null;
  }

  /**
   * Requests a QR code scan and returns a promise that resolves with the scanned data.
   * If a scan is already in progress, it returns the existing promise.
   *
   * @param request - The QR code scan request.
   * @returns The scanned QR code data.
   */
  requestQrCodeScan(request: QrScanRequest): Promise<SerializedUR> {
    if (this.#qrCodeScanPromise) {
      return this.#qrCodeScanPromise.promise;
    }

    const deferredPromise = createDeferredPromise<SerializedUR>();
    this.#qrCodeScanPromise = deferredPromise;

    this.update((state) => {
      state.activeQrCodeScanRequest = request;
      state.lastQrScanCompletedSuccessfully = null;
    });

    return deferredPromise.promise;
  }

  /**
   * Sets the active tab information
   *
   * @param tabData - The active tab data
   */

  setAppActiveTab(tabData: {
    id: number;
    title: string;
    origin: string;
    protocol: string;
    url: string;
    host: string;
    href: string;
    favIconUrl?: string;
  }): void {
    this.update((state) => {
      state.appActiveTab = tabData;
    });
  }

  /**
   * Clears the active tab information by setting appActiveTab to undefined.
   */
  clearAppActiveTab(): void {
    this.update((state) => {
      state.appActiveTab = undefined;
    });
  }

  /**
   * Sets the pending redirect route to be applied after the default page is loaded.
   *
   * @param route - The pending redirect route.
   */
  setPendingRedirectRoute(route: PendingRedirectRoute | null): void {
    this.update((state) => {
      state.pendingRedirectRoute = route;
    });
  }

  setIsWalletResetInProgress(isResetting: boolean): void {
    this.update((state) => {
      state.isWalletResetInProgress = isResetting;
    });
  }

  getIsWalletResetInProgress(): boolean {
    return this.state.isWalletResetInProgress;
  }

  /**
   * Updates state with deferred deep link data.
   *
   * @param deferredDeepLink - Deferred deep link data.
   */
  setDeferredDeepLink(deferredDeepLink: DeferredDeepLink): void {
    this.update((state) => {
      state.deferredDeepLink = deferredDeepLink;
    });
  }

  /**
   * Removes deferred deep link data.
   */
  removeDeferredDeepLink(): void {
    this.update((state) => {
      state.deferredDeepLink = undefined;
    });
  }
}
