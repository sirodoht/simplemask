import React from 'react';

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import type { Location as RouterLocation } from 'react-router-dom';
import { renderWithProvider } from '../../../../test/lib/render-helpers-navigate';
import { englishText as messages } from '../../../../shared/lib/text';
import { ONBOARDING_COMPLETION_ROUTE } from '../../../helpers/constants/routes';
import OnboardingAppHeader from './onboarding-app-header';

const mockLocation = {
  pathname: '/test',
  search: '',
  hash: '',
  state: null,
} as RouterLocation;

describe('OnboardingAppHeader', () => {
  const mockState = {};

  const store = configureMockStore([thunk])(mockState);

  it('should match snapshot', () => {
    const { container } = renderWithProvider(
      <OnboardingAppHeader isWelcomePage={false} location={mockLocation} />,
      store,
    );

    expect(container).toMatchSnapshot();
  });

  it('does not offer a language selector', () => {
    const { queryByRole } = renderWithProvider(
      <OnboardingAppHeader isWelcomePage={false} location={mockLocation} />,
      store,
    );
    expect(queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('shoul match snapshot on onboarding completion page', () => {
    const completionLocation = {
      ...mockLocation,
      pathname: ONBOARDING_COMPLETION_ROUTE,
    };
    const { container } = renderWithProvider(
      <OnboardingAppHeader
        isWelcomePage={false}
        location={completionLocation}
      />,
      store,
    );
    expect(container).toMatchSnapshot();
  });

  it('should render the pin extension banner tip on onboarding completion page', () => {
    const completionLocation = {
      ...mockLocation,
      pathname: ONBOARDING_COMPLETION_ROUTE,
    };
    const { getByText } = renderWithProvider(
      <OnboardingAppHeader
        isWelcomePage={false}
        location={completionLocation}
      />,
      store,
    );
    expect(getByText(messages.pinMetaMask)).toBeInTheDocument();
  });
});
