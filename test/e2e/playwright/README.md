# Playwright E2E

This folder hosts the Playwright support code for E2E tests:

| Folder          | Purpose                                                                                                                                     |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `shared/`       | Shared harnesses used by the Selenium-to-Playwright migration (Chrome + Firefox extension loaders) plus the mocha-compatible JUnit reporter |
| `llm-workflow/` | MCP-driven test scaffolding helpers                                                                                                         |

The bulk of the existing E2E suite still lives under `test/e2e/tests/` and runs through Selenium. New Playwright migrations also live there with a `*.pw.spec.ts` suffix and are executed by the [`run-all-pw.mts`](../run-all-pw.mts) runner.

Playwright projects are declared in [`playwright.config.ts`](../../../playwright.config.ts):

| Project       | Spec match            | Purpose                                                             |
| ------------- | --------------------- | ------------------------------------------------------------------- |
| `chrome-e2e`  | `**/*.pw.spec.ts`     | Migrated Selenium specs on Chrome (via the `PlaywrightDriver` shim) |
| `firefox-e2e` | `**/*.pw.spec.ts`     | Migrated Selenium specs on Firefox                                  |
| `benchmark`   | `test/e2e/benchmarks` | Performance benchmarks (`yarn test:e2e:benchmark`)                  |

---

## Selenium → Playwright migration

- Selenium spec files (`*.spec.ts`) run via Mocha (`yarn test:e2e:chrome` / `yarn test:e2e:firefox`).
- Playwright spec files (`*.pw.spec.ts`) run via Playwright's runner (`yarn test:e2e:playwright:chrome` / `yarn test:e2e:playwright:firefox`).
- Both share the same `withFixtures`, page objects, flows, fixtures, and seeders. The only adapter is the **`PlaywrightDriver` shim** in `test/e2e/webdriver/driver-playwright.ts`, which mirrors the Selenium `Driver` public API on top of Playwright.

### File naming

Migration ships one file at a time:

- Add `auto-lock.pw.spec.ts` next to `auto-lock.spec.ts`.
- Verify it passes in CI under the new `playwright` browser-matrix jobs.
- Delete the Selenium `auto-lock.spec.ts` in the same PR (or a fast follow-up).

The Selenium runner (`test/e2e/run-all.mts`) explicitly skips `*.pw.spec.ts`, so a `.spec.ts` file and its `.pw.spec.ts` migration can coexist briefly without double-running.

### Writing a migrated spec

Start from the Selenium version and apply these mechanical changes:

1. Replace the Mocha imports with `import { test as pwTest } from '@playwright/test'`.
2. Wrap your test in `pwTest.describe(...)` / `pwTest(...)` instead of `describe` / `it`.
3. Inside `withFixtures`, pass `driverType: E2E_DRIVER.PLAYWRIGHT` (from `test/e2e/constants.ts`).
4. Use `testInfo.titlePath.join(' ')` for the `title` field instead of `this.test?.fullTitle()`.
5. Leave **everything else unchanged** — page objects, flows, fixtures, helpers.

Reference: [`test/e2e/tests/settings/auto-lock.pw.spec.ts`](../tests/settings/auto-lock.pw.spec.ts).

### Running locally

```bash
# Build the test extension (one-time, or after extension code changes)
yarn build:test          # Chrome MV3
yarn build:test:mv2      # Firefox MV2

# Run all migrated Playwright specs (via the run-all-pw.mts runner)
yarn test:e2e:playwright:chrome
yarn test:e2e:playwright:firefox

# Run a single spec (positional filter, forwarded to Playwright)
yarn test:e2e:playwright:chrome auto-lock.pw.spec.ts

# Verbose driver logs (`[driver] Called 'method' with arguments ...`),
# same proxy wrapper Selenium uses in `helpers.js`.
E2E_DEBUG=true yarn test:e2e:playwright:chrome auto-lock.pw.spec.ts

# Debug a spec (headed + PWDEBUG step inspector) — call Playwright directly
PWDEBUG=1 yarn playwright test --project=chrome-e2e auto-lock.pw.spec.ts

# Local sharding sanity-check — call Playwright directly
yarn playwright test --project=chrome-e2e --shard=1/2
yarn playwright test --project=chrome-e2e --shard=2/2
```

