import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { InternalAccount } from '@metamask/keyring-internal-api';
import { renderWithProvider } from '../../../../test/lib/render-helpers-navigate';
import { enLocale as messages } from '../../../../test/lib/i18n-helpers';
import mockState from '../../../../test/data/mock-state.json';
import { ThemeType } from '../../../../shared/constants/preferences';
import { selectAccountGroupBalanceForEmptyState } from '../../../selectors/assets';
import {
  TransactionActivityEmptyState,
  type TransactionActivityEmptyStateProps,
} from './transaction-activity-empty-state';

jest.mock('../../../selectors/assets', () => ({
  ...jest.requireActual('../../../selectors/assets'),
  selectAccountGroupBalanceForEmptyState: jest.fn(),
}));

const mockSelectAccountGroupBalanceForEmptyState =
  selectAccountGroupBalanceForEmptyState as jest.MockedFunction<
    typeof selectAccountGroupBalanceForEmptyState
  >;

const createAccount = (
  overrides: Partial<InternalAccount> = {},
): InternalAccount => ({
  id: 'cf8dace4-9439-4bd4-b3a8-88c821c8fcb3',
  address: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
  type: 'eip155:eoa',
  options: {},
  scopes: ['eip155:1'],
  methods: [
    'personal_sign',
    'eth_sign',
    'eth_signTransaction',
    'eth_signTypedData_v1',
    'eth_signTypedData_v3',
    'eth_signTypedData_v4',
  ],
  metadata: {
    name: 'Account 1',
    keyring: { type: 'HD Key Tree' },
    importTime: Date.now(),
  },
  ...overrides,
});

const mockAccount = createAccount();

const createStateOverrides = (
  metamaskOverrides: Record<string, unknown> = {},
) => ({
  metamask: metamaskOverrides,
});

const createStateWithoutExternalServices = (): ReturnType<
  typeof createStateOverrides
> =>
  createStateOverrides({
    useExternalServices: false,
  });

const createTestnetState = (): ReturnType<typeof createStateOverrides> =>
  createStateOverrides({
    useExternalServices: true,
    selectedNetworkClientId: 'sepolia',
    networkConfigurationsByChainId: {
      ...mockState.metamask.networkConfigurationsByChainId,
      '0xaa36a7': {
        chainId: '0xaa36a7',
        name: 'Sepolia',
        nativeCurrency: 'ETH',
        defaultRpcEndpointIndex: 0,
        rpcEndpoints: [
          {
            type: 'infura',
            url: 'https://sepolia.infura.io/v3/test',
            networkClientId: 'sepolia',
          },
        ],
        blockExplorerUrls: [],
      },
    },
  });

const createValidSwapState = (): ReturnType<typeof createStateOverrides> =>
  createStateOverrides({
    useExternalServices: true,
    selectedNetworkClientId: 'testNetworkConfigurationId', // This points to mainnet in mock state
  });

const expectSwapButtonState = (enabled: boolean): HTMLElement => {
  const swapButton = screen.getByRole('button', {
    name: messages.swapTokens.message,
  });
  if (enabled) {
    expect(swapButton).not.toBeDisabled();
  } else {
    expect(swapButton).toBeDisabled();
  }
  return swapButton;
};

describe('TransactionActivityEmptyState', () => {
  const middleware = [thunk];

  beforeEach(() => {
    jest.clearAllMocks();
    mockSelectAccountGroupBalanceForEmptyState.mockReturnValue(true);
  });

  const renderComponent = (
    props: Partial<TransactionActivityEmptyStateProps> = {},
    stateOverrides: Record<string, unknown> = {},
    account = mockAccount,
  ) => {
    const state = {
      ...mockState,
      ...stateOverrides,
      metamask: {
        ...mockState.metamask,
        ...(('metamask' in stateOverrides
          ? stateOverrides.metamask
          : {}) as Record<string, unknown>),
        internalAccounts: {
          ...mockState.metamask.internalAccounts,
          selectedAccount: account.id,
          accounts: {
            ...mockState.metamask.internalAccounts.accounts,
            [account.id]: account,
          },
        },
      },
    };

    const store = configureMockStore(middleware)(state);

    return renderWithProvider(
      <TransactionActivityEmptyState {...props} />,
      store,
    );
  };

  it('renders correctly', () => {
    renderComponent();
    expect(screen.getByTestId('activity-tab-empty-state')).toBeInTheDocument();
  });

  it('renders swap description when the account has tokens', () => {
    mockSelectAccountGroupBalanceForEmptyState.mockReturnValue(true);
    renderComponent();
    expect(
      screen.getByText(messages.activityEmptyDescription.message),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(messages.activityEmptyNoFundsDescription.message),
    ).not.toBeInTheDocument();
  });

  it('renders add funds description when the account has no tokens', () => {
    mockSelectAccountGroupBalanceForEmptyState.mockReturnValue(false);
    renderComponent();
    expect(
      screen.getByText(messages.activityEmptyNoFundsDescription.message),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(messages.activityEmptyDescription.message),
    ).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { getByTestId } = renderComponent({ className: 'custom-class' });
    expect(getByTestId('activity-tab-empty-state')).toHaveClass('custom-class');
  });

  it('renders light theme image by default', () => {
    renderComponent();
    const image = screen.getByAltText('Activity');
    expect(image).toHaveAttribute(
      'src',
      './images/empty-state-activity-light.png',
    );
  });

  it('renders dark theme image when dark theme is selected', () => {
    renderComponent(
      {}, // no prop changes
      {
        metamask: { ...mockState.metamask, theme: ThemeType.dark },
      },
    );
    const image = screen.getByAltText('Activity');
    expect(image).toHaveAttribute(
      'src',
      './images/empty-state-activity-dark.png',
    );
  });

  describe('Add funds button functionality', () => {
    beforeEach(() => {
      mockSelectAccountGroupBalanceForEmptyState.mockReturnValue(false);
    });

    it('renders add funds button when the account has no tokens', () => {
      renderComponent();
      expect(
        screen.getByRole('button', { name: messages.addFunds.message }),
      ).toBeInTheDocument();
    });

    it('opens funding modal when add funds button is clicked', () => {
      renderComponent();
      fireEvent.click(
        screen.getByRole('button', { name: messages.addFunds.message }),
      );

      expect(
        screen.getByTestId('activity-tab-empty-state-funding-modal'),
      ).toBeInTheDocument();
    });
  });
});
