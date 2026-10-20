import { Driver } from '../../../webdriver/driver';
import { ACCOUNT_IDENTICON_ROUTE } from '../../../../../ui/helpers/constants/routes';

/**
 * Settings → Preferences and display (plus shared assets-tab helpers).
 *
 * Screen: `#/settings/preferences-and-display` and sub-routes
 * (`#/settings/preferences-and-display/account-identicon`); also used on
 * `#/settings/assets` via `checkAssetsPageIsLoaded` / `goToAssetsSettings`.
 * Owns: identicon options, show-default-address and
 * native-token balance toggles, and assets helpers (hide zero balance,
 * token/NFT autodetect) reused by the assets tab.
 * Boundaries: not the Settings hub. Theme/currency-only surfaces without
 * helpers here stay on their UI routes.
 * Related: `SettingsPage`, `flows/settings.flow.ts`.
 *
 * @see ui/pages/settings/preferences-and-display-tab/preferences-and-display-tab.tsx
 * @see ui/pages/settings/preferences-and-display-tab/account-identicon-sub-page.tsx
 * @see ui/pages/settings/assets-tab/assets-tab.tsx
 */
class PreferencesAndDisplaySettings {
  private readonly accountIdenticonList =
    '[data-testid="account-identicon-list"]';

  private readonly accountIdenticonSubpageLink = `a[href="#${ACCOUNT_IDENTICON_ROUTE}"]`;

  private readonly assetsTabButton = '[data-testid="settings-tab-item-assets"]';

  private readonly autodetectNftsToggleLabel =
    "label.toggle-button:has([data-testid='use-nft-detection-input'])";

  private readonly autoDetectTokensToggleLabel =
    "label.toggle-button:has([data-testid='autodetect-tokens'])";

  private readonly driver: Driver;

  /**
   * Hidden checkbox; click the wrapping label (same pattern as native-token toggle).
   */
  private readonly hideTokensWithoutBalanceToggleLabel =
    "label.toggle-button:has([data-testid='toggle-zero-balance-button'])";

  private readonly identicons = {
    maskicon: '[data-testid="account-identicon-option-maskicon"]',
    blockies: '[data-testid="account-identicon-option-blockies"]',
    jazzicon: '[data-testid="account-identicon-option-jazzicon"]',
  };

  private readonly loadingOverlay = '.loading-overlay';

  private readonly loadingOverlaySpinner = '.loading-overlay__spinner';

  private readonly preferencesTabButton =
    '[data-testid="settings-tab-item-preferences-and-display"]';

  private readonly settingsPage = {
    testId: 'parent-selector-settings-page',
  };

  private readonly showDefaultAddressToggle =
    '[data-testid="show-default-address-toggle"]';

  private readonly showDefaultAddressToggleLabel =
    "label.toggle-button:has([data-testid='show-default-address-toggle'])";

  /**
   * Visible toggle: `data-testid="show-native-token-as-main-balance"` is on the
   * hidden input inside ToggleButton; click the wrapping label.
   */
  private readonly showNativeTokenAsMainBalanceToggleLabel =
    "label.toggle-button:has([data-testid='show-native-token-as-main-balance'])";

  constructor(driver: Driver) {
    this.driver = driver;
  }

  async assertLoadingOverlayNotPresent(): Promise<void> {
    await this.driver.assertElementNotPresent(this.loadingOverlay);
  }

  async checkAssetsPageIsLoaded(): Promise<void> {
    try {
      await this.driver.clickElement(this.assetsTabButton);
      await this.driver.waitForMultipleSelectors([
        this.showNativeTokenAsMainBalanceToggleLabel,
      ]);
    } catch (e) {
      console.log(
        'Timeout while waiting for Assets settings page to be loaded',
        e,
      );
      throw e;
    }
    console.log('Assets settings page is loaded');
  }

  async checkEnglishOnly(): Promise<void> {
    await this.driver.assertElementNotPresent(
      'a[href="#/settings/preferences-and-display/language"]',
    );
    await this.driver.assertElementNotPresent(
      '[data-testid="locale-select-list"]',
    );
    await this.driver.waitForSelector({
      text: 'Preferences and display',
      tag: 'p',
    });
  }

