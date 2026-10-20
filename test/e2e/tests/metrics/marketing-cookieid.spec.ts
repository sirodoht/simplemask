import { strict as assert } from 'assert';
import { Suite } from 'mocha';
import { MockedEndpoint, Mockttp } from 'mockttp';
import {
  getCleanAppState,
  getEventPayloads,
  withFixtures,
} from '../../helpers';
import { TestSuiteArguments } from '../confirmations/transactions/shared';
import FixtureBuilderV2 from '../../fixtures/fixture-builder-v2';
import { MOCK_ANALYTICS_ID, WINDOW_TITLES } from '../../constants';
import HomePage from '../../page-objects/pages/home/homepage';
import TestDapp from '../../page-objects/pages/test-dapp';
import { login } from '../../page-objects/flows/login.flow';

/**
 * mocks the segment api multiple times for specific payloads that we expect to
 * see when these tests are run. In this case we are looking for
 * 'Permissions Requested' and 'Permissions Received'. Do not use the constants
 * from the metrics constants files, because if these change we want a strong
 * indicator to our data team that the shape of data will change.
 *
 * @param mockServer
 * @returns
 */
const mockSegment = async (mockServer: Mockttp) => {
  return [
    await mockServer
      .forPost('https://api.segment.io/v1/batch')
      .withJsonBodyIncluding({
        batch: [{ type: 'track', event: 'Main Menu Opened' }],
      })
      .thenCallback(() => {
        return {
          statusCode: 200,
        };
      }),
  ];
};

describe('Marketing cookieId', function (this: Suite) {
  it('should not be send to segment when dataCollectionForMarketing is never toggled on', async function () {
    await withFixtures(
      {
        dappOptions: {
          customDappPaths: ['./tests/metrics/marketing-cookieid-mock-page'],
        },
        fixtures: new FixtureBuilderV2()
          .withAnalyticsController({
            analyticsId: MOCK_ANALYTICS_ID,
            consentDecisionMade: true,
            optedIn: true,
          })
          .build(),
        title: this.test?.fullTitle(),
        testSpecificMock: mockSegment,
      },
      async ({
        driver,
        mockedEndpoint: mockedEndpoints,
      }: TestSuiteArguments) => {
        await login(driver);
        const dappPage = new TestDapp(driver);
        await dappPage.openTestDappPage();

        await driver.switchToWindowWithTitle(
          WINDOW_TITLES.ExtensionInFullScreenView,
        );

        // waiting for marketingCampaignCookieId to update in state
        await driver.delay(5000);

        const uiState = await getCleanAppState(driver);
        assert.equal(uiState.metamask.marketingCampaignCookieId, null);

        const homePage = new HomePage(driver);
        await homePage.checkPageIsLoaded();
        await homePage.headerNavbar.openGlobalMenu();
        const events = await getEventPayloads(
          driver,
          mockedEndpoints as MockedEndpoint[],
        );
        assert.equal(events.length, 1);
        const eventContext = events[0].context;
        assert.equal(eventContext.marketingCampaignCookieId, null);
      },
    );
  });
  it('should not send to segment when optedIn is never toggled on', async function () {
    await withFixtures(
      {
        dappOptions: {
          customDappPaths: ['./tests/metrics/marketing-cookieid-mock-page'],
        },
        fixtures: new FixtureBuilderV2().build(),
        title: this.test?.fullTitle(),
        testSpecificMock: mockSegment,
      },
      async ({
        driver,
        mockedEndpoint: mockedEndpoints,
      }: TestSuiteArguments) => {
        await login(driver);
        const dappPage = new TestDapp(driver);
        await dappPage.openTestDappPage();

        await driver.switchToWindowWithTitle(
          WINDOW_TITLES.ExtensionInFullScreenView,
        );

        // waiting for marketingCampaignCookieId to update in state
        await driver.delay(5000);

        const uiState = await getCleanAppState(driver);
        assert.equal(uiState.metamask.marketingCampaignCookieId, null);

        const homePage = new HomePage(driver);
        await homePage.checkPageIsLoaded();
        await homePage.headerNavbar.openGlobalMenu();
        const events = await getEventPayloads(
          driver,
          mockedEndpoints as MockedEndpoint[],
        );
        assert.equal(events.length, 0);
      },
    );
  });
});