Locally (no `GITHUB_ACTION` env) the runner runs every discovered spec — or the positional filters you pass — in a single Playwright invocation; matrix-splitting only kicks in under GitHub Actions (see [Test runner](#test-runner-run-all-pwmts)).

Install the corresponding engine with `yarn playwright install chromium` or `yarn playwright install firefox`. CI installs it explicitly in the testing workflow.

### Test runner (`run-all-pw.mts`)

[`run-all-pw.mts`](../run-all-pw.mts) is the Playwright counterpart of the Selenium [`run-all.mts`](../run-all.mts). Both runners import the same CI test-selection logic from [`run-all-shared.mts`](../run-all-shared.mts) (spec discovery, time-based matrix splitting, re-run-only-failed), so the behaviors cannot drift apart; only the execution step differs. The parity is at the **runner** level, not the per-file level: there is no Playwright equivalent of `run-e2e-test.js`, because the Playwright CLI already owns retries, reporting, and single-spec invocation (see the mapping in [CI](#ci)).

What it does (only under GitHub Actions, guarded by `GITHUB_ACTION`):

1. **Discovers** every `*.pw.spec.ts` under `test/e2e/tests/`.
2. **Splits by timing** across the matrix with `splitTestsByTimings`, fed by the same `test-runs-<browser>.json` artifact the Selenium runner uses (matched by the job's `TEST_SUITE_NAME`). Add specs and they redistribute automatically — no manual `--shard`.
3. Runs every selected spec with the standard Playwright retry settings. PR labels and upstream change-list artifacts no longer influence selection.
4. **Re-runs only failed specs** on attempt > 1, via `extract-test-results.mts` against `PREVIOUS_RESULTS_PATH`.
5. **Writes JUnit** as one file per spec into `test/test-results/e2e/` (the reporter splits each invocation's results so re-run merging stays correct — see [CI](#ci)).

Locally (no `GITHUB_ACTION`) it skips all of the above and runs every discovered spec — or the positional spec filters you pass — in a single Playwright invocation, with no JUnit output. The `--retries` flag is forwarded to Playwright.

### Architecture pointers

- **Driver shim**: [`test/e2e/webdriver/driver-playwright.ts`](../webdriver/driver-playwright.ts) — `PlaywrightDriver` + `PlaywrightElement`.
- **Factory**: [`test/e2e/webdriver/build-playwright-driver.ts`](../webdriver/build-playwright-driver.ts) — dispatches between Chrome/Firefox harnesses.
- **Chrome harness**: [`shared/chrome-extension-harness.ts`](./shared/chrome-extension-harness.ts) — `launchPersistentContext` + `--load-extension` + deterministic extension-ID derivation.
- **Firefox harness**: [`shared/firefox-extension-harness.ts`](./shared/firefox-extension-harness.ts) — Playwright Firefox `omni.ja` patch + RDP install + UUID lookup.
- **withFixtures branch**: [`test/e2e/helpers.js`](../helpers.js) — `driverType` from [`E2E_DRIVER`](../constants.ts) (`SELENIUM` default, `PLAYWRIGHT` for migrated specs).

### Unsupported on the Playwright path (yet)

The `PlaywrightDriver` shim only implements what migrated specs actually exercise. Every other method throws a clear `not yet implemented` error rather than shipping unverified behavior — so we add (and verify) methods one migrated spec at a time. When a spec you're migrating hits a gap, implement it (mirroring the Selenium `driver.js` contract) in the same PR.

Intentional no-ops (not gaps): `checkBrowserForExceptions` / `checkBrowserForConsoleErrors` — the PW path records `weberror` events automatically, so these stay as no-ops for API parity rather than throwing.

### CI

`.github/workflows/main.yml` runs migrated specs in separate Chrome and Firefox jobs using the same LavaMoat test artifacts as Selenium. `run-all-pw.mts` supports matrix splitting and optional failed-test reruns; current Playwright jobs each use one shard. There are no PR-label or upstream change-list requirements.

JUnit results are written per spec to `test/test-results/e2e/` by `shared/mocha-compat-junit-reporter.ts` and uploaded with failure artifacts. No external report service or notification bot receives results.

#### Why no `run-e2e-test.js` for Playwright

The Selenium flow spawns `run-e2e-test.js` once per file to give Mocha things it lacks. Playwright provides all of them natively, so `run-all-pw.mts` calls `playwright test` directly:

| `run-e2e-test.js` responsibility (Selenium)        | Playwright equivalent                              |
| -------------------------------------------------- | -------------------------------------------------- |
| `retry({ retries })`                               | `--retries` (config + runner CLI flag)             |
| Reporter selection (spec + `mocha-junit-reporter`) | `playwright.config.ts` `reporter: [...]`           |
| Per-file invocation + path validation              | Playwright spec filters / file list                |
| `E2E_DEBUG` driver logging                         | Same env, honored by the `helpers.js` driver proxy |
| `--leave-running` / `--update-snapshot` / debug    | `--headed` / `--update-snapshots` / `PWDEBUG=1`    |
