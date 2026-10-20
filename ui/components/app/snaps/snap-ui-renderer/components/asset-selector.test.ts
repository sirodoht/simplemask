import { AssetSelector, Box, Field } from '@metamask/snaps-sdk/jsx';
import { fireEvent, waitFor } from '@testing-library/react';
import { renderInterface } from '../test-utils';

describe('SnapUIAssetSelector', () => {
  const address = '0x1234567890123456789012345678901234567890';
  const accountId = '8c33fc18-6c52-44b1-b8fa-550b934a05ef';
  const mockState = {
    metamask: {
      internalAccounts: {
        accounts: {
          [accountId]: {
            id: accountId,
            address,
            type: 'eip155:eoa' as const,
            options: {},
            methods: ['eth_sign'],
            scopes: ['eip155:0' as const],
            metadata: {
              name: 'EVM Snap Account',
              keyring: { type: 'Snap Keyring' },
              importTime: 0,
            },
          },
        },
      },
      accountIdByAddress: { [address]: accountId },
      assetsBalance: {
        [accountId]: {
          'eip155:1/slip44:60': { amount: '1' },
          'eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': {
            amount: '2',
          },
        },
      },
      assetsInfo: {
        'eip155:1/slip44:60': {
          type: 'native' as const,
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        'eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': {
          type: 'erc20' as const,
          name: 'USDC',
          symbol: 'USDC',
          decimals: 6,
        },
      },
      assetsPrice: {
        'eip155:1/slip44:60': {
          assetPriceType: 'fungible' as const,
          price: 2000,
          usdPrice: 2000,
          lastUpdated: 0,
        },
        'eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': {
          assetPriceType: 'fungible' as const,
          price: 1,
          usdPrice: 1,
          lastUpdated: 0,
        },
      },
    },
  };

  const mockInterfaceState = {
    'asset-selector': {
      asset: 'eip155:1/slip44:60',
      name: 'Ethereum',
      symbol: 'ETH',
    },
  };

  it('renders an asset selector', () => {
    const { container } = renderInterface(
      Box({
        children: AssetSelector({
          name: 'asset-selector',
          addresses: ['eip155:1:0x1234567890123456789012345678901234567890'],
        }),
      }),
      {
        state: mockInterfaceState,
        metamaskState: mockState,
      },
    );

    expect(
      container.getElementsByClassName('snap-ui-renderer__asset-selector'),
    ).toHaveLength(1);

    expect(
      container.getElementsByClassName(
        'snap-ui-renderer__asset-selector-option',
      ),
    ).toHaveLength(1);

    expect(container).toMatchSnapshot();
  });

  it('can be disabled', () => {
    const { container } = renderInterface(
      Box({
        children: AssetSelector({
          name: 'asset-selector',
          disabled: true,
          addresses: ['eip155:1:0x1234567890123456789012345678901234567890'],
        }),
      }),
      {
        state: mockInterfaceState,
        metamaskState: mockState,
      },
    );

    const assetSelector = container.getElementsByClassName(
      'snap-ui-renderer__asset-selector',
    )[0];

    expect(assetSelector).toBeDisabled();
  });

  it('can switch assets', async () => {
    const { container, getAllByTestId, getByText } = renderInterface(
      Box({
        children: AssetSelector({
          name: 'asset-selector',
          addresses: ['eip155:1:0x1234567890123456789012345678901234567890'],
        }),
      }),
      {
        state: mockInterfaceState,
        metamaskState: mockState,
      },
    );

    const assetSelector = container.getElementsByClassName(
      'snap-ui-renderer__asset-selector',
    )[0];

    fireEvent.click(assetSelector);

    await waitFor(() =>
      expect(getAllByTestId('snap-ui-renderer__selector-item')).toHaveLength(2),
    );

    const assetOptions = getAllByTestId('snap-ui-renderer__selector-item');

    fireEvent.click(assetOptions[1]);

    expect(getByText('USDC')).toBeInTheDocument();
  });

  it('renders inside a field', () => {
    const { container, getByText } = renderInterface(
      Box({
        children: Field({
          label: 'Asset Selector',
          children: AssetSelector({
            name: 'asset-selector',
            addresses: ['eip155:1:0x1234567890123456789012345678901234567890'],
          }),
        }),
      }),
      {
        state: mockInterfaceState,
        metamaskState: mockState,
      },
    );

    expect(
      container.getElementsByClassName('snap-ui-renderer__asset-selector'),
    ).toHaveLength(1);

    expect(getByText('Asset Selector')).toBeInTheDocument();

    expect(container).toMatchSnapshot();
  });

  it('can show an error', () => {
    const { container, getByText } = renderInterface(
      Box({
        children: Field({
          label: 'Asset Selector',
          children: AssetSelector({
            name: 'asset-selector',
            addresses: ['eip155:1:0x1234567890123456789012345678901234567890'],
          }),
          error: 'This is an error',
        }),
      }),
      {
        state: mockInterfaceState,
        metamaskState: mockState,
      },
    );

    expect(
      container.getElementsByClassName('snap-ui-renderer__asset-selector'),
    ).toHaveLength(1);

    expect(getByText('This is an error')).toBeInTheDocument();
  });
});
