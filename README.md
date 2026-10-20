# SimpleMask

A lean, EVM-only wallet browser extension adapted from MetaMask, initially for personal use. The goal is excellent everyday wallet UX without ads, trading products, or unnecessary features.

This repository preserves MetaMask’s Git history. Historical upstream documentation remains available in Git history. This README records the agreed product direction and implementation backlog. Unchecked items are planned work, not completed changes.

This fork will have its own identity and does not retain compatibility with legacy MetaMask deep links. Links for removed features are retired along with those features.

## Supported browsers and networks

- Support and test only the latest stable desktop Chrome and Firefox. Older releases, Firefox ESR, and other browsers are not supported.
- Remove dedicated support, packaging, and documentation for other browser targets. Safari is out of scope.
- Shared Chromium implementation may still work in other Chromium browsers; those browsers are not supported targets.
- Support Ethereum and EVM-compatible networks, including custom networks and custom RPC endpoints.
- Remove non-EVM support, including Bitcoin, Solana, Tron, Stellar, and their associated integrations.

## Development

Use the Node version in `.nvmrc` and Yarn version in `package.json`:

```sh
corepack enable
yarn install
cp .metamaskrc.dist .metamaskrc
yarn start          # Chrome MV3
yarn start:mv2      # Firefox MV2
```

Configure your own RPC/API credentials in `.metamaskrc` for live use. Load the unpacked build using the [Chrome](docs/add-to-chrome.md) or [Firefox](docs/add-to-firefox.md) instructions. For verification, use `yarn build:test` or `yarn build:test:mv2` (LavaMoat enabled), followed by `yarn test:e2e:single path/to/spec.ts --browser=chrome` or `--browser=firefox`. Each build cleans the distribution directory.

Run `yarn lint:changed:fix`, affected unit tests, and `yarn lint:tsc` before commits. Dependency changes require lockfile deduplication, allow-scripts review, and `yarn lavamoat:auto`. See [contributing](.github/CONTRIBUTING.md) and [browser support](docs/browser-support.md). Repository automation only builds and tests; dependency updates and publishing are manual.

## Keep and polish

- Wallet creation and import.
- Recovery phrase backup and recovery, password management, lock/unlock, and auto-lock.
- Multiple accounts, account switching, account names, and copying addresses.
- EVM network selection and custom network/RPC management.
- Native assets and fungible tokens, balances, fiat values, and token import/management.
- Send and receive, including receive addresses and QR codes.
- Transaction activity, pending status, and transaction details.
- App connections, disconnecting sites, and permission management.
- Hardware-wallet support for EVM accounts.
- Clear transaction and signature confirmations.
- Phishing protection, transaction simulation, and approval warnings where available.

## UX direction

Keep the home screen focused on everyday wallet tasks:

- Account and network selectors at the top.
- Balance, address, Send, and Receive.
- Tokens and Activity as the primary views.
- A compact indicator for the current website's connection.
- Settings accessible through one menu.
- No ads, promotional cards, or product upsells.

## Removal checklist

For every removed feature, address both its visible interface and its underlying controllers, dependencies, polling, services, configuration, and permissions where no longer needed. Hiding a button is only part of the work.

