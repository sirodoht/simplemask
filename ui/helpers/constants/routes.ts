import { memoize } from 'lodash';
import {
  NOTIFICATIONS_SETTINGS_ROUTE,
  NOTIFICATIONS_SETTINGS_WALLET_ACTIVITY_ROUTE,
  NOTIFICATIONS_SETTINGS_AGENTIC_CLI_ROUTE,
} from '../../../shared/lib/notifications-settings';

export {
  NOTIFICATIONS_SETTINGS_ROUTE,
  NOTIFICATIONS_SETTINGS_WALLET_ACTIVITY_ROUTE,
  NOTIFICATIONS_SETTINGS_AGENTIC_CLI_ROUTE,
};

type AppRoute = {
  path: string;
  label: string;
  trackInAnalytics: boolean;
};

export const DEFAULT_ROUTE = '/';
export const PREVIOUS_ROUTE = -1;
export const UNLOCK_ROUTE = '/unlock';
export const LOCK_ROUTE = '/lock';
export const ASSET_ROUTE = '/asset';
export const ASSET_DETAILS_ROUTE =
  `${ASSET_ROUTE}/:chainId/:asset?/:id?` as const;
export const ASSET_SECURITY_TRUST_ROUTE =
  `${ASSET_ROUTE}/:chainId/:asset?/:id?/security-trust` as const;
export const SETTINGS_ROUTE = '/settings';
export const LEGACY_SETTINGS_V2_ROUTE = '/settings-v2';
export const ASSETS_ROUTE = '/settings/assets';
export const CURRENCY_ROUTE = '/settings/preferences-and-display/currency';
export const TRANSACTIONS_ROUTE = '/settings/transactions';
export const PREFERENCES_AND_DISPLAY_ROUTE =
  '/settings/preferences-and-display';
export const THEME_ROUTE = '/settings/preferences-and-display/theme';
export const ACCOUNT_IDENTICON_ROUTE =
  '/settings/preferences-and-display/account-identicon';
export const PRIVACY_ROUTE = '/settings/privacy';
export const THIRD_PARTY_APIS_ROUTE = '/settings/privacy/third-party-apis';
export const SECURITY_AND_PASSWORD_ROUTE = '/settings/security-and-password';
export const AUTO_LOCK_ROUTE = '/settings/security-and-password/auto-lock';
export const MANAGE_WALLET_RECOVERY_ROUTE =
  '/settings/security-and-password/manage-wallet-recovery';
export const SECURITY_PASSWORD_CHANGE_V2_ROUTE =
  '/settings/security-and-password/password';
export const SECURITY_REGISTER_PASSKEY_ROUTE =
  '/settings/security-and-password/register-passkey';
export const SECURITY_TURN_OFF_PASSKEY_ROUTE =
  '/settings/security-and-password/turn-off-passkey';
export const DEVELOPER_TOOLS_ROUTE = '/settings/developer-tools';
export const DEBUG_ROUTE = '/settings/debug';
export const SYNC_ACCOUNTS_ROUTE = '/sync-accounts';
export const MFA_FLOW_ROUTE = '/mfa';
export const MFA_SETTINGS_ROUTE =
  '/settings/security-and-password/verification-methods';
export const DEVELOPER_OPTIONS_ROUTE = DEBUG_ROUTE;
export const EXPERIMENTAL_ROUTE = '/settings/experimental';
export const ABOUT_US_ROUTE = '/settings/about-us';
export const NETWORKS_ROUTE = '/networks';
export const NETWORKS_FORM_ROUTE = '/networks/form';
export const ADD_NETWORK_ROUTE = '/networks/add-network';
export const ADD_POPULAR_CUSTOM_NETWORK =
  '/networks/add-popular-custom-network';
