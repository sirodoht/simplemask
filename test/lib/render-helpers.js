import React, { useState } from 'react';
import { act, render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { noop } from 'lodash';

import { setupInitialStore, connectToBackground } from '../../ui';
import Root from '../../ui/pages';
import { createUIMessenger } from '../../ui/messengers/ui-messenger';

export function renderControlledInput(InputComponent, props) {
  const ControlledWrapper = () => {
    const [value, setValue] = useState('');
    return (
      <InputComponent
        value={value}
        onChange={(e) => setValue(e.target.value)}
        {...props}
      />
    );
  };
  return { user: userEvent.setup(), ...render(<ControlledWrapper />) };
}

// userEvent setup function as per testing-library docs
// https://testing-library.com/docs/user-event/intr
export function renderWithUserEvent(jsx) {
  return {
    user: userEvent.setup(),
    ...render(jsx),
  };
}

/**
 * Helper function to render the UI application for integration tests.
 * It uses the Root component and sets up the store with the provided preloaded state.
 *
 * @param {*} extendedRenderOptions
 * @param {*} extendedRenderOptions.preloadedState - The initial state used to initialised the redux store. For integration tests we rely on a real store instance following the redux recommendations - https://redux.js.org/usage/writing-tests#guiding-principles
 * @param {*} extendedRenderOptions.backgroundConnection - The background connection rpc method. When writing integration tests, we can pass a mock background connection to simulate the background connection methods.
 * @param {*} extendedRenderOptions.activeTab - The active tab object.
 * @returns The rendered result from testing library.
 */
export async function integrationTestRender(extendedRenderOptions) {
  const {
    preloadedState = {},
    backgroundConnection,
    activeTab = {
      id: 113,
      title: 'E2E Test Dapp',
      origin: 'https://metamask.github.io',
      protocol: 'https:',
      url: 'https://metamask.github.io/test-dapp/',
    },
    ...renderOptions
  } = extendedRenderOptions;

  // Test background mocks typically only stub `onNotification`, but mounting
  // the UI subscribes to messenger events through the real
  // `subscribeToMessengerEvent`, which needs these RPC methods to exist.
  connectToBackground(
    {
      messengerSubscribe: () => Promise.resolve(),
      messengerUnsubscribe: () => Promise.resolve(),
      ...backgroundConnection,
    },
    noop,
  );

  const store = await setupInitialStore(preloadedState, activeTab);

  let result;
  // Wrap render + microtask flush so async setState from mount effects
  // (e.g. useAsyncResult / useUserSubscriptions) stays inside act.
  await act(async () => {
    result = render(<Root store={store} uiMessenger={createUIMessenger()} />, {
      // Prefer the legacy root for integration tests. RTL v14 defaults to
      // createRoot (concurrent), which interacts poorly with existing
      // act()/waitFor patterns and floods act-environment console warnings.
      legacyRoot: true,
      ...renderOptions,
    });
    await Promise.resolve();
    await Promise.resolve();
  });

  return result;
}
