import {
  Messenger,
  type MessengerActions,
  type MessengerEvents,
} from '@metamask/messenger';
import { NetworkEnablementControllerMessenger } from '@metamask/network-enablement-controller';
import { RootMessenger } from '../../../lib/messenger';

export function getNetworkEnablementControllerMessenger(
  messenger: RootMessenger<
    MessengerActions<NetworkEnablementControllerMessenger>,
    MessengerEvents<NetworkEnablementControllerMessenger>
  >,
): NetworkEnablementControllerMessenger {
  const controllerMessenger: NetworkEnablementControllerMessenger =
    new Messenger({
      namespace: 'NetworkEnablementController',
      parent: messenger,
    });
  messenger.delegate({
    messenger: controllerMessenger,
    actions: [
      'ConfigRegistryController:getState',
      'NetworkController:getState',
      'MultichainNetworkController:getState',
    ],
    events: [
      'NetworkController:networkAdded',
      'NetworkController:networkRemoved',
      'NetworkController:stateChange',
      'TransactionController:transactionSubmitted',
    ],
  });
  return controllerMessenger;
}
