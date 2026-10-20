import { it } from '@jest/globals';
import {
  ACTIVITY_ROUTE,
  DEFAULT_ROUTE,
} from '../../../helpers/constants/routes';
import {
  getActiveBottomNavTabs,
  isBottomNavRoute,
} from './bottom-nav-bar.utils';

describe('getActiveBottomNavTabs', () => {
  it('marks isHome active on the default route', () => {
    expect(getActiveBottomNavTabs(DEFAULT_ROUTE)).toStrictEqual({
      isHome: true,
      isActivity: false,
    });
  });

  it('marks isActivity active on the activity route', () => {
    expect(getActiveBottomNavTabs(ACTIVITY_ROUTE)).toStrictEqual({
      isHome: false,
      isActivity: true,
    });
  });

  it('returns all false for an unrelated route', () => {
    expect(getActiveBottomNavTabs('/settings')).toStrictEqual({
      isHome: false,
      isActivity: false,
    });
  });
});

describe('isBottomNavRoute', () => {
  it.each([
    ['default route', DEFAULT_ROUTE],
    ['activity route', ACTIVITY_ROUTE],
  ])('returns true for the %s', (_label, route) => {
    expect(isBottomNavRoute(route)).toBe(true);
  });

  it.each([['/settings'], ['/send'], ['/confirm-transaction'], ['/unknown']])(
    'returns false for %s',
    (route) => {
      expect(isBottomNavRoute(route)).toBe(false);
    },
  );
});
