# Browser Support

SimpleMask supports Chrome and Firefox:

- The last two years of Chrome stable releases
- The current and previous Firefox Extended Support Release

Builds, release packaging, and browser tests target Chrome and Firefox only. Other Chromium browsers may run the shared Chrome implementation, but they are not supported or tested targets. Safari is out of scope.

## Providing notice of minimum supported version changes

Additionally, before bumping our minimum supported browser versions, we should always notify users in the application first. Otherwise users of older browser versions would unknowingly get stuck on old MetaMask versions, even if they had automatic updates enabled.

We have a home screen notification already for this purpose. All we need to do us update the `OUTDATED_BROWSER_VERSIONS` constant in the release prior to the minimum version bump, and all affected users should be notified in-app.