- [x] Remove ads, promotional cards/carousels, and marketing announcements. Removed the home carousel, remote carousel fetching, legacy announcement controller, and notification-service feature announcements, including fetching, saved announcements, marketing settings, and unused rendering dependencies. Product-specific promotional placements and push marketing are covered by their respective items below.
- [x] Remove perpetual futures, including Perps navigation and promotional placements. Removed the trading UI, controller, streaming connections, funding prompts, deep links, notification inbox entries, and dedicated dependencies. Migrated saved Perps state while preserving accounts and transaction history. Verified wallet- and dApp-initiated ETH sends in Chrome and Firefox, and regenerated all LavaMoat policies.
- [x] Remove rewards and referral features. Removed rewards screens, badges, enrollment, quote estimates, subscription rewards linking, controllers, API services, and partner referral prompts/redirects. Migrated saved rewards credentials and referral preferences. Preserved shared hardware-wallet checks and verified ETH sends in Chrome and Firefox with no rewards API requests during those tests.
- [x] Remove NFT galleries, discovery, import, and other dedicated NFT features. Removed collection screens, native NFT send selection, NFT watch/import approvals, discovery controllers, polling, settings, and deep links. Migrated saved collection state while preserving transaction history and dApp contract confirmations. Verified ETH sends in Chrome and Firefox, ERC721 and ERC1155 approvals, and both browser builds with LavaMoat.
- [x] Remove Discover, trending-token, and market-browsing features. Removed Discover search and feed hooks, market promotions in the wallet/menu/network lists, and trending, top-trader, and prediction-market links. Old remote flags cannot restore them. Preserved balances, fiat values, and token import; verified affected UI tests, Chrome/Firefox ETH sends, localization, and both LavaMoat builds.
- [x] Remove the DeFi portfolio dashboard. Removed both positions controllers, dashboard/detail screens, navigation, feature flags, and global polling. Migrated saved caches and DeFi navigation while preserving accounts, balances, and transaction history. Verified migration/controller/balance tests, both LavaMoat builds, and Chrome/Firefox ETH sends with no DeFi position requests.
- [x] Remove integrated fiat buy/sell flows and provider integrations. Removed checkout, quotes, provider selection, purchase buttons, buy/sell links, controllers, order polling/syncing, and the direct fiat dependency. Migrated saved provider orders while preserving wallet data and on-chain settlement history. Kept Receive and insufficient-gas warnings. Verified affected tests, all LavaMoat policies, both browser builds, and Chrome/Firefox ETH sends with no fiat-provider requests. A transitive helper remains in the shared payment dependency, without fiat messenger access.
- [x] Remove integrated swaps and bridging, including buttons, routes, quotes, background services, and feature-specific dependencies. Removed trading controllers, quote polling/comparison, batch selling, and saved trading state. Preserved external dApp transactions, transaction history, and hardware signing through a standalone route. Verified affected tests, lint/types, all LavaMoat policies, both browser builds, and Chrome/Firefox ETH sends without trading-service requests. The bridge package remains for shared asset metadata and formatting helpers; its trading controllers are not initialized.
- [x] Remove subscriptions and product upsells. Removed Shield enrollment, billing, claims, premium prompts, Money and mUSD conversion promotions, and shared MetaMask Pay funding services, including their controllers and direct dependencies. Migrated saved product state while preserving vault compatibility and transaction history. Kept ordinary token balances, security checks, and confirmation warnings. Verified affected tests, lint/types, all LavaMoat policies, both browser builds, and Chrome/Firefox ETH sends without product-service requests. The Money keyring and pure history helpers remain for existing vaults; shared wallet dependencies no longer initialize subscription services.
- [x] Remove marketing notifications while retaining useful wallet and transaction status. Filtered marketing and unsupported product messages from saved state, API updates, push delivery, and notification clicks. Removed marketing-consent prompts, settings, email-enrollment APIs, and consent restoration; retired saved marketing consent and campaign identifiers while preserving the separate analytics choice. Kept wallet activity notifications and local transaction toasts. Verified notification/migration/onboarding tests, lint/types, regenerated LavaMoat policies, both browser builds, and ETH sends plus recovery-phrase and mocked social-login onboarding in Chrome and Firefox without marketing-consent requests.
- [x] Remove non-EVM account, asset, network, transaction, and signing flows. Removed non-EVM account creation, dedicated asset/balance/rate/transaction controllers, Snap asset polling, and request routing. Preserved EVM account groups, custom networks, encrypted keys, and EVM transaction history. Migrated retired state and permissions, and registered the preceding removal migrations. Verified controller/migration/UI tests, lint/types, all LavaMoat policies, and Chrome/Firefox sends, message signing, account persistence, and recovery-phrase and mocked social onboarding. Captured requests showed no non-EVM endpoints.
- [x] Remove non-EVM wallet Snaps and integrations. Removed bundled Bitcoin, Solana, Tron, and Stellar Snaps, browser provider registrations, Stellar activation requests, and their dependencies. Blocked reinstallation and migrated executable records, permissions, scheduled jobs, and notifications while preserving key data. Retained the sandbox, registry, permission checks, EVM Snap accounts, ENS, advanced EVM permissions, and confirmation insights; shared Snap asset forms now use EVM data. Verified affected tests, lint/types, all LavaMoat policy builds, and Chrome/Firefox provider discovery, ETH sends, and EVM Snap signatures without non-EVM requests.
- [x] Remove dedicated browser targets beyond Chrome and Firefox, including their build/release configuration and documentation. Audited the build CLI, manifests, release archives, and browser test configuration; these already target Chrome and Firefox. Removed other-browser camera-settings links, version rules, side-panel workarounds, a browser-specific scuttling exception, and support/documentation promises. Updated publishing guidance for this fork. Verified affected runtime/camera tests, build-CLI tests, lint/types, and both LavaMoat-enabled builds and provider smoke tests.
- [x] Remove obsolete feature flags, settings, routes, translations, assets, and tests associated with removed features. Removed retired build and remote flags, route exports and navigation exceptions, non-EVM asset UI, the onboarding app promotion, and staking upsells. Pruned unused translations, promotional images, and dedicated non-EVM test infrastructure while preserving shared EVM helpers, gas estimation, and confirmation coverage. Verified affected tests, lint/types, localization, both LavaMoat builds, and Chrome/Firefox social onboarding, ETH sends, and provider discovery without non-EVM requests.
- [x] Remove unused controllers, dependencies, polling, and service requests after tracing their consumers. Removed install-time website attribution and its cookie stream, the X market widget and swap launcher, unused initialization messengers, non-EVM address validators, and dedicated test tooling. Stopped automatically seeding promotional mUSD balances; migrated attribution, widget preferences, and empty seeded balances while preserving holdings, explicit token imports, consent, and vaults. Retained shared keyring and history helpers with active consumers. Verified affected tests, lint/types, localization, all LavaMoat policies, both browser builds, and Chrome/Firefox provider discovery, ETH sends, and mocked social onboarding without removed-product requests.
- [x] Reduce extension permissions where removed features were their only consumers. Removed the cookies permission from both manifests after removing its sole consumer, website install attribution. The preceding cleanup also removed the X widget's web-accessible entry. Traced and retained permissions needed for EVM provider access, custom RPCs, phishing protection, wallet storage, notifications, auto-lock, hardware wallets, clipboard import, and social onboarding. Verified the built manifests omit cookies and both LavaMoat builds pass; Chrome and Firefox passed provider discovery, ETH sends, personal signing, and mocked social onboarding without removed-product requests.

