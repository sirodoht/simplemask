import { Suite } from 'mocha';
import { Driver } from '../../../webdriver/driver';
import FixtureBuilderV2 from '../../../fixtures/fixture-builder-v2';
import { openActivityTransactionDetails } from '../../../page-objects/flows/activity.flow';
import { login } from '../../../page-objects/flows/login.flow';
import { openTronActivityList } from '../../../page-objects/flows/tron-activity.flow';
import { selectAllNetworksFromNetworkSelect } from '../../../page-objects/flows/network.flow';
import { selectTronNetwork } from '../../../page-objects/flows/tron-network.flow';
import { withTronFixtures } from '../../tron/fixtures/with-tron-fixtures';
import {
  TRON_ACCOUNT_ADDRESS,
  TRON_RECIPIENT_ADDRESS,
} from '../../tron/mocks/common-tron';
import {
  swapTx,
  trc20ApproveTx,
  trxReceiveTx,
  trxSendTx,
} from '../../tron/mocks/tron-tx-fixtures';
import { mockEvmActivityApi } from './utils/mock-evm-activity-api';

const BASE_TIMESTAMP = Date.now();

describe('Tron - Activity types', function (this: Suite) {
  this.timeout(180_000);

  it('renders approved cap, sent, received and swapped transactions', async function () {
    // Staggered timestamps keep the activity list ordering deterministic.
    const approveTx = trc20ApproveTx({
      symbol: 'USDT',
      amount: '10000000',
      spender: TRON_RECIPIENT_ADDRESS,
      status: 'Confirmed',
      timestamp: BASE_TIMESTAMP - 60_000,
    });
    const sendTx = trxSendTx({
      amountSun: 1_000_000,
      to: TRON_RECIPIENT_ADDRESS,
      status: 'Confirmed',
      timestamp: BASE_TIMESTAMP - 120_000,
    });
    const receiveTx = trxReceiveTx({
      amountSun: 2_500_000,
      from: TRON_RECIPIENT_ADDRESS,
      status: 'Confirmed',
      timestamp: BASE_TIMESTAMP - 180_000,
    });
    const swap = swapTx({
      srcSymbol: 'TRX',
      srcAmount: '1',
      destSymbol: 'USDT',
      destAmount: '2500000',
      status: 'Confirmed',
      timestamp: BASE_TIMESTAMP - 240_000,
    });

    await withTronFixtures(
      {
        accounts: [
          {
            address: TRON_ACCOUNT_ADDRESS,
            transactions: {
              raw: [sendTx, receiveTx, swap.raw, approveTx.raw],
              trc20: [approveTx.trc20, swap.trc20],
            },
          },
        ],
        fixtures: new FixtureBuilderV2().build(),
        title: this.test?.fullTitle(),
      },
      async ({ driver }: { driver: Driver }) => {
        await login(driver, {
          validateBalance: false,
        });
        const activityTab = await openTronActivityList(driver);

        // Approved spending cap
        await activityTab.checkTransactionActivityByText(
          'Approved spending cap',
        );
        await activityTab.checkTransactionAmount('-10 USDT');
        const approveDetails = await openActivityTransactionDetails({
          driver,
          activityTab,
          activityText: 'Approved spending cap',
        });
        await approveDetails.checkTitle('Approved spending cap');
        await approveDetails.clickBackButton();

        // Sent
        await activityTab.checkTransactionActivityByText('Sent TRX');
        await activityTab.checkTransactionAmount('-1 TRX');
        const sendDetails = await openActivityTransactionDetails({
          driver,
          activityTab,
          activityText: 'Sent TRX',
        });
        await sendDetails.checkTitle('Sent TRX');
        await sendDetails.checkAmount('-1 TRX');
        await sendDetails.checkAddressInLog(TRON_RECIPIENT_ADDRESS);
        await sendDetails.checkAddressInLog(TRON_ACCOUNT_ADDRESS);
        await sendDetails.clickBackButton();

        // Received
        await activityTab.checkTransactionActivityByText('Received TRX');
        await activityTab.checkTransactionAmount('+2.5 TRX');

        // Swapped
        await activityTab.checkTransactionActivityByText('Swapped');
        await activityTab.checkTransactionAmount('+2.5 USDT');
        const swapDetails = await openActivityTransactionDetails({
          driver,
          activityTab,
          activityText: 'Swapped',
        });
        await swapDetails.checkTitle('Swapped');
        await swapDetails.checkAmount('-1 TRX');
        await swapDetails.checkAmount('+2.5 USDT');
        await swapDetails.clickBackButton();
      },
    );
  });

  it('hides EVM activity under the Tron-only filter and shows it under all networks', async function () {
    const sendTx = trxSendTx({
      amountSun: 1_000_000,
      to: TRON_RECIPIENT_ADDRESS,
      status: 'Confirmed',
      timestamp: BASE_TIMESTAMP - 60_000,
    });

    await withTronFixtures(
      {
        accounts: [
          {
            address: TRON_ACCOUNT_ADDRESS,
            transactions: { raw: [sendTx] },
          },
        ],
        fixtures: new FixtureBuilderV2().build(),
        testSpecificMock: mockEvmActivityApi,
        title: this.test?.fullTitle(),
      },
      async ({ driver }: { driver: Driver }) => {
        await login(driver, {
          validateBalance: false,
        });
        const activityTab = await openTronActivityList(driver);

        await activityTab.checkTransactionActivityByText('Sent TRX');
        await activityTab.checkTransactionActivityNotPresentByText('Sent ETH');

        await selectAllNetworksFromNetworkSelect(driver);
        await activityTab.checkTransactionActivityByText('Sent ETH');
        await activityTab.checkTransactionAmount('-1 ETH');

        // Restore the Tron-only filter so the EVM send is hidden again.
        await selectTronNetwork(driver);
        await activityTab.checkTransactionActivityNotPresentByText('Sent ETH');
      },
    );
  });
});
