/* eslint-disable import-x/no-useless-path-segments */
/* eslint-disable import-x/extensions */
import { type ComponentType } from 'react';
import { IconName } from '@metamask/design-system-react';
import { matchPath } from 'react-router-dom';
import {
  ACCOUNT_IDENTICON_ROUTE,
  ABOUT_US_ROUTE,
  ASSETS_ROUTE,
  AUTO_LOCK_ROUTE,
  BACKUPANDSYNC_ROUTE,
  CURRENCY_ROUTE,
  DEVELOPER_OPTIONS_ROUTE,
  DEVELOPER_TOOLS_ROUTE,
  MANAGE_WALLET_RECOVERY_ROUTE,
  MFA_SETTINGS_ROUTE,
  EXPERIMENTAL_ROUTE,
  NOTIFICATIONS_SETTINGS_ROUTE,
  NOTIFICATIONS_SETTINGS_WALLET_ACTIVITY_ROUTE,
  NOTIFICATIONS_SETTINGS_AGENTIC_CLI_ROUTE,
  PREFERENCES_AND_DISPLAY_ROUTE,
  SECURITY_AND_PASSWORD_ROUTE,
  SECURITY_PASSWORD_CHANGE_V2_ROUTE,
  SECURITY_REGISTER_PASSKEY_ROUTE,
  SECURITY_TURN_OFF_PASSKEY_ROUTE,
  SETTINGS_ROUTE,
  SNAP_SETTINGS_ROUTE,
  TRANSACTIONS_ROUTE,
  THEME_ROUTE,
  PRIVACY_ROUTE,
  THIRD_PARTY_APIS_ROUTE,
  SYNC_ACCOUNTS_ROUTE,
} from '../../helpers/constants/routes';
import { mmLazy } from '../../helpers/utils/mm-lazy';
import { getIsQrSyncEnabled } from '../../../shared/lib/environment';
import type {
  UIMessengerActions,
  UIMessengerEvents,
} from '../../messengers/ui-messenger';
import { isMfaKitEnabled } from '../../hooks/identity/mfa/isMfaKitEnabled';
import {
  PASSKEY_PASSWORD_CHANGE_ROUTE_CAPABILITIES,
  PASSKEY_REGISTRATION_ROUTE_CAPABILITIES,
  PASSKEY_SECURITY_ROUTE_CAPABILITIES,
  PASSKEY_TURN_OFF_ROUTE_CAPABILITIES,
} from './security-and-password-tab/messenger';

/**
 * Route definition for a Settings page.
 */
export type SettingsRouteMeta = {
  /** English text key for the route label (used in header, breadcrumbs, TabBar) */
  labelKey: string;
  /** Parent path for back navigation; undefined = settings root */
  parentPath?: string;
  /** Lazy-loaded component to render for this route */
  component?: ComponentType<React.PropsWithChildren<unknown>>;
  /** If true, this route appears as a tab in the TabBar */
  isTab?: boolean;
  /** Index routes render into their parent's Outlet at their parent's URL (like a default child route). */
  index?: boolean;
  /** Icon for TabBar (required if isTab is true) */
  iconName?: IconName;
  /** Background messenger capabilities delegated only while this route is mounted. */
  messengerCapabilities?: {
    actions?: UIMessengerActions['type'][];
    events?: UIMessengerEvents['type'][];
  };
  /**
   * If true, the route's component is mounted by the top-level app router
   * (outside `SettingsLayout`) rather than by the nested Settings router.
   * Used for full-page routes whose path is not under `/settings` (e.g.
   * `/sync-accounts`). These are excluded from `SETTINGS_RENDERABLE_ROUTES`
   * so the Settings router does not also mount a nested `/settings/<path>`
   * child that would duplicate headers and skip `hideAppHeader` matching.
   */
  externalRoute?: boolean;
};

