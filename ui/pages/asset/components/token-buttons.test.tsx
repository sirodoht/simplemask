import React from 'react';
import configureMockStore from 'redux-mock-store';
import { screen } from '@testing-library/react';
import { renderWithProvider } from '../../../../test/lib/render-helpers-navigate';
import { CHAIN_IDS } from '../../../../shared/constants/network';
import { mockNetworkState } from '../../../../test/stub/networks';
import { AssetType } from '../../../../shared/constants/transaction';
import initializedMockState from '../../../../test/data/mock-state.json';
import { Asset } from '../types/asset';
import TokenButtons from './token-buttons';

jest.mock('../../../selectors/assets', () => ({
  ...jest.requireActual('../../../selectors/assets'),
  getAssetsBySelectedAccountGroup: jest.fn(() => ({})),
}));

const mockTrackEvent = jest.fn();
jest.mock('../../../hooks/useAnalytics', () => {
  const { createEventBuilder } = jest.requireActual(
    '../../../../shared/lib/analytics/create-event-builder',
  );
  return {
    useAnalytics: () => ({ trackEvent: mockTrackEvent, createEventBuilder }),
  };
});

const token = {
  type: AssetType.token,
  address: '0x6b175474e89094c44da98b954eedeac495271d0f',
  chainId: CHAIN_IDS.MAINNET,
  decimals: 18,
  symbol: 'DAI',
  image: '',
} as Asset & { type: AssetType.token };

const store = configureMockStore()({
  metamask: {
    // Full mock state: the component reads the selected account for the
    // receive flow, which the minimal network-only state does not include.
    ...initializedMockState.metamask,
    ...mockNetworkState({ chainId: CHAIN_IDS.MAINNET }),
    useExternalServices: true,
  },
});

describe('TokenButtons wallet actions', () => {
  beforeEach(() => jest.clearAllMocks());

  it('offers Send without an integrated Buy action', () => {
    renderWithProvider(
      <TokenButtons
        token={{ ...token, balance: { value: '1', display: '1', fiat: '1' } }}
      />,
      store,
    );

    expect(screen.queryByTestId('token-overview-buy')).not.toBeInTheDocument();
    expect(screen.queryByTestId('token-overview-swap')).not.toBeInTheDocument();
    expect(screen.getByTestId('eth-overview-send')).toBeInTheDocument();
  });
});
