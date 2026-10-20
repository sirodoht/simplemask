import React from 'react';

import { fireEvent, waitFor, act } from '@testing-library/react';
import type { Dispatch, Store } from 'redux';
import { renderWithProvider } from '../../../../test/lib/render-helpers-navigate';
import { ONBOARDING_COMPLETION_ROUTE } from '../../../helpers/constants/routes';
import { englishText as messages } from '../../../../shared/lib/text';
import { setParticipateInMetaMetrics } from '../../../store/actions';
import configureStore from '../../../store/store';
import { FirstTimeFlowType } from '../../../../shared/constants/onboarding';
import OnboardingMetametrics from './metametrics';

jest.mock('../../../hooks/useAnalytics', () => {
  const { createEventBuilder } = jest.requireActual(
    '../../../../shared/lib/analytics/create-event-builder',
  );

  return {
    useAnalytics: () => ({
      trackEvent: jest.fn(),
      createEventBuilder,
    }),
  };
});

const mockUseNavigate = jest.fn();

jest.mock('react-router-dom', () => {
  return {
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockUseNavigate,
    useLocation: jest.fn(() => ({ search: '' })),
  };
});

jest.mock('../../../store/actions.ts', () => {
  const actionConstants = jest.requireActual('../../../store/actionConstants');
  return {
    setParticipateInMetaMetrics: jest.fn((value) => (dispatch: Dispatch) => {
      dispatch({ type: actionConstants.SET_PARTICIPATE_IN_METAMETRICS, value });
      return Promise.resolve([value]);
    }),
    setPna25Acknowledged: jest.fn(() => () => Promise.resolve()),
  };
});