export const SETTINGS_ROOT_SECTIONS: readonly {
  titleKeys: readonly string[];
  paths: readonly string[];
}[] = [
  {
    titleKeys: ['general'],
    paths: [PREFERENCES_AND_DISPLAY_ROUTE, NOTIFICATIONS_SETTINGS_ROUTE],
  },
  {
    titleKeys: ['securityAndPrivacy'],
    paths: [SECURITY_AND_PASSWORD_ROUTE, PRIVACY_ROUTE, BACKUPANDSYNC_ROUTE],
  },
  {
    titleKeys: ['transactionsAndAssets'],
    paths: [ASSETS_ROUTE, TRANSACTIONS_ROUTE],
  },
  {
    titleKeys: ['moreCapital'],
    paths: [
      EXPERIMENTAL_ROUTE,
      DEVELOPER_OPTIONS_ROUTE,
      DEVELOPER_TOOLS_ROUTE,
      ABOUT_US_ROUTE,
      ...(getIsQrSyncEnabled() ? [SYNC_ACCOUNTS_ROUTE] : []),
    ],
  },
] as const;

const SHOW_DEBUG_SETTINGS = Boolean(
  process.env.ENABLE_SETTINGS_PAGE_DEV_OPTIONS || process.env.IN_TEST,
);

/**
 * Single source of truth for all Settings routes.
 * Order of tabs in the TabBar is determined by declaration order of isTab entries.
 */
