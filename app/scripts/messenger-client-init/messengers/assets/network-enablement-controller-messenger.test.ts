import { Messenger } from '@metamask/messenger';
import { getRootMessenger } from '../../../lib/messenger';
import { getNetworkEnablementControllerMessenger } from './network-enablement-controller-messenger';

describe('getNetworkEnablementControllerMessenger', () => {
  it('returns a restricted messenger', () => {
    const messenger = getRootMessenger<never, never>();
    const networkEnablementControllerMessenger =
      getNetworkEnablementControllerMessenger(messenger);
    expect(networkEnablementControllerMessenger).toBeInstanceOf(Messenger);
  });
});
