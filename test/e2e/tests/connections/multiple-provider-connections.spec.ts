/**
 * This test suite is for testing connecting to a dapp with the EVM provider.
 */
import { strict as assert } from 'assert';
import { toEvmCaipChainId } from '@metamask/multichain-network-controller';
import {
  ACCOUNT_2,
  DAPP_HOST_ADDRESS,
  DAPP_URL,
  DEFAULT_FIXTURE_ACCOUNT as EVM_ADDRESS_ONE,
  WINDOW_TITLES,
} from '../../constants';
import { withFixtures } from '../../helpers';
import { CHAIN_IDS } from '../../../../shared/constants/network';
import TestDapp from '../../page-objects/pages/test-dapp';
import ConnectAccountConfirmation from '../../page-objects/pages/confirmations/connect-account-confirmation';
import { login } from '../../page-objects/flows/login.flow';
import { Driver } from '../../webdriver/driver';
import { getEditConnectedAccountsPageForHost } from '../../page-objects/flows/permissions.flow';
import FixtureBuilderV2 from '../../fixtures/fixture-builder-v2';
import { buildEvmEip1193FixtureScopes } from '../../fixtures/permission-scopes';
import {
  getPermittedChainIdsForOrigin,
  getRequestPermissionsRequestObject,
  getRestrictedNetworks,
} from './helpers';

const EVM_ADDRESS_TWO = ACCOUNT_2;

const EVM_ACCOUNT_LABEL_ONE = 'Account 1';
const EVM_ACCOUNT_LABEL_TWO = 'Account 2';

const EXISTING_EVM_PERMISSIONS = buildEvmEip1193FixtureScopes([59144]);

/**
 * CAIP chain IDs granted by a default connect: every non-test network in the
 * default fixture, including the configured EVM chains.
 */
const DEFAULT_PERMITTED_CAIP_CHAIN_IDS = [
  toEvmCaipChainId(CHAIN_IDS.MAINNET),
  toEvmCaipChainId(CHAIN_IDS.LINEA_MAINNET),
  toEvmCaipChainId(CHAIN_IDS.BASE),
  toEvmCaipChainId(CHAIN_IDS.ARBITRUM),
  toEvmCaipChainId(CHAIN_IDS.BSC),
  toEvmCaipChainId(CHAIN_IDS.POLYGON),
  toEvmCaipChainId(CHAIN_IDS.OPTIMISM),
  toEvmCaipChainId(CHAIN_IDS.MONAD),
];

/**
 * Asserts, from the PermissionController state, that the dapp's permitted
 * chains exactly match the expected CAIP chain IDs.
 *
 * @param driver - The webdriver instance.
 * @param expectedCaipChainIds - The expected permitted CAIP chain IDs.
 */
async function checkPermittedChainIds(
  driver: Driver,
  expectedCaipChainIds: string[],
): Promise<void> {
  const permittedChainIds = await getPermittedChainIdsForOrigin(
    driver,
    DAPP_URL,
  );
  assert.deepEqual(
    [...permittedChainIds].sort(),
    [...expectedCaipChainIds].sort(),
  );
}