export const SETTINGS_ROUTES: Record<string, SettingsRouteMeta> = {
  // Settings root (no component - renders first tab content)
  [SETTINGS_ROUTE]: {
    labelKey: 'settings',
  },

  // --- Preferences and Display tab ---
  [PREFERENCES_AND_DISPLAY_ROUTE]: {
    labelKey: 'preferencesAndDisplay',
    parentPath: SETTINGS_ROUTE,
    component: mmLazy(() => import('./preferences-and-display-tab/index.ts')),
    isTab: true,
    iconName: IconName.Customize,
    index: true,
  },
  [THEME_ROUTE]: {
    labelKey: 'theme',
    parentPath: PREFERENCES_AND_DISPLAY_ROUTE,
    component: mmLazy(
      () => import('./preferences-and-display-tab/theme-sub-page.tsx'),
    ),
  },
  [ACCOUNT_IDENTICON_ROUTE]: {
    labelKey: 'accountIdenticon',
    parentPath: PREFERENCES_AND_DISPLAY_ROUTE,
    component: mmLazy(
      () =>
        import('./preferences-and-display-tab/account-identicon-sub-page.tsx'),
    ),
  },
  [CURRENCY_ROUTE]: {
    labelKey: 'localCurrency',
    parentPath: PREFERENCES_AND_DISPLAY_ROUTE,
    component: mmLazy(() => import('./assets-tab/currency-sub-page.tsx')),
  },

  // --- Notifications tab ---
  [NOTIFICATIONS_SETTINGS_ROUTE]: {
    labelKey: 'notifications',
    parentPath: SETTINGS_ROUTE,
    component: mmLazy(() => import('./notifications-tab/index.ts')),
    isTab: true,
    iconName: IconName.Notification,
  },
  [NOTIFICATIONS_SETTINGS_WALLET_ACTIVITY_ROUTE]: {
    labelKey: 'notificationsSettingsWalletActivityTitle',
    parentPath: NOTIFICATIONS_SETTINGS_ROUTE,
    component: mmLazy(
      () => import('./notifications-tab/wallet-activity-sub-page.tsx'),
    ),
  },
  [NOTIFICATIONS_SETTINGS_AGENTIC_CLI_ROUTE]: {
    labelKey: 'notificationsSettingsAgenticCliTitle',
    parentPath: NOTIFICATIONS_SETTINGS_ROUTE,
    component: mmLazy(
      () => import('./notifications-tab/agentic-cli-sub-page.tsx'),
    ),
  },

  // --- Security and Password tab ---
  [SECURITY_AND_PASSWORD_ROUTE]: {
    labelKey: 'securityAndPassword',
    parentPath: SETTINGS_ROUTE,
    component: mmLazy(() => import('./security-and-password-tab/index.ts')),
    isTab: true,
    iconName: IconName.SecurityKey,
    messengerCapabilities: PASSKEY_SECURITY_ROUTE_CAPABILITIES,
  },
  [AUTO_LOCK_ROUTE]: {
    labelKey: 'autoLock',
    parentPath: SECURITY_AND_PASSWORD_ROUTE,
    component: mmLazy(
      () => import('./security-and-password-tab/auto-lock-sub-page.tsx'),
    ),
  },
  ...(isMfaKitEnabled()
    ? {
        [MFA_SETTINGS_ROUTE]: {
          labelKey: 'mfaSettingsTitle',
          parentPath: SECURITY_AND_PASSWORD_ROUTE,
          component: mmLazy(() => import('./mfa-settings/mfa-settings.tsx')),
        },
      }
    : {}),
  [MANAGE_WALLET_RECOVERY_ROUTE]: {
    labelKey: 'manageWalletRecovery',
    parentPath: SECURITY_AND_PASSWORD_ROUTE,
    component: mmLazy(
      () =>
        import('./security-and-password-tab/manage-wallet-recovery-sub-page.tsx'),
    ),
  },
  [SECURITY_PASSWORD_CHANGE_V2_ROUTE]: {
    labelKey: 'password',
    parentPath: SECURITY_AND_PASSWORD_ROUTE,
    component: mmLazy(
      () => import('./security-and-password-tab/password-sub-page.tsx'),
    ),
    messengerCapabilities: PASSKEY_PASSWORD_CHANGE_ROUTE_CAPABILITIES,
  },
  [SECURITY_REGISTER_PASSKEY_ROUTE]: {
    labelKey: 'setUpPasskey',
    parentPath: SECURITY_AND_PASSWORD_ROUTE,
    component: mmLazy(
      () => import('./security-and-password-tab/passkey-register-sub-page.tsx'),
    ),
    messengerCapabilities: PASSKEY_REGISTRATION_ROUTE_CAPABILITIES,
  },
  [SECURITY_TURN_OFF_PASSKEY_ROUTE]: {
    labelKey: 'turnOffPasskey',
    parentPath: SECURITY_AND_PASSWORD_ROUTE,
    component: mmLazy(
      () => import('./security-and-password-tab/passkey-turn-off-sub-page.tsx'),
    ),
    messengerCapabilities: PASSKEY_TURN_OFF_ROUTE_CAPABILITIES,
  },

  // --- Privacy tab ---
  [PRIVACY_ROUTE]: {
    labelKey: 'privacy',
    parentPath: SETTINGS_ROUTE,
    component: mmLazy(() => import('./privacy-tab/index.ts')),
    isTab: true,
    iconName: IconName.Lock,
  },
  [THIRD_PARTY_APIS_ROUTE]: {
    labelKey: 'thirdPartyApis',
    parentPath: PRIVACY_ROUTE,
    component: mmLazy(
      () => import('./privacy-tab/third-party-apis-sub-page.tsx'),
    ),
  },

  // --- Backup and sync tab ---
  [BACKUPANDSYNC_ROUTE]: {
    labelKey: 'backupAndSync',
    parentPath: SETTINGS_ROUTE,
    component: mmLazy(
      () => import('./backup-and-sync-tab/backup-and-sync-tab.tsx'),
    ),
    isTab: true,
    iconName: IconName.SecurityTime,
  },

  // --- Assets tab ---
  [ASSETS_ROUTE]: {
    labelKey: 'assets',
    parentPath: SETTINGS_ROUTE,
    component: mmLazy(() => import('./assets-tab/index.ts')),
    isTab: true,
    iconName: IconName.Coin,
  },

  // --- Transactions tab ---
  [TRANSACTIONS_ROUTE]: {
    labelKey: 'transactions',
    parentPath: SETTINGS_ROUTE,
    component: mmLazy(() => import('./transactions-tab/index.ts')),
    isTab: true,
    iconName: IconName.SwapVertical,
  },

  // --- Sync Accounts tab (only when QR_SYNC_ENABLED=true) ---
  ...(getIsQrSyncEnabled()
    ? {
        [SYNC_ACCOUNTS_ROUTE]: {
          labelKey: 'syncAccounts',
          component: mmLazy(() => import('./sync-accounts/index.ts')),
          isTab: true,
          iconName: IconName.Mobile,
          // Mounted top-level at `/sync-accounts` by the app router, not nested
          // under `/settings`. Excluded from SETTINGS_RENDERABLE_ROUTES below.
          externalRoute: true,
        },
      }
    : {}),

  // --- Experimental tab ---
  [EXPERIMENTAL_ROUTE]: {
    labelKey: 'experimental',
    parentPath: SETTINGS_ROUTE,
    component: mmLazy(() => import('./experimental-tab/experimental-tab.tsx')),
    isTab: true,
    iconName: IconName.Flask,
  },

  // --- Debug (internal) tab ---
  ...(SHOW_DEBUG_SETTINGS
    ? {
        [DEVELOPER_OPTIONS_ROUTE]: {
          labelKey: 'debug',
          parentPath: SETTINGS_ROUTE,
          component: mmLazy(() => import('./debug-tab/index.ts')),
          isTab: true,
          iconName: IconName.Sparkle,
        },
      }
    : {}),

  // --- Developer Tools tab ---
  [DEVELOPER_TOOLS_ROUTE]: {
    labelKey: 'developerTools',
    parentPath: SETTINGS_ROUTE,
    component: mmLazy(() => import('./developer-tools-tab/index.ts')),
    isTab: true,
    iconName: IconName.Code,
  },

  // --- About tab ---
  [ABOUT_US_ROUTE]: {
    labelKey: 'aboutMetaMask',
    parentPath: SETTINGS_ROUTE,
    component: mmLazy(() => import('./about-tab/index.ts')),
    isTab: true,
    iconName: IconName.Info,
  },

  // --- Snap settings (navigated via URL, not shown as a tab) ---
  [SNAP_SETTINGS_ROUTE]: {
    labelKey: 'snaps',
    parentPath: SETTINGS_ROUTE,
  },
};