Users should still be able to use external swap, bridge, and DeFi apps through the standard EVM provider and confirmation flows.

## UX and confirmation checklist

- [ ] Simplify the home screen to the layout described above.
- [ ] Make account and network selection obvious and consistent.
- [ ] Make transaction and signature confirmations clearly identify the requesting site.
- [ ] Clearly identify the account and network involved in each request.
- [ ] Show what assets leave or enter the wallet when that information is available, and explicitly indicate when it cannot be determined.
- [ ] Show the estimated network fee for transactions; distinguish requests that only sign a message.
- [ ] Clearly explain token approvals and spending permissions, including unlimited approvals.
- [ ] Preserve phishing protection, transaction simulation, and approval warnings where available.
- [ ] Keep wallet creation/import, recovery, lock/unlock, and hardware-wallet flows easy to understand.
- [ ] Keep connection permissions, transaction progress, and failure/rejection states understandable.

## Implementation approach

- [ ] Establish a working baseline build for both Chrome and Firefox.
- [ ] Make removals in small, reviewable stages so upstream security fixes remain practical to incorporate.
- [ ] Trace each feature from UI entry points through background initialization and dependencies before removing it.
- [ ] Handle persisted state for removed features with migrations where needed.
- [ ] Verify retained wallet flows on both browsers after relevant changes.
- [ ] Check production builds with LavaMoat enabled and update dependency policies when dependencies change.
- [ ] Verify that removed features no longer initialize controllers, poll, or make service requests.

Browser parity, reliable core wallet behavior, and clear confirmations take priority over adding new features.

## English-only interface

- [x] Remove all language catalogs and language selectors from onboarding, settings, and Storybook.
- [x] Remove locale detection, preference state and APIs, Redux locale state, React translation providers/hooks, runtime message fetching, and translation validation/setup.
- [x] Remove browser `__MSG_` tokens, `default_locale`, locale copying, and startup message-file preloads. Extension manifests and loading CSS contain English directly.
- [x] Migrate saved language preferences away while preserving wallet data and other settings.
- [x] Remove the obsolete translation-check dependency, test wrappers, fixture locale fields, and validation-only text calls. Remove the unused non-EVM aggregate-balance component found during the audit.
- [ ] Validate the final Chrome and Firefox builds, restoration flow, and affected tests after removing the infrastructure.

English product copy lives in `shared/constants/english-text.ts` as plain strings. Small text-formatting functions insert values and React content into that copy; they have no language selection, locale catalogs, fallback language, fetch, provider, or setup. Native `Intl` APIs still format English numbers and dates. External service APIs that require a language receive the fixed value `en`.

## Repository cleanup and legacy audit

- Removed `.cursor`, `.devcontainer`, `.husky`, and `.vscode`, their hook/download commands, and automatic agent-skill downloads during installation. Build and test commands remain available directly through Yarn.
- Replaced upstream GitHub automation with testing only: static checks, unit/integration/build-tool/component tests, LavaMoat builds, and sharded Chrome/Firefox E2E tests. Removed release/deployment jobs, schedules, Slack/Sentry alerts, issue/PR bots, Dependabot, issue forms, funding, and CODEOWNERS. Workflows use read-only permissions and no organization secrets.
- Removed orphaned release publishing, Slack announcements, AI release planning, benchmark telemetry uploads, Crowdin/Codecov configuration, and bot scripts. `yarn audit` now runs the standard dependency audit directly, without downloading a MetaMask baseline or opening issues. Retained E2E splitting/result helpers and the read-only diff helper used by local code-quality checks.

