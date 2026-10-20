import type {
  AccountsControllerListMultichainAccountsAction,
  AccountsControllerMessenger,
} from '@metamask/accounts-controller';
import {
  Messenger,
  MessengerActions,
  MessengerEvents,
  MOCK_ANY_NAMESPACE,
  MockAnyNamespace,
  EventConstraint,
} from '@metamask/messenger';
import { MultichainAccountService } from '@metamask/multichain-account-service';
import { buildControllerInitRequestMock } from '../test/utils';
import { getMultichainAccountServiceMessenger } from '../messengers/accounts';
import { getRootMessenger } from '../../lib/messenger';
import { MultichainAccountServiceInit } from './multichain-account-service-init';

jest.mock('@metamask/multichain-account-service');

describe('MultichainAccountServiceInit', () => {
  it('uses the patched EVM provider without Snap providers or flag subscriptions', () => {
    const controllerMessenger =
      getMultichainAccountServiceMessenger(getRootMessenger());
    const result = MultichainAccountServiceInit({
      ...buildControllerInitRequestMock(),
      controllerMessenger,
      initMessenger: undefined,
    });
    expect(result.messengerClient).toBeInstanceOf(MultichainAccountService);
    expect(result.memStateKey).toBeNull();
    expect(result.persistedStateKey).toBeNull();
    expect(MultichainAccountService).toHaveBeenCalledWith(
      expect.objectContaining({
        messenger: controllerMessenger,
        config: { trace: expect.any(Function) },
      }),
    );
    const options = jest.mocked(MultichainAccountService).mock.calls[0][0];
    expect(options.providers).toBeUndefined();
    expect(options.providerConfigs).toBeUndefined();
  });
});

describe('EVM-only default account providers', () => {
  it('initializes and aligns without requesting Snap services', async () => {
    const {
      MultichainAccountService: RealService,
      EvmAccountProvider,
      SolAccountProvider,
      BtcAccountProvider,
      TrxAccountProvider,
    } = jest.requireActual<
      typeof import('@metamask/multichain-account-service')
    >('@metamask/multichain-account-service');
    const root = new Messenger<
      MockAnyNamespace,
      AccountsControllerListMultichainAccountsAction,
      EventConstraint
    >({ namespace: MOCK_ANY_NAMESPACE });
    root.registerActionHandler(
      'AccountsController:listMultichainAccounts',
      () => [],
    );
    const messenger = getMultichainAccountServiceMessenger(root);
    const call = jest.spyOn(messenger, 'call');
    const evmInit = jest.spyOn(EvmAccountProvider.prototype, 'init');
    const snapInits = [
      SolAccountProvider,
      BtcAccountProvider,
      TrxAccountProvider,
    ].map((Provider) => jest.spyOn(Provider.prototype, 'init'));
    const service = new RealService({ messenger });
    await service.init();
    await service.alignWallets();
    expect(evmInit).toHaveBeenCalledTimes(1);
    for (const initialize of snapInits) {
      expect(initialize).not.toHaveBeenCalled();
    }
    expect(
      call.mock.calls.every(([action]) => !action.startsWith('Snap')),
    ).toBe(true);
    jest.restoreAllMocks();
  });
});

describe('Archived non-EVM accounts', () => {
  it('keeps account metadata while excluding non-EVM accounts from selection and discovery', () => {
    const { AccountsController } = jest.requireActual<
      typeof import('@metamask/accounts-controller')
    >('@metamask/accounts-controller');
    const { MOCK_ACCOUNT_EOA, MOCK_ACCOUNT_SOLANA_MAINNET } =
      jest.requireActual<typeof import('../../../../test/data/mock-accounts')>(
        '../../../../test/data/mock-accounts',
      );
    const root = new Messenger<
      MockAnyNamespace,
      MessengerActions<AccountsControllerMessenger>,
      MessengerEvents<AccountsControllerMessenger>
    >({ namespace: MOCK_ANY_NAMESPACE });
    const messenger: AccountsControllerMessenger = new Messenger<
      'AccountsController',
      MessengerActions<AccountsControllerMessenger>,
      MessengerEvents<AccountsControllerMessenger>,
      typeof root
    >({ namespace: 'AccountsController', parent: root });
    root.delegate({
      messenger,
      events: [
        'KeyringController:stateChange',
        'SnapAccountService:accountAssetListUpdated',
        'SnapAccountService:accountBalancesUpdated',
        'SnapAccountService:accountTransactionsUpdated',
        'MultichainNetworkController:networkDidChange',
      ],
    });
    const accounts = {
      [MOCK_ACCOUNT_EOA.id]: MOCK_ACCOUNT_EOA,
      [MOCK_ACCOUNT_SOLANA_MAINNET.id]: MOCK_ACCOUNT_SOLANA_MAINNET,
    };
    const controller = new AccountsController({
      messenger,
      state: {
        accountIdByAddress: {},
        internalAccounts: {
          accounts,
          selectedAccount: MOCK_ACCOUNT_SOLANA_MAINNET.id,
        },
      },
    });
    expect(controller.listMultichainAccounts()).toEqual([MOCK_ACCOUNT_EOA]);
    expect(
      controller.listMultichainAccounts(MOCK_ACCOUNT_SOLANA_MAINNET.scopes[0]),
    ).toEqual([]);
    expect(controller.getSelectedMultichainAccount()).toEqual(MOCK_ACCOUNT_EOA);
    expect(() =>
      controller.setSelectedAccount(MOCK_ACCOUNT_SOLANA_MAINNET.id),
    ).toThrow('Only EVM');
    expect(controller.state.internalAccounts.accounts).toEqual(accounts);
    controller.setSelectedAccount(MOCK_ACCOUNT_EOA.id);
    expect(controller.state.internalAccounts.selectedAccount).toBe(
      MOCK_ACCOUNT_EOA.id,
    );
  });
});
