import { Driver } from '../../webdriver/driver';
import { withFixtures } from '../../helpers';
import FixtureBuilderV2 from '../../fixtures/fixture-builder-v2';
import PreferencesAndDisplaySettings from '../../page-objects/pages/settings/preferences-and-display-settings';
import HeaderNavbar from '../../page-objects/pages/home/header-navbar';
import { login } from '../../page-objects/flows/login.flow';

describe('English-only settings', function () {
  it('opens a wallet with a saved Arabic locale in English after reload', async function () {
    const retiredLanguagePreferences = {
      currentLocale: 'ar',
      textDirection: 'rtl',
    };
    await withFixtures(
      {
        fixtures: new FixtureBuilderV2()
          .withPreferencesController({
            ...retiredLanguagePreferences,
            preferences: {},
          })
          .build(),
        title: this.test?.fullTitle(),
      },
      async ({ driver }: { driver: Driver }) => {
        await login(driver);
        await new HeaderNavbar(driver).openSettingsPage();
        const settings = new PreferencesAndDisplaySettings(driver);
        await settings.checkPageIsLoaded();
        await settings.checkEnglishOnly();
        await driver.refresh();
        await settings.checkPageIsLoaded();
        await settings.checkEnglishOnly();
      },
    );
  });
});
