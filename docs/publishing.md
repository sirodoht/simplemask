# Manual publishing

This fork has no automated release, store-upload, tagging, or notification workflow. Test CI does not publish artifacts outside its temporary test artifacts.

Before a public release, choose the project's new identity and configure its own extension identifiers, store listings, and credentials. Do not reuse upstream publishing credentials or assume old MetaMask links belong to this project.

Update the version and release notes manually. Review migrations, permissions, dependency/policy changes, and retained wallet flows in latest stable Chrome and Firefox. Build production archives with `yarn dist` (Chrome MV3) and `yarn dist:mv2` (Firefox MV2); each build cleans output, so preserve the first archive before building the second. Inspect the actual outputs and manifests before upload.

Publishing to either store or creating a public release requires an explicit publishing request. Retain license and attribution requirements. Repository settings, signing credentials, rollout choices, and store submissions are managed separately from test CI.
