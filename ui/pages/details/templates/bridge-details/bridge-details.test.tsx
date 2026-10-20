import React from 'react';
import { render } from '@testing-library/react';
import type { ActivityListItem } from '../../../../../shared/lib/activity/types';
import { BridgeDetails } from './bridge-details';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  // The component only reads mocked selectors, so state is irrelevant here.
  useSelector: (selector: (state: unknown) => unknown) => selector({}),
}));

jest.mock('../../../../helpers/utils/text', () => ({
  getText: (key: string) => key,
}));

jest.mock('../../../../hooks/useFormatters', () => ({
  useFormatters: () => ({ formatDateTime: () => 'date' }),
}));

jest.mock('../../../../selectors/multichain-accounts/account-tree', () => ({
  getAccountGroupsByAddress: jest.fn(() => []),
}));

jest.mock('../../../../selectors/multichain-accounts/utils', () => ({
  getSanitizedChainId: jest.fn((chainId: string) => chainId),
}));

jest.mock('./bridge-network-row', () => ({
  BridgeNetworkRow: ({
    fromChainId,
    toChainId,
  }: {
    fromChainId: string;
    toChainId: string;
  }) => (
    <div
      data-testid="bridge-network-row"
      data-from={fromChainId}
      data-to={toChainId}
    />
  ),
}));

jest.mock('../../components/shared', () => ({
  Footer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="footer">{children}</div>
  ),
  Section: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="section">{children}</div>
  ),
  Row: ({ value }: { value: React.ReactNode }) => (
    <div data-testid="row">{value}</div>
  ),
}));

jest.mock('../../components/token-row', () => ({
  TokenRow: ({ token }: { token?: { symbol?: string; assetId?: string } }) => (
    <div
      data-testid="token-row"
      data-symbol={token?.symbol ?? ''}
      data-asset-id={token?.assetId ?? ''}
    />
  ),
}));

jest.mock('../../components/amounts-section', () => ({
  FeesRows: () => <div data-testid="fees-rows" />,
  TotalAmountRow: ({ token }: { token?: { symbol?: string } }) => (
    <div data-testid="total-amount-row" data-symbol={token?.symbol ?? ''} />
  ),
}));

jest.mock('../../components/bridge-explorer-buttons', () => ({
  BridgeExplorerButtons: ({
    sourceChainId,
    sourceTxHash,
    destChainId,
    destTxHash,
  }: {
    sourceChainId: string;
    sourceTxHash?: string;
    destChainId?: string;
    destTxHash?: string;
  }) => (
    <div
      data-testid="bridge-explorer-buttons"
      data-source-chain-id={sourceChainId}
      data-source-tx-hash={sourceTxHash ?? ''}
      data-dest-chain-id={destChainId ?? ''}
      data-dest-tx-hash={destTxHash ?? ''}
    />
  ),
}));

jest.mock('../../../../components/app/transaction/network-name', () => ({
  NetworkName: ({ chainId }: { chainId: string }) => (
    <div data-testid="network-name" data-chain-id={chainId} />
  ),
}));

jest.mock('../../../../components/app/transaction/transaction-status', () => ({
  TransactionStatus: ({ status }: { status: string }) => (
    <div data-testid="transaction-status" data-status={status} />
  ),
}));

jest.mock('../../../../components/app/transaction/account-name', () => ({
  AccountName: ({ address }: { address?: string }) => (
    <div data-testid="account-name" data-address={address ?? ''} />
  ),
}));

jest.mock('../../../../components/app/transaction/transaction-id', () => ({
  TransactionId: ({ value }: { value: string }) => (
    <div data-testid="transaction-id" data-value={value} />
  ),
}));

type BridgeItem = Extract<
  ActivityListItem,
  {
    type:
      | 'swap'
      | 'bridge'
      | 'convert'
      | 'lendingDeposit'
      | 'lendingWithdrawal'
      | 'wrap'
      | 'unwrap';
  }
>;

const SOURCE_TX_HASH = '0xsourcehash';
const DEST_TX_HASH = '0xdesthash';

const sourceTokenEth = {
  symbol: 'ETH',
  assetId: 'eip155:1/slip44:60',
  direction: 'out' as const,
};

const destinationTokenDai = {
  symbol: 'DAI',
  assetId: 'eip155:137/erc20:0xdai',
  direction: 'in' as const,
};

const buildItem = (data: BridgeItem['data']): BridgeItem =>
  ({
    type: 'bridge',
    chainId: 'eip155:1',
    status: 'success',
    timestamp: 1716367781000,
    hash: SOURCE_TX_HASH,
    data,
  }) as BridgeItem;

describe('BridgeDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('prefers destination data already present on the item over bridge history', () => {
    const { getByTestId, getAllByTestId } = render(
      <BridgeDetails
        item={buildItem({
          from: '0xfrom',
          sourceToken: sourceTokenEth,
          destinationToken: {
            symbol: 'USDC',
            assetId: 'eip155:10/erc20:0xusdc',
            direction: 'in',
          },
        })}
      />,
    );

    const symbols = getAllByTestId('token-row').map((row) =>
      row.getAttribute('data-symbol'),
    );
    expect(symbols).toContain('USDC');
    expect(symbols).not.toContain('DAI');

    expect(getByTestId('bridge-explorer-buttons')).toHaveAttribute(
      'data-dest-chain-id',
      'eip155:10',
    );
  });

  it('shows the source status when bridge history is unavailable', () => {
    const { getByTestId } = render(
      <BridgeDetails
        item={buildItem({ from: '0xfrom', sourceToken: sourceTokenEth })}
      />,
    );

    expect(getByTestId('transaction-status')).toHaveAttribute(
      'data-status',
      'success',
    );
  });

  it('renders only the source explorer link when there is no destination data', () => {
    const { getByTestId, getAllByTestId, queryByTestId } = render(
      <BridgeDetails
        item={buildItem({ from: '0xfrom', sourceToken: sourceTokenEth })}
      />,
    );

    expect(getAllByTestId('token-row')).toHaveLength(1);

    const explorerButtons = getByTestId('bridge-explorer-buttons');
    expect(explorerButtons).toHaveAttribute('data-dest-chain-id', '');
    expect(explorerButtons).toHaveAttribute('data-dest-tx-hash', '');

    // Single-network fallback: no source→destination network row.
    expect(queryByTestId('bridge-network-row')).not.toBeInTheDocument();
    expect(getByTestId('network-name')).toHaveAttribute(
      'data-chain-id',
      'eip155:1',
    );
  });
});
