import { Messenger } from '@metamask/messenger';
import {
  SubscriptionControllerGetBillingPortalUrlAction,
  SubscriptionControllerGetCryptoApproveTransactionParamsAction,
  SubscriptionControllerGetPricingAction,
  SubscriptionControllerGetSubscriptionsAction,
  SubscriptionControllerStartSubscriptionWithCardAction,
  SubscriptionControllerUpdatePaymentMethodAction,
  SubscriptionControllerSubmitSponsorshipIntentsAction,
  SubscriptionControllerGetStateAction,
  SubscriptionControllerSubmitSubscriptionCryptoApprovalAction,
  SubscriptionControllerClearLastSelectedPaymentMethodAction,
} from '@metamask/subscription-controller';
import { AuthenticationControllerGetBearerTokenAction } from '@metamask/profile-sync-controller/auth';
import { TransactionControllerGetTransactionsAction } from '@metamask/transaction-controller';
import { AccountsControllerGetStateAction } from '@metamask/accounts-controller';
import { SmartTransactionsControllerGetStateAction } from '@metamask/smart-transactions-controller';
import { NetworkControllerGetStateAction } from '@metamask/network-controller';
import { KeyringControllerGetStateAction } from '@metamask/keyring-controller';
import { RemoteFeatureFlagControllerGetStateAction } from '@metamask/remote-feature-flag-controller';
import ExtensionPlatform from '../../platforms/extension';
import { WebAuthenticator } from '../oauth/types';
import { PreferencesControllerGetStateAction } from '../../controllers/preferences-controller';
import { AppStateControllerGetStateAction } from '../../controllers/app-state-controller';
import {
  AppStateControllerSetPendingShieldCohortAction,
  AppStateControllerSetPendingRedirectRouteAction,
  AppStateControllerSetShieldSubscriptionErrorAction,
} from '../../controllers/app-state-controller-method-action-types';
import { ShieldSubscriptionServiceMethodActions } from './shield-subscription-service-method-action-types';

export type {
  ShieldSubscriptionServiceUpdateSubscriptionCardPaymentMethodAction,
  ShieldSubscriptionServiceUpdateSubscriptionCryptoPaymentMethodAction,
  ShieldSubscriptionServiceStartSubscriptionWithCardAction,
  ShieldSubscriptionServiceHandlePostTransactionAction,
  ShieldSubscriptionServiceSubmitSubscriptionSponsorshipIntentAction,
} from './shield-subscription-service-method-action-types';

export const SERVICE_NAME = 'ShieldSubscriptionService';

export type ServiceName = typeof SERVICE_NAME;

type AllowedActions =
  | SubscriptionControllerGetPricingAction
  | SubscriptionControllerStartSubscriptionWithCardAction
  | SubscriptionControllerUpdatePaymentMethodAction
  | SubscriptionControllerGetSubscriptionsAction
  | SubscriptionControllerGetCryptoApproveTransactionParamsAction
  | SubscriptionControllerGetBillingPortalUrlAction
  | SubscriptionControllerSubmitSponsorshipIntentsAction
  | SubscriptionControllerGetStateAction
  | SubscriptionControllerSubmitSubscriptionCryptoApprovalAction
  | SubscriptionControllerClearLastSelectedPaymentMethodAction
  | TransactionControllerGetTransactionsAction
  | PreferencesControllerGetStateAction
  | AccountsControllerGetStateAction
  | SmartTransactionsControllerGetStateAction
  | NetworkControllerGetStateAction
  | RemoteFeatureFlagControllerGetStateAction
  | AuthenticationControllerGetBearerTokenAction
  | AppStateControllerGetStateAction
  | AppStateControllerSetPendingShieldCohortAction
  | AppStateControllerSetPendingRedirectRouteAction
  | AppStateControllerSetShieldSubscriptionErrorAction
  | KeyringControllerGetStateAction;

export type ShieldSubscriptionServiceEvent = never;

export type ShieldSubscriptionServiceMessenger = Messenger<
  ServiceName,
  ShieldSubscriptionServiceMethodActions | AllowedActions,
  ShieldSubscriptionServiceEvent
>;

export type ShieldSubscriptionServiceOptions = {
  /**
   * The messenger used to communicate with other services and controllers.
   */
  messenger: ShieldSubscriptionServiceMessenger;

  platform: ExtensionPlatform;

  webAuthenticator: WebAuthenticator;
};
