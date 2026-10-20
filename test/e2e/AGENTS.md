# E2E testing

Use TypeScript for new specs. Page objects under `page-objects/pages/` own selectors and UI actions; flows under `page-objects/flows/` orchestrate multiple page objects. Specs orchestrate those APIs and make assertions.

- Keep selectors out of specs and flows. A one-page flow belongs on its page object.
- Wait for observable conditions; do not add arbitrary sleeps or swallow failures.
- Keep tests isolated and deterministic. Mock external services and avoid real funds or private credentials.
- Build first: `yarn build:test` for Chrome or `yarn build:test:mv2` for Firefox. Each build cleans the distribution directory.
- Run a spec with `yarn test:e2e:single test/e2e/tests/path.spec.ts --browser=chrome` (or `firefox`). Set `SELENIUM_HEADLESS=true` for headless runs.
- Selenium Manager resolves the current stable Chrome/Firefox and compatible driver. Do not pin obsolete browser versions. `GECKODRIVER_PATH` remains an explicit local debugging override.
- CI runs all Selenium specs across eight shards per browser using `.github/workflows/main.yml`. There are no label-based skips, organization secrets, or reused upstream artifacts.
- Playwright specs (`*.pw.spec.ts`) use the separate Playwright runner; see `playwright/README.md`. They are not Selenium inputs.
- Run `yarn lint:changed:fix` before commits. Report browser versions and actual test outcomes; do not infer visual verification from source inspection.

See [webdriver API](webdriver/README.md), [testing principles](../../docs/testing.md), [fixture generation](../../docs/generating-fixture-data.md), and [migration testing](../../docs/QA_MIGRATIONS_GUIDE.md).
