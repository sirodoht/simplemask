import { Driver } from '../webdriver/driver';
import { TestSnaps } from '../page-objects/pages/test-snaps';
import FixtureBuilderV2 from '../fixtures/fixture-builder-v2';
import { login } from '../page-objects/flows/login.flow';
import { openTestSnapClickButtonAndInstall } from '../page-objects/flows/install-test-snap.flow';
import { withFixtures } from '../helpers';
import { mockLocalizationSnap } from '../mock-response-data/snaps/snap-binary-mocks';
import { DAPP_PATH } from '../constants';

describe('Test Snap Get Locale', function () {
  it('test snap_getLocale functionality', async function () {
    await withFixtures(
      {
        dappOptions: {
          customDappPaths: [DAPP_PATH.TEST_SNAPS],
        },
        fixtures: new FixtureBuilderV2()
          .withSnapsPrivacyWarningAlreadyShown()
          .build(),
        testSpecificMock: mockLocalizationSnap,
        title: this.test?.fullTitle(),
      },
      async ({ driver }: { driver: Driver }) => {
        await login(driver);

        const testSnaps = new TestSnaps(driver);

        await openTestSnapClickButtonAndInstall(
          driver,
          'connectGetLocaleButton',
        );
        await testSnaps.checkInstallationComplete(
          'connectGetLocaleButton',
          'Reconnect to Localization Snap',
        );

        await testSnaps.clickButton('sendGetLocaleHelloButton');
        await testSnaps.checkMessageResultSpan(
          'getLocaleResultSpan',
          '"Hello, world!"',
        );
      },
    );
  });
});
