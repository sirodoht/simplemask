import { it } from '@jest/globals';
import React from 'react';
import { fireEvent } from '@testing-library/react';
import configureStore from '../../../store/store';
import mockState from '../../../../test/data/mock-state.json';
import { renderWithProvider } from '../../../../test/lib/render-helpers-navigate';
import {
  ACTIVITY_ROUTE,
  DEFAULT_ROUTE,
} from '../../../helpers/constants/routes';
import { ScreenViewedEntryPoint } from '../../../../shared/constants/metametrics';
import { BottomNavBar } from './bottom-nav-bar';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../../../shared/lib/environment', () => ({
  ...jest.requireActual('../../../../shared/lib/environment'),
  getIsPerpsIncludedInBuild: jest.fn(() => true),
}));

const baseState = {
  metamask: {
    ...mockState.metamask,
    completedOnboarding: true,
    remoteFeatureFlags: {
      ...mockState.metamask.remoteFeatureFlags,
      perpsEnabledVersion: { enabled: true, minimumVersion: '0.0.1' },
    },
  },
};

const stateWithPerpsDisabled = {
  metamask: {
    ...mockState.metamask,
    completedOnboarding: true,
    remoteFeatureFlags: {
      ...mockState.metamask.remoteFeatureFlags,
      perpsEnabledVersion: { enabled: false, minimumVersion: '0.0.1' },
    },
  },
};

const stateWithLastTab = {
  metamask: {
    ...baseState.metamask,
    defaultHomeActiveTabName: 'nfts',
  },
};

function renderBottomNavBar(state = baseState, pathname = DEFAULT_ROUTE) {
  const store = configureStore(state);
  return renderWithProvider(<BottomNavBar />, store, pathname);
}

describe('BottomNavBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('active state', () => {
    it('marks Home as active on the root route', () => {
      const { getByTestId, queryByTestId } = renderBottomNavBar(
        baseState,
        DEFAULT_ROUTE,
      );

      expect(getByTestId('bottom-nav-home')).toHaveAttribute(
        'aria-current',
        'page',
      );
      expect(queryByTestId('bottom-nav-perps')).not.toBeInTheDocument();
      expect(getByTestId('bottom-nav-activity')).not.toHaveAttribute(
        'aria-current',
      );
    });

    it('marks Activity as active on the /activity route', () => {
      const { getByTestId } = renderBottomNavBar(baseState, ACTIVITY_ROUTE);

      expect(getByTestId('bottom-nav-activity')).toHaveAttribute(
        'aria-current',
        'page',
      );
      expect(getByTestId('bottom-nav-home')).not.toHaveAttribute(
        'aria-current',
      );
    });
  });

  describe('navigation', () => {
    it('navigates to the root route when Home is clicked and no last tab is stored', () => {
      const { getByTestId } = renderBottomNavBar(baseState, ACTIVITY_ROUTE);

      fireEvent.click(getByTestId('bottom-nav-home'));
      expect(mockNavigate).toHaveBeenCalledWith(DEFAULT_ROUTE, {
        state: {
          entryPoint: ScreenViewedEntryPoint.BottomNavClick,
          stayOnHomePage: true,
        },
      });
    });

    it('navigates to the last active tab when Home is clicked and a tab is stored', () => {
      const { getByTestId } = renderBottomNavBar(
        stateWithLastTab,
        ACTIVITY_ROUTE,
      );

      fireEvent.click(getByTestId('bottom-nav-home'));
      expect(mockNavigate).toHaveBeenCalledWith(`${DEFAULT_ROUTE}?tab=nfts`, {
        state: {
          entryPoint: ScreenViewedEntryPoint.BottomNavClick,
          stayOnHomePage: true,
        },
      });
    });

    it('navigates to the activity route when Activity is clicked', () => {
      const { getByTestId } = renderBottomNavBar();

      fireEvent.click(getByTestId('bottom-nav-activity'));
      expect(mockNavigate).toHaveBeenCalledWith(ACTIVITY_ROUTE, {
        state: {
          entryPoint: ScreenViewedEntryPoint.BottomNavClick,
          stayOnHomePage: true,
        },
      });
    });
  });
});
