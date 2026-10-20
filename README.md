# SimpleMask

A lean, EVM-only wallet browser extension adapted from MetaMask, initially for personal use. The goal is excellent everyday wallet UX without ads, trading products, or unnecessary features.

This repository preserves MetaMask’s Git history. The original project documentation is in [README.upstream.md](README.upstream.md). This README records the agreed product direction and implementation backlog. Unchecked items are planned work, not completed changes.

This fork will have its own identity and does not retain compatibility with legacy MetaMask deep links. Links for removed features are retired along with those features.

## Supported browsers and networks

- Support and test Chrome and Firefox.
- Remove dedicated support, packaging, and documentation for other browser targets. Safari is out of scope.
- Shared Chromium implementation may still work in other Chromium browsers; those browsers are not supported targets.
- Support Ethereum and EVM-compatible networks, including custom networks and custom RPC endpoints.
- Remove non-EVM support, including Bitcoin, Solana, Tron, Stellar, and their associated integrations.

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
- [ ] Remove the DeFi portfolio dashboard.
- [ ] Remove integrated fiat buy/sell flows and provider integrations.
- [ ] Remove integrated swaps and bridging, including buttons, routes, quotes, background services, and feature-specific dependencies.
- [ ] Remove subscriptions and product upsells.
- [ ] Remove marketing notifications while retaining useful wallet and transaction status.
- [ ] Remove non-EVM account, asset, network, transaction, and signing flows.
- [ ] Remove non-EVM wallet Snaps and integrations. Audit remaining Snaps infrastructure and remove it where it is unnecessary for retained EVM functionality.
- [ ] Remove dedicated browser targets beyond Chrome and Firefox, including their build/release configuration and documentation.
- [ ] Remove obsolete feature flags, settings, routes, translations, assets, and tests associated with removed features.
- [ ] Remove unused controllers, dependencies, polling, and service requests after tracing their consumers.
- [ ] Reduce extension permissions where removed features were their only consumers.

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
