import React from 'react';

import { fireEvent } from '@testing-library/react';
import { renderWithProvider } from '../../../../test/lib/render-helpers-navigate';
import configureStore from '../../../store/store';
import mockState from '../../../../test/data/mock-state.json';
import { englishText as messages } from '../../../../shared/lib/text';
import { createMockInternalAccount } from '../../../../test/jest/mocks';
import { ViewExplorerMenuItem } from '.';

const mockAccount = createMockInternalAccount({
  name: 'Account 1',
  address: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
});

const render = (account = mockAccount) => {
  const defaultState = {
    ...mockState,
    metamask: {
      ...mockState.metamask,
      completedOnboarding: true,
    },
  };
  const store = configureStore(defaultState);
  return renderWithProvider(
    <ViewExplorerMenuItem
      metricsLocation="Global Menu"
      closeMenu={jest.fn()}
      account={account}
    />,
    store,
  );
};

describe('ViewExplorerMenuItem', () => {
  it('renders "View on explorer"', () => {
    // @ts-expect-error mocking platform
    global.platform = { openTab: jest.fn(), closeCurrentWindow: jest.fn() };

    const { getByText, getByTestId } = render();
    expect(getByText(messages.viewOnExplorer)).toBeInTheDocument();

    const openExplorerTabSpy = jest.spyOn(global.platform, 'openTab');
    fireEvent.click(getByTestId('account-list-menu-open-explorer'));
    expect(openExplorerTabSpy).toHaveBeenCalled();
  });
});