/**
 * Returns route definition for the given pathname, or null if not found.
 *
 * @param pathname - The route pathname to look up
 */
export function getSettingsRouteMeta(
  pathname: string,
): SettingsRouteMeta | null {
  if (!pathname) {
    return null;
  }

  const exactMeta = SETTINGS_ROUTES[pathname];
  if (exactMeta) {
    return exactMeta;
  }

  const matchingRoute = Object.keys(SETTINGS_ROUTES)
    .filter((routePath) => routePath.includes('*') || routePath.includes(':'))
    .sort((routeA, routeB) => routeB.length - routeA.length)
    .find((routePath) =>
      Boolean(
        matchPath(
          {
            path: routePath,
            end: true,
          },
          pathname,
        ),
      ),
    );

  return matchingRoute ? SETTINGS_ROUTES[matchingRoute] : null;
}

type TabRouteMeta = SettingsRouteMeta &
  Required<Pick<SettingsRouteMeta, 'iconName' | 'component'>>;

type RenderableRouteMeta = SettingsRouteMeta &
  Required<Pick<SettingsRouteMeta, 'component'>>;

/**
 * Derived list of tabs for the TabBar, in order of declaration.
 */
export const SETTINGS_TABS = Object.entries(SETTINGS_ROUTES)
  .filter((entry): entry is [string, TabRouteMeta] => {
    const [, meta] = entry;
    return Boolean(meta.isTab && meta.iconName && meta.component);
  })
  .map(([path, meta]) => ({
    id: path.split('/').pop() || path,
    path,
    labelKey: meta.labelKey,
    iconName: meta.iconName,
    component: meta.component,
    index: meta.index,
  }));

/**
 * All routes that have a component and are rendered by the nested Settings
 * router (for generating Route elements). Excludes `externalRoute` entries,
 * which are mounted top-level by the app router.
 */
export const SETTINGS_RENDERABLE_ROUTES = Object.entries(SETTINGS_ROUTES)
  .filter((entry): entry is [string, RenderableRouteMeta] => {
    const [, meta] = entry;
    return Boolean(meta.component) && !meta.externalRoute;
  })
  .map(([path, meta]) => ({
    path,
    component: meta.component,
    messengerCapabilities: meta.messengerCapabilities,
    index: meta.index,
  }));