// Contacts (global menu)
export const CONTACTS_ROUTE = '/contacts';
export const CONTACTS_ADD_ROUTE = '/contacts/add';
export const CONTACTS_VIEW_ROUTE = '/contacts/view';
export const CONTACTS_EDIT_ROUTE = '/contacts/edit';
export const SNAP_SETTINGS_ROUTE = '/settings/snap';
export const BACKUPANDSYNC_ROUTE = '/settings/backup-and-sync';
export const REVEAL_SEED_ROUTE = '/seed';
export const IMPORT_SRP_ROUTE = '/import-srp';
export const RESTORE_VAULT_ROUTE = '/restore-vault';
export const IMPORT_TOKEN_ROUTE = '/import-token';
export const IMPORT_TOKENS_ROUTE = '/import-tokens';
export const CONFIRM_IMPORT_TOKEN_ROUTE = '/confirm-import-token';
export const TOKEN_MANAGEMENT_ROUTE = '/token-management';
export const CUSTOM_TOKEN_IMPORT_ROUTE = '/custom-token-import';
export const CONFIRM_ADD_SUGGESTED_TOKEN_ROUTE = '/confirm-add-suggested-token';
export const ACCOUNT_LIST_PAGE_ROUTE = '/account-list';
export const MULTICHAIN_ACCOUNT_ADDRESS_LIST_PAGE_ROUTE =
  '/multichain-account-address-list';
export const MULTICHAIN_ACCOUNT_PRIVATE_KEY_LIST_PAGE_ROUTE =
  '/multichain-account-private-key-list';
export const ADD_WALLET_PAGE_ROUTE = '/add-wallet-page';
export const CHOOSE_NEW_WALLET_TYPE_PAGE_ROUTE = '/choose-new-wallet-type';
export const MULTICHAIN_ACCOUNT_DETAILS_PAGE_ROUTE =
  '/multichain-account-details';
export const MULTICHAIN_WALLET_DETAILS_PAGE_ROUTE =
  '/multichain-wallet-details-page';
export const MULTICHAIN_SMART_ACCOUNT_PAGE_ROUTE = '/multichain-smart-account';
export const NEW_ACCOUNT_ROUTE = '/new-account';
export const CONNECT_HARDWARE_ROUTE = '/new-account/connect';
export const HARDWARE_WALLET_REPAIR_ROUTE = '/hardware-wallet-repair';
export const SEND_ROUTE = '/send';
export const SEND_PAGE_ROUTE = `${SEND_ROUTE}/:page?` as const;
export const REMOTE_ROUTE = '/remote';
export const REMOTE_ROUTE_SETUP_DAILY_ALLOWANCE =
  '/remote/setup-daily-allowance';
export const PERMISSIONS = '/permissions';
export const GATOR_PERMISSIONS = '/gator-permissions';
export const TOKEN_TRANSFER_ROUTE = '/gator-permissions/token-transfer';
export const TOKEN_TRANSFER_DETAILS_ROUTE =
  `${TOKEN_TRANSFER_ROUTE}/:origin?` as const;
export const REVIEW_GATOR_PERMISSIONS_ROUTE = '/review-gator-permissions';
export const REVIEW_GATOR_PERMISSIONS_DETAILS_ROUTE =
  `${REVIEW_GATOR_PERMISSIONS_ROUTE}/:chainId/:permissionGroupName/:origin?` as const;
export const REVIEW_PERMISSIONS = '/review-permissions';
export const CONNECT_ROUTE = '/connect';
export const CONNECT_CONFIRM_PERMISSIONS_ROUTE = '/confirm-permissions';
export const CONNECT_SNAPS_CONNECT_ROUTE = '/snaps-connect';
export const CONNECT_SNAP_INSTALL_ROUTE = '/snap-install';
export const CONNECT_SNAP_UPDATE_ROUTE = '/snap-update';
export const CONNECT_SNAP_RESULT_ROUTE = '/snap-install-result';
export const SNAPS_ROUTE = '/snaps';
export const SNAPS_VIEW_ROUTE = '/snaps/view';
export const NOTIFICATIONS_ROUTE = '/notifications';
export const CONNECTED_ROUTE = '/connected';
export const CONNECTED_ACCOUNTS_ROUTE = '/connected/accounts';
export const CONFIRM_TRANSACTION_ROUTE = '/confirm-transaction';
export const CONFIRMATION_V_NEXT_ROUTE = '/confirmation';
export const SIGNATURE_REQUEST_PATH = '/signature-request';
export const DECRYPT_MESSAGE_REQUEST_PATH = '/decrypt-message-request';
export const ENCRYPTION_PUBLIC_KEY_REQUEST_PATH =
  '/encryption-public-key-request';
