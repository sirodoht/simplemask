# Browser support

Support is limited to the latest stable desktop Chrome and Firefox. Older versions, Firefox ESR, Safari, and other Chromium browsers are not supported targets.

`.browserslistrc` selects `last 1 Chrome version` and `last 1 Firefox version`. Compilation and generated manifest minimum versions use the release data locked in `yarn.lock`; the UI warning reads those manifest minimums. This makes builds reproducible, not dependent on a network lookup during compilation. The database can lag a browser release: refresh it manually with `yarn dlx update-browserslist-db@latest`, then regenerate LavaMoat policies and test both browsers. Do not add an automatic update bot.

Selenium E2E requests the `stable` channel through [Selenium Manager](https://www.selenium.dev/documentation/selenium_manager/). Chrome uses Chrome for Testing so extensions can be loaded. CI downloads stable browsers and resolves matching drivers instead of depending on the runner's installed version.

Chrome uses Manifest V3. Firefox still uses Manifest V2 for the existing persistent background and blocking-request architecture. This is a current Firefox implementation choice, not an ESR support promise. A [Firefox MV3 migration](https://extensionworkshop.com/documentation/develop/manifest-v3-migration-guide/) requires a separate background-lifecycle and permissions migration with E2E validation.

Keep `webextension-polyfill` and Node API shims required by wallet dependencies. Neither becomes unnecessary merely because the browser is current. The obsolete Chrome prerender regression workaround has been removed; current back/forward-cache stream recovery remains.
