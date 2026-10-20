import React from 'react';
import { render } from '@testing-library/react';
import { useSelector } from 'react-redux';
import { useMultichainSelector } from '../../../hooks/useMultichainSelector';
import { isEvmChainId } from '../../../../shared/lib/asset-utils';
import { getConversionRatesForNativeAsset } from '../../../../shared/lib/asset-conversion-rates';
import { AssetType } from '../../../../shared/constants/transaction';
import { Asset } from '../types/asset';

import { englishText as messages } from '../../../../shared/lib/text';
import { AssetMarketDetails } from './asset-market-details';

// Wrapper to provide i18n context
const renderComponent = (component: React.ReactElement) => {
  return render(<>{component}</>);
};

// Mock all the hooks and utilities
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

jest.mock('../../../hooks/useMultichainSelector', () => ({
  useMultichainSelector: jest.fn(),
}));

jest.mock('../util', () => ({
  getPricePrecision: jest.fn(() => 2),
}));

jest.mock('../../../helpers/utils/confirm-tx.util', () => ({
  formatCurrency: jest.fn((value, _currency, _precision) => `$${value}`),
}));

jest.mock('../../../../shared/lib/asset-utils', () => ({
  isEvmChainId: jest.fn(),
}));

jest.mock('../../../../shared/lib/asset-conversion-rates', () => ({
  getConversionRatesForNativeAsset: jest.fn(),
}));

const mockUseSelector = useSelector as jest.MockedFunction<typeof useSelector>;
const mockUseMultichainSelector = useMultichainSelector as jest.MockedFunction<
  typeof useMultichainSelector
>;
const mockIsEvmChainId = isEvmChainId as jest.MockedFunction<
  typeof isEvmChainId
>;
const mockGetConversionRatesForNativeAsset =
  getConversionRatesForNativeAsset as jest.MockedFunction<
    typeof getConversionRatesForNativeAsset
  >;