export const TX_DETAILS_ROUTE = '/tx';
export const HARDWARE_WALLET_SIGNATURES_ROUTE = '/hardware-wallet-signatures';
export const ONBOARDING_ROUTE = '/onboarding';
export const ONBOARDING_REVEAL_SRP_ROUTE = '/onboarding/reveal-recovery-phrase';
export const ONBOARDING_REVIEW_SRP_ROUTE = '/onboarding/review-recovery-phrase';
export const ONBOARDING_CONFIRM_SRP_ROUTE =
  '/onboarding/confirm-recovery-phrase';
export const ONBOARDING_CREATE_PASSWORD_ROUTE = '/onboarding/create-password';
export const ONBOARDING_COMPLETION_ROUTE = '/onboarding/completion';
export const ONBOARDING_UNLOCK_ROUTE = '/onboarding/unlock';
export const ONBOARDING_HELP_US_IMPROVE_ROUTE = '/onboarding/help-us-improve';
export const ONBOARDING_IMPORT_WITH_SRP_ROUTE =
  '/onboarding/import-with-recovery-phrase';
export const ONBOARDING_PRIVACY_SETTINGS_ROUTE = '/onboarding/privacy-settings';
export const ONBOARDING_WELCOME_ROUTE = '/onboarding/welcome';
export const ONBOARDING_METAMETRICS = '/onboarding/metametrics';
export const ONBOARDING_ACCOUNT_EXIST = '/onboarding/account-exist';
export const ONBOARDING_ACCOUNT_NOT_FOUND = '/onboarding/account-not-found';
export const INITIALIZE_EXPERIMENTAL_AREA = '/initialize/experimental-area';
export const ONBOARDING_EXPERIMENTAL_AREA = '/onboarding/experimental-area';
export const ONBOARDING_SETUP_PASSKEY_ROUTE = '/onboarding/setup-passkey';
export const ONBOARDING_PASSKEY_PRF_MIGRATION_ROUTE =
  '/onboarding/passkey-prf-migration';
export const DEEP_LINK_ROUTE = '/link';

/** Shown when Basic Functionality is off and user opens a route that requires it (e.g. network services). */
export const BASIC_FUNCTIONALITY_OFF_ROUTE = '/basic-functionality-off';
export const ACTIVITY_ROUTE = '/activity';

