import React from 'react';
import { EthAccountType, EthMethod } from '@metamask/keyring-api';
import { screen } from '@testing-library/react';
import { renderWithProvider } from '../../../../test/lib/render-helpers-navigate';
import configureStore from '../../../store/store';
import mockState from '../../../../test/data/mock-state.json';
import CoinButtons from './coin-buttons';

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

jest.mock('../../../hooks/useMultichainSelector', () => ({
  useMultichainSelector: jest.fn((selector) => {
    if (selector.name === 'getMultichainNetwork') {
      // CHAIN_IDS.MAINNET = '0x1'
      return { isEvmNetwork: true, chainId: '0x1' };
    }
    return 'ETH';
  }),
}));

jest.mock('../../../selectors/multichain', () => ({
  getMultichainNativeCurrency: jest.fn(),
  getMultichainNetwork: jest.fn(),
}));

jest.mock(
  '../../../../shared/lib/multichain-accounts/remote-feature-flag',
  () => ({
    ...jest.requireActual(
      '../../../../shared/lib/multichain-accounts/remote-feature-flag',
    ),
    isMultichainAccountsFeatureEnabled: () => false,
  }),
);

jest.mock('../../../store/actions', () => ({
  setActiveNetworkWithError: jest.fn(),
  tokenBalancesStartPolling: jest.fn().mockResolvedValue('pollingToken'),
  tokenBalancesStopPollingByPollingToken: jest.fn(),
}));

const mockAccount = {
  address: '0x0000000000000000000000000000000000000001',
  id: 'mock-account-id',
  metadata: { name: 'Test Account', keyring: { type: 'HD Key Tree' } },
  options: {},
  methods: Object.values(EthMethod),
  type: EthAccountType.Eoa,
};

describe('CoinButtons', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderAssetPageCoinButtons = (
    chainId: string,
    props: Partial<React.ComponentProps<typeof CoinButtons>> = {},
  ) =>
    renderWithProvider(
      <CoinButtons
        account={mockAccount as Parameters<typeof CoinButtons>[0]['account']}
        chainId={chainId as Parameters<typeof CoinButtons>[0]['chainId']}
        trackingLocation="asset-page"
        isSigningEnabled
        {...props}
      />,
      configureStore(mockState),
      '/',
    );

  it('keeps Send for zero balance when the standard row is rendered', () => {
    renderAssetPageCoinButtons('0x1', { hasBalance: false });

    expect(screen.getByTestId('coin-overview-send')).toBeInTheDocument();
    expect(screen.queryByTestId('coin-overview-buy')).not.toBeInTheDocument();
    expect(screen.queryByTestId('coin-overview-swap')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('coin-overview-receive'),
    ).not.toBeInTheDocument();
  });
});
