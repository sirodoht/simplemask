# Side panel

The side panel is supported in the Chrome Manifest V3 build. Firefox uses the popup or full-page interface. Other browsers are not supported targets.

## Browser and API checks

`shared/lib/environment.ts` checks whether the side-panel API is available. `useSidePanelEnabled` exposes that check to React components. `useBrowserSupportsSidePanel` verifies that the runtime can query side-panel contexts before the UI offers the view switch.

These checks use the browser APIs; there are no separate implementations for other Chromium browsers.

## Manifest and background

`app/manifest/v3/chrome.json` declares `side_panel.default_path` as `sidepanel.html`. The page entry point is `app/html/ui/sidepanel.html`.

`app/scripts/sidepanel/background.ts` initializes side-panel behavior and responds to changes in the `useSidePanelAsDefault` preference. When this preference is enabled, clicking the extension icon opens the side panel. When disabled, it opens the popup.

The background tracks connections from `ENVIRONMENT_TYPE_SIDEPANEL` so it can determine whether the wallet is open. The shared environment detector identifies the side-panel context from the page pathname.

## UI and state

The global menu switches between the popup and side panel. It verifies that the panel opened before saving the preference and closing the popup. A failed API call leaves the current view available.

The route container applies the `app--sidepanel` CSS class. The side panel shares wallet state, confirmations, and account/network selection with the other extension views. `AppStateController` tracks side-panel gas-polling tokens separately so closing one view does not stop polling for another.

## Verification

Use the Chrome build to exercise opening the panel, switching back to the popup, and handling wallet confirmations. Check Firefox separately to verify that popup and full-page behavior remain available without a side-panel API.

The E2E harness uses the Chrome-only `IS_SIDEPANEL` test configuration to choose the appropriate extension view. Browser build and release targets remain Chrome and Firefox.