describe('AssetMarketDetails', () => {
  const mockTokenExchangeRate = 1000; // 1 token = $1000 USD
  const mockCirculatingSupply = 15000000000; // 15B tokens
  const mockMarketCap = 50000; // $50k
  const mockTotalVolume = 1000; // $1k

  const evmAsset: Asset = {
    type: AssetType.token,
    chainId: '0x1',
    address: '0xTokenAddress',
    symbol: 'TEST',
    decimals: 18,
    image: '',
    balance: {
      value: '1000',
      display: '1000',
      fiat: '$1000',
    },
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup default mock implementations
    mockIsEvmChainId.mockReturnValue(true);
    mockGetConversionRatesForNativeAsset.mockReturnValue({
      rate: '1',
      conversionTime: Date.now(),
      marketData: undefined,
    });

    // Mock useSelector calls (in order they appear in the component)
    mockUseSelector
      .mockReturnValueOnce('usd') // getCurrentCurrency
      .mockReturnValueOnce({
        // getMarketData
        '0x1': {
          '0xTokenAddress': {
            marketCap: mockMarketCap,
            totalVolume: mockTotalVolume,
            circulatingSupply: mockCirculatingSupply,
            allTimeHigh: 100,
            allTimeLow: 10,
            dilutedMarketCap: 80000,
          },
        },
      })
      .mockReturnValueOnce({
        // getCurrencyRates
        ETH: {
          conversionRate: mockTokenExchangeRate,
        },
      })
      .mockReturnValueOnce({}); // getAssetsRates

    // Mock useMultichainSelector calls (in order they appear in the component)
    mockUseMultichainSelector
      .mockReturnValueOnce(1) // getMultichainConversionRate
      .mockReturnValueOnce('ETH'); // getMultichainNativeCurrency
  });

  it('should render market details when valid market data is available', () => {
    const { getByText } = renderComponent(
      <AssetMarketDetails asset={evmAsset} address="0xTokenAddress" />,
    );

    expect(getByText(messages.marketDetails)).toBeInTheDocument();
    expect(getByText(messages.marketCap)).toBeInTheDocument();
    expect(getByText(messages.totalVolume)).toBeInTheDocument();
    expect(getByText(messages.circulatingSupply)).toBeInTheDocument();
    expect(getByText(messages.allTimeHigh)).toBeInTheDocument();
    expect(getByText(messages.allTimeLow)).toBeInTheDocument();
    expect(getByText(messages.volumeToMarketCap)).toBeInTheDocument();
    expect(getByText(messages.fullyDiluted)).toBeInTheDocument();
  });

  it('should correctly multiply market cap by exchange rate for EVM tokens', () => {
    const { container } = renderComponent(
      <AssetMarketDetails asset={evmAsset} address="0xTokenAddress" />,
    );

    // Market cap should be multiplied by exchange rate: 50,000 * 1,000 = 50,000,000
    // And formatted as compact: $50.00M
    const marketCapElement = container.querySelector(
      '[data-testid="asset-market-cap"]',
    );
    expect(marketCapElement).toHaveTextContent('$50.00M');
  });

  it('should NOT multiply circulating supply by exchange rate for EVM tokens', () => {
    const { getByText } = renderComponent(
      <AssetMarketDetails asset={evmAsset} address="0xTokenAddress" />,
    );

    // Circulating supply should NOT be multiplied by exchange rate
    // It should remain as the original token count: 15,000,000,000
    // And formatted as compact: 15.00B
    const circulatingSupplyRow = getByText(
      messages.circulatingSupply,
    ).parentElement;
    expect(circulatingSupplyRow).toHaveTextContent('15.00B');

    // Verify it's NOT the multiplied value (15B * 1000 = 15T)
    expect(circulatingSupplyRow).not.toHaveTextContent('15000.00B');
  });

  it('derives volume to market cap from volume and market cap', () => {
    const { getByTestId } = renderComponent(
      <AssetMarketDetails asset={evmAsset} address="0xTokenAddress" />,
    );

    // 1,000 / 50,000 = 2%, unchanged by the exchange rate
    expect(getByTestId('asset-volume-to-market-cap')).toHaveTextContent(
      '2.00%',
    );
  });

  it('multiplies fully diluted value by the exchange rate for EVM tokens', () => {
    const { getByTestId } = renderComponent(
      <AssetMarketDetails asset={evmAsset} address="0xTokenAddress" />,
    );

    // 80,000 * 1,000 = 80,000,000 -> $80.00M
    expect(getByTestId('asset-fully-diluted')).toHaveTextContent('$80.00M');
  });

  it('should multiply allTimeHigh and allTimeLow by exchange rate for EVM tokens', () => {
    const { getByText } = renderComponent(
      <AssetMarketDetails asset={evmAsset} address="0xTokenAddress" />,
    );

    // allTimeHigh: 100 * 1000 = 100,000 -> $100000
    const allTimeHighRow = getByText(messages.allTimeHigh).parentElement;
    expect(allTimeHighRow).toHaveTextContent('$100000');

    // allTimeLow: 10 * 1000 = 10,000 -> $10000
    const allTimeLowRow = getByText(messages.allTimeLow).parentElement;
    expect(allTimeLowRow).toHaveTextContent('$10000');
  });

  describe('when the wallet has no cached market data for the asset', () => {
    // Values as the Price API returns them: already in the selected currency.
    const fallbackMarketData = {
      marketCap: 50000000,
      totalVolume: 1000000,
      circulatingSupply: mockCirculatingSupply,
      allTimeHigh: 100000,
      allTimeLow: 10000,
      dilutedMarketCap: 80000000,
    };

    beforeEach(() => {
      // Re-queue only the redux selectors so that getMarketData is empty,
      // leaving the formatter mocks from the module factory intact.
      mockUseSelector.mockReset();
      mockUseSelector
        .mockReturnValueOnce('usd') // getCurrentCurrency
        .mockReturnValueOnce({}) // getMarketData
        .mockReturnValueOnce({ ETH: { conversionRate: mockTokenExchangeRate } }) // getCurrencyRates
        .mockReturnValueOnce({}); // getAssetsRates
    });

    it('renders market details from the fallback prop', () => {
      const { getByText, getByTestId } = renderComponent(
        <AssetMarketDetails
          asset={evmAsset}
          address="0xTokenAddress"
          fallbackMarketData={fallbackMarketData}
        />,
      );

      expect(getByText(messages.marketDetails)).toBeInTheDocument();
      expect(getByTestId('asset-market-cap')).toHaveTextContent('$50.00M');
      expect(getByTestId('asset-fully-diluted')).toHaveTextContent('$80.00M');
      expect(getByTestId('asset-volume-to-market-cap')).toHaveTextContent(
        '2.00%',
      );
    });

    it('does not apply the native exchange rate to fallback values', () => {
      const { getByText, getByTestId } = renderComponent(
        <AssetMarketDetails
          asset={evmAsset}
          address="0xTokenAddress"
          fallbackMarketData={fallbackMarketData}
        />,
      );

      // Already in fiat, so the 1,000x rate must not be applied again.
      expect(getByTestId('asset-market-cap')).not.toHaveTextContent('$50.00B');

      // Anchored, because a substring match would also accept $100000000.
      const allTimeHighRow = getByText(messages.allTimeHigh).parentElement;
      expect(allTimeHighRow).toHaveTextContent(/\$100000$/u);

      const allTimeLowRow = getByText(messages.allTimeLow).parentElement;
      expect(allTimeLowRow).toHaveTextContent(/\$10000$/u);
    });

    it('renders nothing when there is no fallback data either', () => {
      const { container } = renderComponent(
        <AssetMarketDetails asset={evmAsset} address="0xTokenAddress" />,
      );

      expect(container.firstChild).toBeNull();
    });
  });

  it('prefers cached market data over the fallback prop', () => {
    const { getByTestId } = renderComponent(
      <AssetMarketDetails
        asset={evmAsset}
        address="0xTokenAddress"
        fallbackMarketData={{ marketCap: 999, totalVolume: 1 }}
      />,
    );

    // The cached 50,000 * 1,000 rate, not the fallback's 999.
    expect(getByTestId('asset-market-cap')).toHaveTextContent('$50.00M');
  });

  it('should not render when conversionRate is 0', () => {
    // Create a new component instance with fresh mocks
    jest.resetAllMocks();

    // Set up mocks specifically for this test
    mockIsEvmChainId.mockReturnValue(true);
    mockGetConversionRatesForNativeAsset.mockReturnValue({
      rate: '1',
      conversionTime: Date.now(),
      marketData: undefined,
    });

    // Return 0 for conversionRate - this should prevent rendering
    mockUseMultichainSelector.mockReturnValue(0); // getMultichainConversionRate = 0

    // Mock useSelector for the remaining calls
    mockUseSelector
      .mockReturnValue('usd') // getCurrentCurrency
      .mockReturnValue({}) // getMarketData
      .mockReturnValue({}) // getCurrencyRates
      .mockReturnValue({}); // getAssetsRates

    const { container } = renderComponent(
      <AssetMarketDetails asset={evmAsset} address="0xTokenAddress" />,
    );

    expect(container.firstChild).toBeNull();
  });
});
