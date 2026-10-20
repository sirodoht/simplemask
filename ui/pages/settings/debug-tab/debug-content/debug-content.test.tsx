import React from 'react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { renderWithProvider } from '../../../../../test/lib/render-helpers-navigate';
import mockState from '../../../../../test/data/mock-state.json';
import DebugContent from '.';

const mockPerpsToggleTestnet = jest.fn().mockResolvedValue(undefined);
const mockRemoteFeatureFlags = { feature1: 'value1' };
/* @ts-expect-error: Avoids error from window property not existing */
window.metamaskFeatureFlags = {};

jest.mock('webextension-polyfill', () => ({
  runtime: {
    getManifest: jest.fn().mockReturnValue({ version: '1.0.0' }),
  },
  storage: {
    local: {
      get: jest.fn().mockResolvedValue({}),
      set: jest.fn().mockResolvedValue({}),
    },
    onChanged: { addListener: jest.fn(), removeListener: jest.fn() },
  },
}));

jest.mock('../../../../store/actions.ts', () => ({
  perpsToggleTestnet: () => mockPerpsToggleTestnet(),
}));

jest.mock('../../../../../shared/lib/selectors/remote-feature-flags', () => ({
  getRemoteFeatureFlags: jest.fn(() => mockRemoteFeatureFlags),
}));

describe('Debug tab', () => {
  const mockStore = configureMockStore([thunk])(mockState);

  it('renders remote feature flags', () => {
    const { getByTestId } = renderWithProvider(<DebugContent />, mockStore);
    expect(
      getByTestId('developer-options-remote-feature-flags').textContent,
    ).toEqual(JSON.stringify(mockRemoteFeatureFlags, null, 2));
  });
});
