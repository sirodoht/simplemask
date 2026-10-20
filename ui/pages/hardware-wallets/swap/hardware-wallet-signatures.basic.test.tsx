import React from 'react';
import { it as jestIt } from '@jest/globals';
import { act, fireEvent, waitFor } from '@testing-library/react';
import {
  TransactionType,
  type TransactionMeta,
} from '@metamask/transaction-controller';
import { ErrorCode } from '@metamask/hw-wallet-sdk';
import configureStore from '../../../store/store';
import { renderWithProvider } from '../../../../test/lib/render-helpers-navigate';
import {
  createBridgeMockStore,
  MOCK_LEDGER_ACCOUNT,
} from '../../../../test/data/bridge/mock-bridge-store';
import {
  ConnectionStatus,
  HardwareWalletType,
} from '../../../contexts/hardware-wallets';
import { createHardwareWalletError } from '../../../contexts/hardware-wallets/errors';
import { updateAndApproveTx } from '../../../store/actions';
import { cleanupPendingApproval } from './hardware-wallet-signatures.utils';
import HardwareWalletSignatures from '.';

const mockUseHardwareWalletState = jest.fn();
const mockNavigate = jest.fn();
let mockLocationState: unknown;

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({ pathname: '/', state: mockLocationState }),
  useNavigate: () => mockNavigate,
}));
jest.mock('../../../contexts/hardware-wallets', () => ({
  ...jest.requireActual('../../../contexts/hardware-wallets'),
  useHardwareWalletState: () => mockUseHardwareWalletState(),
  useHardwareWalletActions: () => ({
    ensureDeviceReady: jest.fn().mockResolvedValue(true),
    setSigningInProgress: jest.fn(),
  }),
}));
jest.mock('../../../store/actions', () => ({
  ...jest.requireActual('../../../store/actions'),
  updateAndApproveTx: jest.fn(),
}));
jest.mock('./hardware-wallet-signatures.utils', () => ({
  ...jest.requireActual('./hardware-wallet-signatures.utils'),
  cleanupPendingApproval: jest.fn(),
}));
jest.mock('../../../store/background-connection', () => ({
  ...jest.requireActual('../../../store/background-connection'),
  submitRequestToBackground: jest.fn().mockResolvedValue(undefined),
  subscribeToMessengerEvent: jest
    .fn()
    .mockResolvedValue(jest.fn().mockResolvedValue(undefined)),
}));
jest.mock('./generic-hardware-wallet-animation', () => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __esModule: true,
  default: () => <div data-testid="hardware-animation" />,
}));

async function renderSend({
  needsTwoConfirmations = false,
  hasApproval = true,
} = {}) {
  const txMeta = {
    id: 'send-id',
    chainId: '0x1',
    networkClientId: 'mainnet',
    type: TransactionType.simpleSend,
    status: 'unapproved',
    time: 1,
    txParams: {
      from: MOCK_LEDGER_ACCOUNT.address,
      to: '0x1234567890123456789012345678901234567890',
      value: '0x1',
    },
  } as TransactionMeta;
  mockLocationState = {
    sendBundle: {
      txMeta,
      needsTwoConfirmations,
      approvalRequestId: 'approval-id',
      sendAmount: '1.5',
      sendSymbol: 'ETH',
      gasSymbol: 'USDC',
      returnRoute: '/send',
    },
  };
  const store = configureStore(
    createBridgeMockStore({
      metamaskStateOverrides: {
        internalAccounts: { selectedAccount: MOCK_LEDGER_ACCOUNT.id },
        accountTree: {
          selectedAccountGroup: `keyring:Ledger Hardware/${MOCK_LEDGER_ACCOUNT.address}`,
        },
        pendingApprovals: hasApproval
          ? {
              'approval-id': {
                id: 'approval-id',
                type: 'transaction',
                origin: 'metamask',
                time: 1,
                requestData: {},
              },
            }
          : {},
      },
    }),
  );
  const rendered = renderWithProvider(<HardwareWalletSignatures />, store);
  await act(async () => {
    await Promise.resolve();
  });
  return rendered;
}

describe('hardware wallet send page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseHardwareWalletState.mockReturnValue({
      connectionState: { status: ConnectionStatus.Ready },
    });
    jest
      .mocked(updateAndApproveTx)
      .mockReturnValue((() => new Promise(() => undefined)) as never);
  });

  it('shows the send amount and hardware animation', async () => {
    const { getByText, getByTestId } = await renderSend();
    expect(getByText('Sending 1.5 ETH')).toBeInTheDocument();
    expect(getByTestId('hardware-animation')).toBeInTheDocument();
    expect(updateAndApproveTx).toHaveBeenCalledTimes(1);
  });

  it('shows separate send and gas-payment steps', async () => {
    const { getByText } = await renderSend({ needsTwoConfirmations: true });
    expect(getByText('Sending 1.5 ETH')).toBeInTheDocument();
    expect(getByText(/USDC/u)).toBeInTheDocument();
  });

  it('does not sign when the pending approval is missing', async () => {
    await renderSend({ hasApproval: false });
    expect(updateAndApproveTx).not.toHaveBeenCalled();
  });

  it('rejects the pending approval before returning from cancel', async () => {
    const { getByRole } = await renderSend();
    fireEvent.click(getByRole('button', { name: 'Cancel' }));
    await waitFor(() =>
      expect(cleanupPendingApproval).toHaveBeenCalledWith(
        expect.any(Function),
        'approval-id',
      ),
    );
    expect(mockNavigate).toHaveBeenCalledWith('/send', { replace: true });
  });

  jestIt.each([
    ErrorCode.DeviceDisconnected,
    ErrorCode.ConnectionTimeout,
    ErrorCode.AuthenticationDeviceLocked,
  ])('shows reconnect guidance for device error %s', async (code) => {
    mockUseHardwareWalletState.mockReturnValue({
      connectionState: {
        status: ConnectionStatus.ErrorState,
        error: createHardwareWalletError(
          code,
          HardwareWalletType.Ledger,
          'Device unavailable',
        ),
      },
    });
    const { getByText } = await renderSend();
    expect(
      getByText('Reconnect your device and try again'),
    ).toBeInTheDocument();
  });
});