describe('Onboarding Metametrics Component', () => {
  let store: Store;

  const mockState = {
    metamask: {
      firstTimeFlowType: FirstTimeFlowType.create,
      consentDecisionMade: false,
      optedIn: false,
      internalAccounts: {
        accounts: {},
        selectedAccount: '',
      },
    },
  };

  async function clickElement(element: HTMLElement) {
    await act(async () => {
      fireEvent.click(element);
    });
  }

  async function keyDownElement(element: HTMLElement, key: string) {
    await act(async () => {
      fireEvent.keyDown(element, { key });
    });
  }

  beforeEach(() => {
    store = configureStore(mockState);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders match snapshot', () => {
    const { container } = renderWithProvider(<OnboardingMetametrics />, store);
    expect(container).toMatchSnapshot();
  });

  it('renders match snapshot after new policy date', () => {
    // TODO: merge this with the previous test once this date is reached
    jest.useFakeTimers().setSystemTime(new Date('2024-06-05'));
    const { container } = renderWithProvider(<OnboardingMetametrics />, store);
    expect(container).toMatchSnapshot();
    jest.useRealTimers();
  });

  it('default value is checked for ParticiapteMetatmric so on continue setParticipateInMetaMetrics should be called with true', async () => {
    const { queryByText, getByTestId, getAllByRole } = renderWithProvider(
      <OnboardingMetametrics />,
      store,
    );

    const title = queryByText(messages.onboardingMetametricCheckboxTitleOne);
    const description = queryByText(
      messages.onboardingMetametricCheckboxDescriptionOneUpdated,
    );

    expect(title).toBeInTheDocument();
    expect(description).toBeInTheDocument();

    const checkbox = getAllByRole('checkbox')[0];

    await waitFor(() => {
      expect(checkbox).toBeChecked();
      expect(checkbox).toBeInTheDocument();
    });

    const continueButton = getByTestId('metametrics-i-agree');

    await clickElement(continueButton);

    await waitFor(() => {
      expect(mockUseNavigate).toHaveBeenCalledWith(
        ONBOARDING_COMPLETION_ROUTE,
        { replace: true },
      );
    });
  });

  it('when the participate in MetaMetrics checkbox is unchecked, setParticipateInMetaMetrics should be called with false', async () => {
    const { queryByText, getByTestId, getAllByRole } = renderWithProvider(
      <OnboardingMetametrics />,
      store,
    );

    const title = queryByText(messages.onboardingMetametricCheckboxTitleOne);
    const description = queryByText(
      messages.onboardingMetametricCheckboxDescriptionOneUpdated,
    );

    expect(title).toBeInTheDocument();
    expect(description).toBeInTheDocument();

    const checkboxLabel = queryByText(
      messages.onboardingMetametricCheckboxTitleOne,
    );
    expect(checkboxLabel).toBeInTheDocument();

    const checkbox = getAllByRole('checkbox')[0];
    const participateContainer = getByTestId(
      'metametrics-checkbox',
    ) as HTMLElement;

    expect(checkbox).toBeChecked();
    expect(checkbox).toBeInTheDocument();

    await clickElement(participateContainer);

    await waitFor(() => {
      expect(checkbox).not.toBeChecked();
    });

    const continueButton = getByTestId('metametrics-i-agree');

    await clickElement(continueButton);

    await waitFor(() => {
      expect(setParticipateInMetaMetrics).toHaveBeenCalledWith(false);
      expect(mockUseNavigate).toHaveBeenCalledWith(
        ONBOARDING_COMPLETION_ROUTE,
        { replace: true },
      );
    });
  });

  it('should render the Onboarding component when the current date is after the new privacy policy date', () => {
    jest.useFakeTimers().setSystemTime(new Date('2099-11-11'));
    const { queryByTestId } = renderWithProvider(
      <OnboardingMetametrics />,
      store,
    );
    expect(
      queryByTestId('parent-selector-onboarding-metrics'),
    ).toBeInTheDocument();
  });

  it('clicking the participate checkbox container toggles the participate checkbox', async () => {
    const { getByTestId, getAllByRole } = renderWithProvider(
      <OnboardingMetametrics />,
      store,
    );

    const participateCheckboxContainer = getByTestId(
      'metametrics-checkbox',
    ) as HTMLElement;
    const checkbox = getAllByRole('checkbox')[0];

    expect(checkbox).toBeChecked();

    await clickElement(participateCheckboxContainer);
    await waitFor(() => {
      expect(checkbox).not.toBeChecked();
    });

    await clickElement(participateCheckboxContainer);
    await waitFor(() => {
      expect(checkbox).toBeChecked();
    });
  });

  it('pressing Space on the participate checkbox container toggles the participate checkbox', async () => {
    const { getByTestId, getAllByRole } = renderWithProvider(
      <OnboardingMetametrics />,
      store,
    );

    const participateCheckboxContainer = getByTestId(
      'metametrics-checkbox',
    ) as HTMLElement;
    const checkbox = getAllByRole('checkbox')[0];

    expect(checkbox).toBeChecked();

    await keyDownElement(participateCheckboxContainer, ' ');
    await waitFor(() => {
      expect(checkbox).not.toBeChecked();
    });

    await keyDownElement(participateCheckboxContainer, ' ');
    await waitFor(() => {
      expect(checkbox).toBeChecked();
    });
  });

  it('pressing Enter on the participate checkbox container toggles the participate checkbox', async () => {
    const { getByTestId, getAllByRole } = renderWithProvider(
      <OnboardingMetametrics />,
      store,
    );

    const participateCheckboxContainer = getByTestId(
      'metametrics-checkbox',
    ) as HTMLElement;
    const checkbox = getAllByRole('checkbox')[0];

    expect(checkbox).toBeChecked();

    await keyDownElement(participateCheckboxContainer, 'Enter');
    await waitFor(() => {
      expect(checkbox).not.toBeChecked();
    });
  });

  it('calls stopPropagation on the participate checkbox label click', () => {
    const { getByTestId } = renderWithProvider(
      <OnboardingMetametrics />,
      store,
    );

    const container = getByTestId('metametrics-checkbox');
    const label = container.querySelector('label') as HTMLElement;
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    jest.spyOn(event, 'stopPropagation');

    label.dispatchEvent(event);

    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it('calls stopPropagation on the participate checkbox input click', () => {
    const { getAllByRole } = renderWithProvider(
      <OnboardingMetametrics />,
      store,
    );

    const checkbox = getAllByRole('checkbox')[0];
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    jest.spyOn(event, 'stopPropagation');

    checkbox.dispatchEvent(event);

    expect(event.stopPropagation).toHaveBeenCalled();
  });
});
