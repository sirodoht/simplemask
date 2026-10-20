import { describe, it, expect } from '@jest/globals';
import {
  Messenger,
  MOCK_ANY_NAMESPACE,
  type MockAnyNamespace,
  type MessengerActions,
  type MessengerEvents,
} from '@metamask/messenger';
import {
  SnapInterfaceController,
  type SnapInterfaceControllerMessenger,
} from '@metamask/snaps-controllers';
import { getDefaultAssetsControllerState } from '@metamask/assets-controller';
import { AssetSelector, Box } from '@metamask/snaps-sdk/jsx';
import type { SnapId } from '@metamask/snaps-sdk';
import { createMockInternalAccount } from '../../../../test/jest/mocks';
import { getSnapInterfaceControllerMessenger } from '../messengers/snaps';

describe('Snap EVM asset forms', () => {
  it('populates a Snap form from retained EVM assets', () => {
    const root = new Messenger<
      MockAnyNamespace,
      MessengerActions<SnapInterfaceControllerMessenger>,
      MessengerEvents<SnapInterfaceControllerMessenger>
    >({ namespace: MOCK_ANY_NAMESPACE });
    const snapId = 'npm:evm-account-snap' as SnapId;
    const mockAccount = createMockInternalAccount();
    const account = {
      ...mockAccount,
      metadata: { ...mockAccount.metadata, snap: undefined },
    };
    const assetId = 'eip155:1/slip44:60';
    root.registerActionHandler('AssetsController:getState', () => ({
      ...getDefaultAssetsControllerState(),
      assetsInfo: {
        [assetId]: {
          type: 'native',
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
      },
      assetsBalance: { [account.id]: { [assetId]: { amount: '2' } } },
    }));
    root.registerActionHandler(
      'AccountsController:listMultichainAccounts',
      () => [account],
    );
    root.registerActionHandler(
      'AccountsController:getAccountByAddress',
      () => account,
    );
    const controller = new SnapInterfaceController({
      messenger: getSnapInterfaceControllerMessenger(root),
    });
    const id = controller.createInterface(
      snapId,
      Box({
        children: AssetSelector({
          name: 'asset',
          addresses: [`eip155:1:${account.address}`],
        }),
      }),
    );
    expect(controller.getInterface(snapId, id).state).toStrictEqual({
      asset: { asset: assetId, name: 'Ethereum', symbol: 'ETH' },
    });
  });
});
