# LavaMoat policy review

After dependency changes, update the lockfile, run `yarn lint:lockfile:dedupe:fix` and `yarn allow-scripts auto`, then run `yarn lavamoat:auto`. Review the generated policy diff before committing.

Trace each new global, builtin, or package permission to its consumer. Remove stale capabilities when dependencies disappear; do not grant broad permissions just to make builds pass. Keep application, build-tool, Chrome, and Firefox policies consistent with the actual dependency graph.

Run `yarn build:test` and `yarn build:test:mv2` with LavaMoat enabled, followed by affected wallet flows in both browsers. Development builds alone do not validate policies. Explain any new capabilities and the validation in the commit or PR. Policy generation and review are manual; there is no organization bot or external approval workflow in this fork.