- Replaced broad browser targets and Chrome 126/Firefox-driver pins with latest stable targets. Build manifests and the outdated-browser warning now use the same locked Browserslist data as compilation. Removed the obsolete Chrome 113–120 prerender workaround; kept current back/forward-cache handling. Browser database updates remain manual (`yarn dlx update-browserslist-db@latest`), followed by policy regeneration and both browser tests.

- Removed unused AI SDKs, Slack packages, Sentry publishing tools, static-site deployers, Husky, upstream agent-skill tooling, Octokit clients used only by deleted automation, and the upstream changelog generator. Removed the Yarn preview-package aliasing plugin. Runtime error reporting, test tools, and read-only GitHub helpers with live consumers remain.

### Remaining legacy code and libraries

These still have active consumers. They need migrations rather than deletion; naming alone does not make wallet or security code disposable.

| Area                                                                            | Evidence / current consumer                                                                   | Remaining work                                                                                                                                                                                                        |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `react-tippy` / Popper v1                                                       | `ui/components/ui/tooltip/tooltip.tsx`, unit inputs, permission tooltips, migration dashboard | Replace with the current design-system tooltip; verify focus, positioning, and accessibility before removing the packages.                                                                                            |
| `ethereumjs-wallet`                                                             | Transitive dependency of `@metamask/keyring-controller`                                       | Upgrade/migrate the keyring dependency with vault import/export and recovery tests.                                                                                                                                   |
| `ethereumjs-util` and older Ethers/BN helpers                                   | Signing, transactions, fixtures, and shared dependencies                                      | Consolidate incrementally onto current APIs while preserving serialization and signature behavior.                                                                                                                    |
| `cids`, `multibase`, `multicodec`                                               | Transitive ENS content-hash encoding dependencies                                             | Upgrade the ENS dependency chain and verify existing names/content-hash decoding. Corrected the stale Truffle attribution and removed an unused drag-and-drop audit exception.                                        |
| Redux 4, older Redux Toolkit / React Redux, `connect` and JavaScript components | Existing application state and screens                                                        | Migrate by feature; new code uses TypeScript and functional components.                                                                                                                                               |
| Legacy background API bridge                                                    | Active UI-to-background calls and `legacy-background-api:check`                               | Move callers to typed controller/messenger APIs before retiring the bridge.                                                                                                                                           |
| Gulp/Browserify/Babel and TypeScript migration dashboard                        | Development scripts and dashboard alongside the primary Webpack build                         | Consolidate tooling separately; do not remove packages while those commands still consume them.                                                                                                                       |
| Selenium alongside Playwright                                                   | Existing E2E specs and page objects                                                           | Continue test migration while preserving coverage; current Selenium tests now use stable browsers, and Playwright was updated from 1.59.1 to 1.64.1 to refresh its bundled engines. Both suites remain in testing CI. |
| Beta/Flask and experimental build variants                                      | Build configuration and Snap/experimental tests                                               | Review which variants belong in the renamed project before removing associated functionality.                                                                                                                         |
| Upstream branding, support/service URLs, analytics/error reporting              | Runtime strings, identifiers, configuration and retained service clients                      | Separate rename/service audit; removing organization CI alerts does not remove runtime telemetry.                                                                                                                     |

Retained intentionally: Firefox MV2 background support, `webextension-polyfill`, Node API shims (including `core-js-pure`'s `setImmediate` for the build), state migrations, compatible keyring readers, and base64 helpers still needed by Node 24/test environments lacking `Uint8Array.fromBase64`. These support current wallet behavior or protect existing data. Legal notices, license terms, and historical changelogs remain.

Removed stale setup/release guidance and documents for deleted trading products. The automated checks are statically validated locally; GitHub-hosted workflow execution requires a push and is not implied by local validation. Repository-level GitHub settings and installed apps are separate from the files removed here.

### Cleanup validation

Validated locally with formatting/lint, TypeScript, circular-dependency checks, 164 affected unit/regression tests, and all 519 build-tool tests. Regenerated all eight LavaMoat application policies and passed both browser test builds. Selenium smoke tests passed on Chrome 155 and Firefox 158 for provider discovery, wallet- and dApp-initiated ETH sends, personal signing, and UI/background lockdown. The migrated Playwright home-page smoke test passed on its Chromium 156 and Firefox 157 engines.

Current ChromeDriver requires explicit extension-target discovery and two additional globals in the existing test-only automation allowance. A regression test verifies `self` and `Window` remain scuttled in production; both browser lockdown checks still pass. Production security settings were not relaxed. CI YAML and job wiring pass Actionlint. Changes are committed locally; they have not been pushed or tested on GitHub-hosted runners.
