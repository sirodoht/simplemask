# Contributing

Use the Node version in `.nvmrc` and the Yarn version in `package.json`.
Run `corepack enable`, `yarn install`, and copy `.metamaskrc.dist` to `.metamaskrc`.
See [README](../README.md) for scope and supported browsers.

Use TypeScript for new source files and colocate unit tests. Before committing,
run `yarn lint:changed:fix` and the tests affected by the change. Dependency
changes also require lockfile deduplication, allow-scripts review, and
`yarn lavamoat:auto`. Test both Chrome and Firefox after shared runtime changes.

Use Conventional Commits. Keep PRs focused and describe validation and any
persisted-state or permission changes. Automated workflows only build and test;
releases and dependency updates are manual.
