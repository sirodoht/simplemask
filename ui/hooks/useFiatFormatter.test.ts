import { renderHook } from '@testing-library/react';

import { getCurrentCurrency } from '../ducks/metamask/metamask';
import { useFiatFormatter } from './useFiatFormatter';

jest.mock('react-redux', () => ({
  useSelector: jest.fn((selector) => selector()),
}));

jest.mock('../ducks/metamask/metamask', () => ({
  getCurrentCurrency: jest.fn(),
}));

const mockGetCurrentCurrency = getCurrentCurrency as jest.Mock;

describe('useFiatFormatter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a function that formats fiat amount correctly', () => {
    mockGetCurrentCurrency.mockReturnValue('USD');

    const { result } = renderHook(() => useFiatFormatter());
    const formatFiat = result.current;

    expect(formatFiat(1000)).toBe('$1,000.00');
    expect(formatFiat(500.5)).toBe('$500.50');
    expect(formatFiat(0)).toBe('$0.00');
  });

  describe('shorten the fiat', () => {
    it('formats dollars with English separators', () => {
      mockGetCurrentCurrency.mockReturnValue('USD');

      const { result } = renderHook(() => useFiatFormatter());
      const formatFiat = result.current;

      expect(formatFiat(100000000000000000, { shorten: true })).toBe(
        '$100,000,000,...',
      );
    });

    it('when truncate limits are passed to the formatter', () => {
      mockGetCurrentCurrency.mockReturnValue('USD');
      const { result } = renderHook(() => useFiatFormatter());
      const formatFiat = result.current;
      expect(
        formatFiat(100000000000000000, {
          shorten: true,
          truncatedCharLimit: 20,
          truncatedStartChars: 17,
        }),
      ).toBe('$100,000,000,000,0...');
    });

    it('formats euros with English separators', () => {
      mockGetCurrentCurrency.mockReturnValue('EUR');

      const { result } = renderHook(() => useFiatFormatter());
      const formatFiat = result.current;

      expect(formatFiat(100000000000000000, { shorten: true })).toBe(
        '€100,000,000,...',
      );
    });

    it('handle unknown currencies by returning amount followed by currency code', () => {
      mockGetCurrentCurrency.mockReturnValue('storj');

      const { result } = renderHook(() => useFiatFormatter());
      const formatFiat = result.current;

      expect(formatFiat(100000, { shorten: true })).toBe('100,000 storj');
      expect(formatFiat(500.5, { shorten: true })).toBe('500.5 storj');
      expect(formatFiat(0, { shorten: true })).toBe('0 storj');
    });
  });

  it('uses the selected currency', () => {
    mockGetCurrentCurrency.mockReturnValue('EUR');

    renderHook(() => useFiatFormatter());

    expect(getCurrentCurrency).toHaveBeenCalledTimes(1);
  });

  it('uses overrideCurrency instead of Redux currency when provided', () => {
    mockGetCurrentCurrency.mockReturnValue('EUR');

    const { result } = renderHook(() =>
      useFiatFormatter({ overrideCurrency: 'usd' }),
    );
    const formatFiat = result.current;

    expect(formatFiat(1.23)).toBe('$1.23');
    expect(formatFiat(0)).toBe('$0.00');
  });

  it('should gracefully handle unknown currencies by returning amount followed by currency code', () => {
    mockGetCurrentCurrency.mockReturnValue('storj');

    const { result } = renderHook(() => useFiatFormatter());
    const formatFiat = result.current;

    // Testing the fallback formatting for an unknown currency
    expect(formatFiat(100000)).toBe('100,000 storj');
    expect(formatFiat(500.5)).toBe('500.5 storj');
    expect(formatFiat(0)).toBe('0 storj');
  });
});