export const ROUTES = [
  { path: DEFAULT_ROUTE, label: 'Home', trackInAnalytics: true },
  { path: ACTIVITY_ROUTE, label: 'Activity', trackInAnalytics: true },
  { path: '', label: 'Home', trackInAnalytics: true }, // "" is an alias for the Home route
  {
    path: `${TX_DETAILS_ROUTE}/:caipChainId/:txIdentifier`,
    label: 'Transaction Details',
    trackInAnalytics: true,
  },
  { path: UNLOCK_ROUTE, label: 'Unlock Page', trackInAnalytics: true },
  { path: LOCK_ROUTE, label: 'Lock Page', trackInAnalytics: true },
  {
    path: ACCOUNT_LIST_PAGE_ROUTE,
    label: 'Account List Page',
    trackInAnalytics: true,
  },
  {
    path: MULTICHAIN_ACCOUNT_DETAILS_PAGE_ROUTE,
    label: 'Account Details Page',
    trackInAnalytics: true,
  },
  {
    path: MULTICHAIN_WALLET_DETAILS_PAGE_ROUTE,
    label: 'Wallet Details Page',
    trackInAnalytics: true,
  },
  {
    path: CHOOSE_NEW_WALLET_TYPE_PAGE_ROUTE,
    label: 'Choose New Wallet Type Page',
    trackInAnalytics: true,
  },
  {
    path: ADD_WALLET_PAGE_ROUTE,
    label: 'Add Wallet Page',
    trackInAnalytics: false,
  },
  {
    path: `${MULTICHAIN_SMART_ACCOUNT_PAGE_ROUTE}/:address`,
    label: 'Smart Account Page',
    trackInAnalytics: true,
  },
  {
    path: MULTICHAIN_ACCOUNT_ADDRESS_LIST_PAGE_ROUTE,
    label: 'Account Address List Page',
    trackInAnalytics: false,
  },
  {
    path: MULTICHAIN_ACCOUNT_PRIVATE_KEY_LIST_PAGE_ROUTE,
    label: 'Account Private Key List Page',
    trackInAnalytics: false,
  },
  {
    path: ASSET_DETAILS_ROUTE,
    label: 'Asset Page',
    trackInAnalytics: true,
  },
  {
    path: ASSET_SECURITY_TRUST_ROUTE,
    label: 'Asset Security Trust Page',
    trackInAnalytics: true,
  },
  { path: SETTINGS_ROUTE, label: 'Settings Page', trackInAnalytics: true },
  {
    path: LEGACY_SETTINGS_V2_ROUTE,
    label: 'Settings V2 Page',
    trackInAnalytics: true,
  },
  { path: ASSETS_ROUTE, label: 'Assets Settings Page', trackInAnalytics: true },
  {
    path: CURRENCY_ROUTE,
    label: 'Currency Settings Page',
    trackInAnalytics: true,
  },
  {
    path: SECURITY_AND_PASSWORD_ROUTE,
    label: 'Security And Password Settings Page',
    trackInAnalytics: false,
  },
  {
    path: AUTO_LOCK_ROUTE,
    label: 'Auto Lock Settings Page',
    trackInAnalytics: false,
  },
  {
    path: MANAGE_WALLET_RECOVERY_ROUTE,
    label: 'Manage Wallet Recovery Settings Page',
    trackInAnalytics: true,
  },
  {
    path: SECURITY_PASSWORD_CHANGE_V2_ROUTE,
    label: 'Password Settings Page',
    trackInAnalytics: true,
  },
  {
    path: SECURITY_REGISTER_PASSKEY_ROUTE,
    label: 'Register Passkey',
    trackInAnalytics: true,
  },
  {
    path: SECURITY_TURN_OFF_PASSKEY_ROUTE,
    label: 'Turn Off Passkey',
    trackInAnalytics: true,
  },
  {
    path: PRIVACY_ROUTE,
    label: 'Privacy Settings Page',
    trackInAnalytics: false,
  },
  {
    path: THIRD_PARTY_APIS_ROUTE,
    label: 'Third Party APIs Settings Page',
    trackInAnalytics: false,
  },
  {
    path: TRANSACTIONS_ROUTE,
    label: 'Transactions Settings Page',
    trackInAnalytics: false,
  },
  {
    path: PREFERENCES_AND_DISPLAY_ROUTE,
    label: 'Preferences And Display Settings Page',
    trackInAnalytics: true,
  },
  {
    path: THEME_ROUTE,
    label: 'Theme Settings Page',
    trackInAnalytics: true,
  },
  {
    path: ACCOUNT_IDENTICON_ROUTE,
    label: 'Account Identicon Settings Page',
    trackInAnalytics: true,
  },
  {
    path: DEVELOPER_TOOLS_ROUTE,
    label: 'Developer Tools Settings Page',
    trackInAnalytics: false,
  },
  {
    path: DEVELOPER_OPTIONS_ROUTE,
    label: 'Developer Options Page',
    // DEVELOPER_OPTIONS_ROUTE not in PATH_NAME_MAP because we're not tracking analytics for this page
    trackInAnalytics: false,
  },
  {
    path: EXPERIMENTAL_ROUTE,
    label: 'Experimental Settings Page',
    trackInAnalytics: true,
  },
  {
    path: ABOUT_US_ROUTE,
    label: 'About Us Page',
    trackInAnalytics: true,
  },
  {
    path: SYNC_ACCOUNTS_ROUTE,
    label: 'Sync Accounts Page',
    trackInAnalytics: false,
  },
  {
    path: MFA_FLOW_ROUTE,
    label: 'MFA Flow Page',
    trackInAnalytics: false,
  },
  {
    path: MFA_SETTINGS_ROUTE,
    label: 'MFA Settings Page',
    trackInAnalytics: false,
  },
  {
    path: BASIC_FUNCTIONALITY_OFF_ROUTE,
    label: 'Basic Functionality Off Page',
    trackInAnalytics: false,
  },
  {
    path: NETWORKS_ROUTE,
    label: 'Network Settings Page',
    trackInAnalytics: true,
  },
  {
    path: NETWORKS_FORM_ROUTE,
    label: 'Network Settings Page Form',
    trackInAnalytics: true,
  },
  {
    path: ADD_NETWORK_ROUTE,
    label: 'Add Network From Settings Page Form',
    trackInAnalytics: true,
  },
  {
    path: ADD_POPULAR_CUSTOM_NETWORK,
    label: 'Add Network From A List Of Popular Custom Networks',
    trackInAnalytics: true,
  },
  {
    path: CONTACTS_ROUTE,
    label: 'Contacts Page',
    trackInAnalytics: true,
  },
  {
    path: CONTACTS_ADD_ROUTE,
    label: 'Add Contact Page',
    trackInAnalytics: true,
  },
  {
    path: `${CONTACTS_VIEW_ROUTE}/:chainId/:address`,
    label: 'Contact Details Page',
    trackInAnalytics: true,
  },
  {
    path: `${CONTACTS_EDIT_ROUTE}/:chainId/:address`,
    label: 'Edit Contact Page',
    trackInAnalytics: true,
  },
  {
    path: SNAP_SETTINGS_ROUTE,
    label: 'Snap Settings Page',
    trackInAnalytics: true,
  },
  {
    path: BACKUPANDSYNC_ROUTE,
    label: 'Backup And Sync Settings Page',
    trackInAnalytics: true,
  },
  {
    path: REVEAL_SEED_ROUTE,
    label: 'Reveal Secret Recovery Phrase Page',
    trackInAnalytics: false,
  },
  {
    path: `${REVEAL_SEED_ROUTE}/:keyringId`,
    label: 'Reveal Secret Recovery Phrase Page',
    trackInAnalytics: true,
  },
  {
    path: IMPORT_SRP_ROUTE,
    label: 'Import Secret Recovery Phrase Page',
    trackInAnalytics: true,
  },
  {
    path: RESTORE_VAULT_ROUTE,
    label: 'Restore Vault Page',
    trackInAnalytics: true,
  },
  {
    path: IMPORT_TOKEN_ROUTE,
    label: 'Import Token Page',
    trackInAnalytics: true,
  },
  {
    path: IMPORT_TOKENS_ROUTE,
    label: 'Import Tokens Page',
    trackInAnalytics: true,
  },
  {
    path: CONFIRM_IMPORT_TOKEN_ROUTE,
    label: 'Confirm Import Token Page',
    trackInAnalytics: true,
  },
  {
    path: TOKEN_MANAGEMENT_ROUTE,
    label: 'Token Management Page',
    trackInAnalytics: true,
  },
  {
    path: CUSTOM_TOKEN_IMPORT_ROUTE,
    label: 'Custom Token Import Page',
    trackInAnalytics: true,
  },
  {
    path: CONFIRM_ADD_SUGGESTED_TOKEN_ROUTE,
    label: 'Confirm Add Suggested Token Page',
    trackInAnalytics: true,
  },
  {
    path: NEW_ACCOUNT_ROUTE,
    label: 'New Account Page',
    trackInAnalytics: true,
  },
  {
    path: CONNECT_HARDWARE_ROUTE,
    label: 'Connect Hardware Wallet Page',
    trackInAnalytics: true,
  },
  {
    path: SEND_PAGE_ROUTE,
    label: 'Send Page',
    trackInAnalytics: true,
  },
  { path: REMOTE_ROUTE, label: 'Remote Mode Page', trackInAnalytics: true },
  {
    path: REMOTE_ROUTE_SETUP_DAILY_ALLOWANCE,
    label: 'Remote Mode Setup Daily Allowance Page',
    trackInAnalytics: true,
  },
  { path: PERMISSIONS, label: 'Permissions', trackInAnalytics: true },
  {
    path: `${CONNECT_ROUTE}/:id`,
    label: 'Connect To Site Confirmation Page',
    trackInAnalytics: true,
  },
  {
    path: `${CONNECT_ROUTE}/:id${CONNECT_CONFIRM_PERMISSIONS_ROUTE}`,
    label: 'Grant Connected Site Permissions Confirmation Page',
    trackInAnalytics: true,
  },
  {
    path: `${CONNECT_ROUTE}/:id${CONNECT_SNAPS_CONNECT_ROUTE}`,
    label: 'Snaps Connect Page',
    trackInAnalytics: true,
  },
  {
    path: `${CONNECT_ROUTE}/:id${CONNECT_SNAP_INSTALL_ROUTE}`,
    label: 'Snap Install Page',
    trackInAnalytics: true,
  },
  {
    path: `${CONNECT_ROUTE}/:id${CONNECT_SNAP_UPDATE_ROUTE}`,
    label: 'Snap Update Page',
    trackInAnalytics: true,
  },
  {
    path: `${CONNECT_ROUTE}/:id${CONNECT_SNAP_RESULT_ROUTE}`,
    label: 'Snap Install Result Page',
    trackInAnalytics: true,
  },
  { path: SNAPS_ROUTE, label: 'Snaps List Page', trackInAnalytics: true },
  {
    path: SNAPS_VIEW_ROUTE,
    label: 'Snap View Page',
    trackInAnalytics: true,
  },
  {
    path: NOTIFICATIONS_ROUTE,
    label: 'Notifications Page',
    trackInAnalytics: true,
  },
  {
    path: `${NOTIFICATIONS_ROUTE}/:uuid`,
    label: 'Notification Detail Page',
    trackInAnalytics: true,
  },
  {
    path: NOTIFICATIONS_SETTINGS_ROUTE,
    label: 'Notifications Settings Page',
    trackInAnalytics: true,
  },
  {
    path: NOTIFICATIONS_SETTINGS_WALLET_ACTIVITY_ROUTE,
    label: 'Notifications Wallet Activity Settings Page',
    trackInAnalytics: false,
  },
  {
    path: NOTIFICATIONS_SETTINGS_AGENTIC_CLI_ROUTE,
    label: 'Notifications Agent Wallet Settings Page',
    trackInAnalytics: false,
  },
  {
    path: CONNECTED_ROUTE,
    label: 'Sites Connected To This Account Page',
    trackInAnalytics: true,
  },
  {
    path: CONNECTED_ACCOUNTS_ROUTE,
    label: 'Accounts Connected To This Site Page',
    trackInAnalytics: true,
  },
  {
    path: CONFIRM_TRANSACTION_ROUTE,
    label: 'Confirmation Root Page',
    trackInAnalytics: true,
  },
  {
    path: `${CONFIRM_TRANSACTION_ROUTE}/:id`,
    label: 'Confirmation Root Page',
    trackInAnalytics: true,
  },
  {
    path: CONFIRMATION_V_NEXT_ROUTE,
    label: 'New Confirmation Page',
    trackInAnalytics: true,
  },
  {
    path: `${CONFIRMATION_V_NEXT_ROUTE}/:id`,
    label: 'New Confirmation Page',
    trackInAnalytics: true,
  },
  {
    path: `${CONFIRM_TRANSACTION_ROUTE}/:id${SIGNATURE_REQUEST_PATH}`,
    label: 'Signature Request Page',
    trackInAnalytics: true,
  },
  {
    path: `${CONFIRM_TRANSACTION_ROUTE}/:id${DECRYPT_MESSAGE_REQUEST_PATH}`,
    label: 'Decrypt Message Request Page',
    trackInAnalytics: true,
  },
  {
    path: `${CONFIRM_TRANSACTION_ROUTE}/:id${ENCRYPTION_PUBLIC_KEY_REQUEST_PATH}`,
    label: 'Encryption Public Key Request Page',
    trackInAnalytics: true,
  },
  {
    path: DEEP_LINK_ROUTE,
    label: 'Deep link Redirect Page',
    trackInAnalytics: true,
  },
  // Onboarding routes
  { path: ONBOARDING_ROUTE, label: 'Onboarding', trackInAnalytics: false },
  {
    path: ONBOARDING_WELCOME_ROUTE,
    label: 'Onboarding Welcome',
    trackInAnalytics: false,
  },
  {
    path: ONBOARDING_CREATE_PASSWORD_ROUTE,
    label: 'Onboarding Create Password',
    trackInAnalytics: false,
  },
  {
    path: ONBOARDING_REVIEW_SRP_ROUTE,
    label: 'Onboarding Review Recovery Phrase',
    trackInAnalytics: false,
  },
  {
    path: ONBOARDING_CONFIRM_SRP_ROUTE,
    label: 'Onboarding Confirm Recovery Phrase',
    trackInAnalytics: false,
  },
  {
    path: ONBOARDING_REVEAL_SRP_ROUTE,
    label: 'Onboarding Reveal Recovery Phrase',
    trackInAnalytics: false,
  },
  {
    path: ONBOARDING_IMPORT_WITH_SRP_ROUTE,
    label: 'Onboarding Import With Recovery Phrase',
    trackInAnalytics: false,
  },
  {
    path: ONBOARDING_UNLOCK_ROUTE,
    label: 'Onboarding Unlock',
    trackInAnalytics: false,
  },
  {
    path: ONBOARDING_PRIVACY_SETTINGS_ROUTE,
    label: 'Onboarding Privacy Settings',
    trackInAnalytics: false,
  },
  {
    path: ONBOARDING_COMPLETION_ROUTE,
    label: 'Onboarding Completion',
    trackInAnalytics: false,
  },
  {
    path: ONBOARDING_HELP_US_IMPROVE_ROUTE,
    label: 'Onboarding Help Us Improve',
    trackInAnalytics: false,
  },
  {
    path: ONBOARDING_METAMETRICS,
    label: 'Onboarding Metametrics',
    trackInAnalytics: false,
  },
  {
    path: ONBOARDING_ACCOUNT_EXIST,
    label: 'Onboarding Account Exist',
    trackInAnalytics: false,
  },
  {
    path: ONBOARDING_ACCOUNT_NOT_FOUND,
    label: 'Onboarding Account Not Found',
    trackInAnalytics: false,
  },
  {
    path: ONBOARDING_SETUP_PASSKEY_ROUTE,
    label: 'Onboarding Setup Passkey',
    trackInAnalytics: false,
  },
  {
    path: REVIEW_PERMISSIONS,
    label: 'Review Permissions',
    trackInAnalytics: false,
  },
  {
    path: HARDWARE_WALLET_SIGNATURES_ROUTE,
    label: 'Hardware Wallet Signatures',
    trackInAnalytics: false,
  },
  {
    path: INITIALIZE_EXPERIMENTAL_AREA,
    label: 'Initialize Experimental Area',
    trackInAnalytics: false,
  },
  {
    path: ONBOARDING_EXPERIMENTAL_AREA,
    label: 'Onboarding Experimental Area',
    trackInAnalytics: false,
  },
  {
    path: GATOR_PERMISSIONS,
    label: 'Gator Permissions',
    trackInAnalytics: false,
  },
  {
    path: TOKEN_TRANSFER_DETAILS_ROUTE,
    label: 'Gator Permissions Token Transfer',
    trackInAnalytics: false,
  },
  {
    path: REVIEW_GATOR_PERMISSIONS_DETAILS_ROUTE,
    label: 'Review Gator Permissions',
    trackInAnalytics: false,
  },
  {
    path: HARDWARE_WALLET_REPAIR_ROUTE,
    label: 'Hardware Wallet Repair',
    trackInAnalytics: false,
  },
] as const satisfies AppRoute[];

export type AppRoutes = (typeof ROUTES)[number];

export const getPaths = memoize(() =>
  ROUTES.filter((r) => r.trackInAnalytics).map((r) => r.path),
);

// PATH_NAME_MAP for backward compatibility - only includes analytics-tracked routes
export const PATH_NAME_MAP = new Map<AppRoutes['path'], AppRoutes['label']>();

// Populate the map only with routes that have trackInAnalytics: true
ROUTES.forEach((route) => {
  if (route.trackInAnalytics) {
    PATH_NAME_MAP.set(route.path, route.label);
  }
});
