import { Messenger } from '@metamask/messenger';
import { getRootMessenger } from '../../lib/messenger';
import {
  getTransactionPayControllerInitMessenger,
  getTransactionPayControllerMessenger,
} from './transaction-pay-controller-messenger';

describe('getTransactionPayControllerMessenger', () => {
  it('returns a restricted messenger', () => {
    const messenger = getRootMessenger<never, never>();
    const transactionPayControllerMessenger =
      getTransactionPayControllerMessenger(messenger);

    expect(transactionPayControllerMessenger).toBeInstanceOf(Messenger);
  });

  it('does not expose fiat order or quote actions', () => {
    const messenger = getRootMessenger();
    const delegateSpy = jest.spyOn(messenger, 'delegate');
    getTransactionPayControllerMessenger(messenger);

    const delegatedActions = delegateSpy.mock.calls.flatMap(
      ([options]) => options.actions ?? [],
    );
    expect(
      delegatedActions.some((action) => action.startsWith('RampsController:')),
    ).toBe(false);
  });

  it('delegates NetworkController:getNetworkConfigurationByChainId', () => {
    const messenger = getRootMessenger<never, never>();
    const delegateSpy = jest.spyOn(messenger, 'delegate');

    getTransactionPayControllerMessenger(messenger);

    expect(delegateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        actions: expect.arrayContaining([
          'NetworkController:getNetworkConfigurationByChainId',
        ]),
      }),
    );
  });

  it('delegates SentinelApiService:simulateTransactions', () => {
    const messenger = getRootMessenger<never, never>();
    const delegateSpy = jest.spyOn(messenger, 'delegate');

    getTransactionPayControllerMessenger(messenger);

    expect(delegateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        actions: expect.arrayContaining([
          'SentinelApiService:simulateTransactions',
        ]),
      }),
    );
  });
});

describe('getTransactionPayControllerInitMessenger', () => {
  it('returns a restricted messenger', () => {
    const messenger = getRootMessenger<never, never>();
    const transactionPayControllerInitMessenger =
      getTransactionPayControllerInitMessenger(messenger);

    expect(transactionPayControllerInitMessenger).toBeInstanceOf(Messenger);
  });

  it('delegates amount-commit TransactionController and AccountsController actions', () => {
    const messenger = getRootMessenger<never, never>();
    const delegateSpy = jest.spyOn(messenger, 'delegate');

    getTransactionPayControllerInitMessenger(messenger);

    expect(delegateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        actions: expect.arrayContaining([
          'AccountsController:getSelectedAccount',
          'NetworkController:getNetworkClientById',
          'TransactionController:getState',
          'TransactionController:updateTransaction',
        ]),
      }),
    );
  });
});
