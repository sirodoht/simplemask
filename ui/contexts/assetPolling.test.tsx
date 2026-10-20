import React, { useContext, useEffect } from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import useStaticTokensPollingHook from '../hooks/useStaticTokensPolling';
import { useArcDefaultTokens } from '../hooks/useArcDefaultTokens';
import {
  AssetPollingContext,
  AssetPollingContextValue,
  AssetPollingProvider,
} from './assetPolling';

jest.mock('../hooks/useStaticTokensPolling');
jest.mock('../hooks/useArcDefaultTokens');

const mockUseStaticTokensPollingHook = jest.mocked(useStaticTokensPollingHook);
const mockUseArcDefaultTokens = jest.mocked(useArcDefaultTokens);

const renderProvider = () => {
  return render(
    <AssetPollingProvider>
      <div data-testid="child">child</div>
    </AssetPollingProvider>,
  );
};

describe('AssetPollingProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseStaticTokensPollingHook.mockReturnValue({});
    mockUseArcDefaultTokens.mockImplementation(() => undefined);
  });

  it('always renders children', () => {
    renderProvider();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('calls AssetsControllerPolling hooks', () => {
    renderProvider();
    expect(mockUseStaticTokensPollingHook).toHaveBeenCalledTimes(1);
    expect(mockUseArcDefaultTokens).toHaveBeenCalledTimes(1);
  });

  describe('context value memoization', () => {
    it('provides a stable context value object across re-renders', () => {
      const capturedValues: AssetPollingContextValue[] = [];

      const TestConsumer = () => {
        const ctx = useContext(AssetPollingContext);
        useEffect(() => {
          capturedValues.push(ctx);
        });
        return null;
      };

      const { rerender } = render(
        <AssetPollingProvider>
          <TestConsumer />
        </AssetPollingProvider>,
      );

      rerender(
        <AssetPollingProvider>
          <TestConsumer />
        </AssetPollingProvider>,
      );

      expect(capturedValues.length).toBeGreaterThanOrEqual(2);
      expect(capturedValues[0]).toBe(capturedValues[1]);
    });
  });
});
