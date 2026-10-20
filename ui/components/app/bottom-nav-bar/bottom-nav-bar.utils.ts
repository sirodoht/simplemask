import {
  ACTIVITY_ROUTE,
  DEFAULT_ROUTE,
} from '../../../helpers/constants/routes';

export type ActiveBottomNavTabs = {
  isHome: boolean;
  isActivity: boolean;
};

/**
 * Returns the active state of each bottom nav tab based on the pathname.
 *
 * @param pathname - The current location pathname.
 */
export const getActiveBottomNavTabs = (
  pathname: string,
): ActiveBottomNavTabs => {
  return {
    isHome: pathname === DEFAULT_ROUTE,
    isActivity: pathname === ACTIVITY_ROUTE,
  };
};

/**
 * Returns true when the pathname corresponds to one of the bottom nav
 * bar tabs (Home and Activity).
 *
 * @param pathname - The current location pathname.
 */
export const isBottomNavRoute = (pathname: string): boolean => {
  const activeBottomNavTabs = getActiveBottomNavTabs(pathname);
  return Object.values(activeBottomNavTabs).some(Boolean);
};