describe('Multiple Standard Dapp Connections', function () {
  it('should default account selection to already permitted account(s) plus the selected account (if not already permissioned) when `wallet_requestPermissions` is called with no accounts specified', async function () {
    await withFixtures(
      {
        dappOptions: { numberOfTestDapps: 1 },
        fixtures: new FixtureBuilderV2()
          .withKeyringControllerAdditionalAccountVault()
          .withAccountsControllerAdditionalAccountVault()
          .withPermissionControllerConnectedToTestDapp({
            account: EVM_ADDRESS_TWO,
          })
          .build(),
        title: this.test?.fullTitle(),
      },
      async ({ driver }) => {
        await login(driver, { validateBalance: false });
        const testDapp = new TestDapp(driver);

        const connectAccountConfirmation = new ConnectAccountConfirmation(
          driver,
        );

        await testDapp.openTestDappPage();
        await driver.switchToWindowWithTitle(WINDOW_TITLES.TestDApp);

        await testDapp.checkPageIsLoaded();

        await testDapp.checkConnectedAccounts(EVM_ADDRESS_TWO);

        const requestPermissionsWithoutAccounts =
          getRequestPermissionsRequestObject();

        await driver.executeScript(
          `window.ethereum.request(${requestPermissionsWithoutAccounts})`,
        );

        await driver.switchToWindowWithTitle(WINDOW_TITLES.Dialog);

        await connectAccountConfirmation.checkPageIsLoaded();

        await connectAccountConfirmation.checkForAccountsInPermissionList([
          EVM_ACCOUNT_LABEL_TWO,
        ]);

        await connectAccountConfirmation.confirmConnect();

        await driver.switchToWindowWithTitle(WINDOW_TITLES.TestDApp);
        await testDapp.checkConnectedAccounts(EVM_ADDRESS_TWO);
      },
    );
  });

  it('should default account selection to both accounts when `wallet_requestPermissions` is called with specific account while another is already connected', async function () {
    await withFixtures(
      {
        dappOptions: { numberOfTestDapps: 1 },
        fixtures: new FixtureBuilderV2()
          .withKeyringControllerAdditionalAccountVault()
          .withAccountsControllerAdditionalAccountVault()
          .withPermissionControllerConnectedToTestDapp({
            account: EVM_ADDRESS_TWO,
          })
          .build(),
        title: this.test?.fullTitle(),
      },
      async ({ driver }) => {
        await login(driver, { validateBalance: false });
        const testDapp = new TestDapp(driver);
        const connectAccountConfirmation = new ConnectAccountConfirmation(
          driver,
        );

        await testDapp.openTestDappPage();
        await driver.switchToWindowWithTitle(WINDOW_TITLES.TestDApp);
        await testDapp.checkPageIsLoaded();

        await testDapp.checkConnectedAccounts(EVM_ADDRESS_TWO);

        const requestPermissionsWithAccount1 =
          getRequestPermissionsRequestObject([EVM_ADDRESS_ONE]);

        await driver.executeScript(
          `window.ethereum.request(${requestPermissionsWithAccount1})`,
        );

        await driver.switchToWindowWithTitle(WINDOW_TITLES.Dialog);

        await connectAccountConfirmation.checkPageIsLoaded();

        await connectAccountConfirmation.checkForAccountsInPermissionList([
          EVM_ACCOUNT_LABEL_ONE,
          EVM_ACCOUNT_LABEL_TWO,
        ]);

        await connectAccountConfirmation.confirmConnect();

        await driver.switchToWindowWithTitle(WINDOW_TITLES.TestDApp);

        const expectedConnectedAccounts = `${EVM_ADDRESS_TWO.toLowerCase()},${EVM_ADDRESS_ONE.toLowerCase()}`;
        await testDapp.checkConnectedAccounts(expectedConnectedAccounts);
      },
    );
  });

  it('should be able to request specific chains when connecting through the EVM provider with existing permissions', async function () {
    await withFixtures(
      {
        fixtures: new FixtureBuilderV2()
          .withPermissionControllerConnectedToTestDapp({
            scopes: EXISTING_EVM_PERMISSIONS,
          })
          .withEnabledNetworks({ eip155: { '0x1': true } })
          .build(),
        title: this.test?.fullTitle(),
        dappOptions: { numberOfTestDapps: 1 },
      },
      async ({ driver }) => {
        await login(driver);
        const testDapp = new TestDapp(driver);

        await testDapp.openTestDappPage();
        await driver.switchToWindowWithTitle(WINDOW_TITLES.TestDApp);
        await testDapp.checkPageIsLoaded();

        const requestSpecificNetwork = getRestrictedNetworks(['0x1']);

        await driver.executeScript(
          `window.ethereum.request(${requestSpecificNetwork})`,
        );

        const connectAccountConfirmation = new ConnectAccountConfirmation(
          driver,
        );

        await driver.switchToWindowWithTitle(WINDOW_TITLES.Dialog);

        await connectAccountConfirmation.checkPageIsLoaded();
        await connectAccountConfirmation.confirmConnect();

        await driver.switchToWindowWithTitle(
          WINDOW_TITLES.ExtensionInFullScreenView,
        );

        const editConnectedAccountsPage =
          await getEditConnectedAccountsPageForHost(driver, DAPP_HOST_ADDRESS);

        await editConnectedAccountsPage.checkAccountsAreSelected([
          EVM_ACCOUNT_LABEL_ONE,
        ]);

        await checkPermittedChainIds(driver, [
          toEvmCaipChainId(CHAIN_IDS.MAINNET),
          toEvmCaipChainId(CHAIN_IDS.LINEA_MAINNET),
        ]);
      },
    );
  });
});
