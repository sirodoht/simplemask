# Agent instructions

SimpleMask is an EVM-only wallet fork. Read README.md for product scope, completed removals, and the remaining backlog.

## Working rules

- Use TypeScript for new source files; functional React components and hooks for new UI.
- Colocate unit tests with source. Use Jest for app/shared/UI tests and Node's test runner for Webpack tooling.
- Use `oxfmt` for code; Prettier only for JSON. Run `yarn lint:changed:fix` before every commit.
- Run affected tests and `yarn lint:tsc`. Check `yarn circular-deps:check` after changing imports.
- Dependency changes require `yarn install`, `yarn lint:lockfile:dedupe:fix`, `yarn allow-scripts auto`, and `yarn lavamoat:auto`. Review policy capabilities and validate both browser builds.
- Never modify Git config or use destructive Git operations. Stage and commit only when the user requests it. Use Conventional Commits and hyphens rather than slashes in branch names.
- Open PRs as drafts with Conventional Commits titles unless instructed otherwise. Manual testing instructions describe user actions, not automated commands.
- Read `.github/AGENTS.md` before changing CI, and `test/e2e/AGENTS.md` before changing E2E tests.
- Do not recreate removed editor/container/hooks, organization bots, automated dependency updates, or release/notification workflows.
- Preserve vaults, key data, transaction history, account permissions, phishing checks, and signing warnings. Do not weaken a security check as a side effect of cleanup; stop and obtain explicit approval for security behavior changes.
- State changes require a registered migration that preserves user data. Generated attribution and legal notices must remain intact; do not regenerate `attribution.txt` in routine changes.

## Local setup and validation

Use `.nvmrc` and the Yarn version pinned in `package.json`. Run `corepack enable`, `yarn install`, and copy `.metamaskrc.dist` to `.metamaskrc`. Configure a personal RPC/API key for live use; mocked tests use dummy configuration. Use `yarn.cmd` in PowerShell.

| Task | Command |
| --- | --- |
| Chrome development | `yarn start` |
| Firefox development | `yarn start:mv2` |
| Chrome LavaMoat test build | `yarn build:test` |
| Firefox LavaMoat test build | `yarn build:test:mv2` |
| Targeted unit tests | `yarn test:unit path/to/file.test.ts --runInBand` |
| Build-tool tests | `yarn test:unit:webpack` |
| Integration tests | `yarn test:integration --runInBand` |
| Single browser E2E | `yarn test:e2e:single path/to/spec.ts --browser=chrome` (or `firefox`) |
| Formatting/linting changed files | `yarn lint:changed:fix` |

Only latest stable desktop Chrome and Firefox are supported. Chrome uses MV3; Firefox currently uses MV2 for its persistent background architecture. Build before E2E tests; builds clean the distribution directory. Development builds omit LavaMoat by default, so use test builds for final verification. See `docs/browser-support.md`.

## Architecture

- Background controllers: `app/scripts/controllers/`; use BaseController, a single options object, explicit state metadata, messenger actions/events, and selectors for derived state. Clean up background work in `destroy()`.
- Shared code/types: `shared/`; UI components/pages/hooks/state: `ui/`.
- Migrations: `app/scripts/migrations/`; generate with `yarn generate:migration` and register new migrations.
- Browser manifests: `app/manifest/`; Webpack build tooling: `development/webpack/`.
- Keep runtime code independent of development dependencies and preserve LavaMoat compartment boundaries.

When visual verification is explicitly requested, use the local MetaMask visual testing skill and `mm` CLI if available, querying prior knowledge and describing the screen before acting. Capture actual evidence and finish with `mm cleanup`. If unavailable, report that limitation and do not claim visual verification.