  async checkIdenticonIsActive(
    identicon: 'maskicon' | 'jazzicon' | 'blockies',
  ): Promise<void> {
    console.log(
      `Checking if ${identicon} identicon is active on preferences and display settings page`,
    );
    await this.driver.clickElement(this.preferencesTabButton);
    await this.checkNoLoadingOverlaySpinner();
    await this.driver.clickElement(this.accountIdenticonSubpageLink);
    await this.driver.waitForSelector(this.accountIdenticonList);
    const activeSelector = this.identicons[identicon];
    await this.driver.waitForSelector(activeSelector);
  }

  async checkIdenticonOptionsAreDisplayed(): Promise<void> {
    console.log(
      'Checking if identicon options are displayed on preferences and display settings page',
    );
    await this.driver.clickElement(this.preferencesTabButton);
    await this.checkNoLoadingOverlaySpinner();
    await this.driver.clickElement(this.accountIdenticonSubpageLink);
    await this.driver.waitForSelector(this.accountIdenticonList);
    await this.driver.waitForSelector(
      '[data-testid="account-identicon-option-blockies"]',
    );
    await this.driver.waitForSelector(
      '[data-testid="account-identicon-option-jazzicon"]',
    );
  }

  async checkNoLoadingOverlaySpinner(): Promise<void> {
    await this.driver.assertElementNotPresent(this.loadingOverlaySpinner);
  }

  async checkPageIsLoaded(): Promise<void> {
    try {
      await this.driver.clickElement(this.preferencesTabButton);
      await this.checkNoLoadingOverlaySpinner();
      await this.driver.waitForMultipleSelectors([
        this.accountIdenticonSubpageLink,
        this.settingsPage,
      ]);
    } catch (e) {
      console.log(
        'Timeout while waiting for Preferences and Display settings page to be loaded',
        e,
      );
      throw e;
    }
    console.log('Preferences and Display settings page is loaded');
  }

  async checkShowDefaultAddressSectionIsDisplayed(): Promise<void> {
    await this.driver.clickElement(this.preferencesTabButton);
    await this.checkNoLoadingOverlaySpinner();
    await this.driver.waitForSelector(this.showDefaultAddressToggle);
  }

  async checkShowDefaultAddressSectionIsNotDisplayed(): Promise<void> {
    await this.driver.clickElement(this.preferencesTabButton);
    await this.checkNoLoadingOverlaySpinner();
    await this.driver.assertElementNotPresent(this.showDefaultAddressToggle);
  }

  async toggleAutodetectNfts(): Promise<void> {
    console.log('Toggle autodetect NFTs on Assets settings page');
    await this.checkAssetsPageIsLoaded();
    await this.driver.waitForSelector(this.autodetectNftsToggleLabel);
    await this.driver.clickElement(this.autodetectNftsToggleLabel);
  }

  async toggleAutoDetectTokens(): Promise<void> {
    console.log('Toggle auto detect tokens on Assets settings page');
    await this.checkAssetsPageIsLoaded();
    await this.driver.waitForSelector(this.autoDetectTokensToggleLabel);
    await this.driver.clickElement(this.autoDetectTokensToggleLabel);
  }

  async toggleHideTokensWithoutBalance(): Promise<void> {
    await this.checkAssetsPageIsLoaded();
    await this.driver.clickElement(this.hideTokensWithoutBalanceToggleLabel);
  }

  async toggleShowDefaultAddress(): Promise<void> {
    await this.driver.clickElement(this.preferencesTabButton);
    await this.checkNoLoadingOverlaySpinner();
    await this.driver.waitForSelector(this.showDefaultAddressToggleLabel);
    await this.driver.clickElement(this.showDefaultAddressToggleLabel);
  }

  async toggleShowNativeTokenAsMainBalance(): Promise<void> {
    await this.checkAssetsPageIsLoaded();
    await this.driver.clickElement(
      this.showNativeTokenAsMainBalanceToggleLabel,
    );
  }
}

export default PreferencesAndDisplaySettings;
