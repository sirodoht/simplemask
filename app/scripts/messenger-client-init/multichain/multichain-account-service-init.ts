import {
  MultichainAccountService,
  MultichainAccountServiceMessenger,
} from '@metamask/multichain-account-service';
import { MessengerClientInitFunction } from '../types';
import { trace } from '../../../../shared/lib/trace';

/**
 * Initialize the account service with the EVM-only providers in our dependency patch.
 * @param request - The initialization request.
 * @param request.controllerMessenger - The account service messenger.
 * @param request.ensureOnboardingComplete - Wait for onboarding before creating accounts.
 * @returns The initialized account service.
 */
export const MultichainAccountServiceInit: MessengerClientInitFunction<
  MultichainAccountService,
  MultichainAccountServiceMessenger
> = ({ controllerMessenger, ensureOnboardingComplete }) => ({
  memStateKey: null,
  persistedStateKey: null,
  messengerClient: new MultichainAccountService({
    messenger: controllerMessenger,
    config: {
      // @ts-expect-error Controller uses string for names rather than enum
      trace,
    },
    ensureOnboardingComplete,
  }),
});
