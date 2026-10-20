import { TransactionMeta } from '@metamask/transaction-controller';
import { waitFor } from '@testing-library/react';

import mockState from '../../../../../test/data/mock-state.json';
import { EVM_ASSET, SOLANA_ASSET } from '../../../../../test/data/send/assets';
import { renderHookWithProvider } from '../../../../../test/lib/render-helpers-navigate';
import {
  DEFAULT_ROUTE,
  PREVIOUS_ROUTE,
} from '../../../../helpers/constants/routes';
import { setMaxValueMode } from '../../../../ducks/send-max-value/send-max-value';
import * as SendUtils from '../../utils/send';
import * as SendContext from '../../context/send';
import { useSendActions } from './useSendActions';

const MOCK_ADDRESS_1 = '0xdB055877e6c13b6A6B25aBcAA29B393777dD0a73';
const MOCK_ADDRESS_2 = '0xd12662965960f3855a09f85396459429a595d741';
const MOCK_ADDRESS_3 = '4Nd1m5PztHZbA1FtdYzWxTjLdQdHZr4sqoZKxK3x3hJv';
const MOCK_ADDRESS_4 = '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin';

const mockUseNavigate = jest.fn();
const mockUseLocation = jest.fn();
jest.mock('react-router-dom', () => {
  return {
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockUseNavigate,
    useLocation: () => mockUseLocation(),
  };
});

const mockDispatch = jest.fn((action) =>
  typeof action === 'function' ? action() : action,
);
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));

const mockTrackEvent = jest.fn();
jest.mock('../../../../hooks/useAnalytics', () => {
  const { createEventBuilder } = jest.requireActual(
    '../../../../../shared/lib/analytics/create-event-builder',
  );
  return {
    useAnalytics: () => ({
      trackEvent: mockTrackEvent,
      createEventBuilder,
    }),
  };
});

const NON_EVM_SEND_CONTEXT = {
  asset: SOLANA_ASSET,
  chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  from: MOCK_ADDRESS_3,
  fromAccount: {
    id: 'mock-account-id',
    metadata: { snap: { id: 'npm:@metamask/solana-wallet-snap' } },
  },
  to: MOCK_ADDRESS_4,
  value: '10',
};

beforeEach(() => {
  mockUseNavigate.mockClear();
  mockDispatch.mockClear();
  mockTrackEvent.mockClear();
  mockUseLocation.mockReturnValue({ key: 'in-app-entry' });
});

function renderHook() {
  const { result } = renderHookWithProvider(useSendActions, mockState);
  return result.current;
}

describe('useSendActions', () => {
  it('rejects a non-EVM asset before submitting any EVM transaction', async () => {
    jest
      .spyOn(SendContext, 'useSendContext')
      .mockReturnValue(
        NON_EVM_SEND_CONTEXT as unknown as SendContext.SendContextType,
      );
    const submit = jest.spyOn(SendUtils, 'submitEvmTransaction');
    submit.mockClear();
    await expect(renderHook().handleSubmit()).rejects.toThrow(
      'Only EVM transactions are supported',
    );
    expect(submit).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('result returns method handleCancel to cancel send', () => {
    const result = renderHook();
    result.handleCancel();
    expect(mockUseNavigate).toHaveBeenCalledWith('/');
  });

  it('result returns method handleBack to goto previous page', () => {
    const result = renderHook();
    result.handleBack();
    expect(mockUseNavigate).toHaveBeenCalledWith(PREVIOUS_ROUTE);
  });

  it('handleBack navigates home when Send was opened directly', () => {
    mockUseLocation.mockReturnValue({ key: 'default' });
    const result = renderHook();

    result.handleBack();

    expect(mockUseNavigate).toHaveBeenCalledWith(DEFAULT_ROUTE, {
      replace: true,
      state: { fromFreshTab: true },
    });
  });

  it('handleSubmit is able to submit evm send', async () => {
    jest.spyOn(SendContext, 'useSendContext').mockReturnValue({
      asset: EVM_ASSET,
      chainId: '0x5',
      from: MOCK_ADDRESS_1,
      to: MOCK_ADDRESS_2,
      value: 10,
      maxValueMode: true,
      updateNonEVMSubmitError: jest.fn(),
    } as unknown as SendContext.SendContextType);

    const mockSubmitEvmTransaction = jest
      .spyOn(SendUtils, 'submitEvmTransaction')
      .mockImplementation(() =>
        Promise.resolve(() =>
          Promise.resolve({ id: 'tx123' } as unknown as TransactionMeta),
        ),
      );

    const result = renderHook();
    result.handleSubmit(MOCK_ADDRESS_2);

    expect(mockSubmitEvmTransaction).toHaveBeenCalled();

    await waitFor(() => {
      expect(mockUseNavigate).toHaveBeenCalledWith(
        '/confirm-transaction?loader=send',
      );
    });
  });

  it('enables max value mode for the submitted transaction only', async () => {
    jest.spyOn(SendContext, 'useSendContext').mockReturnValue({
      asset: EVM_ASSET,
      chainId: '0x5',
      from: MOCK_ADDRESS_1,
      to: MOCK_ADDRESS_2,
      value: 10,
      maxValueMode: true,
      updateNonEVMSubmitError: jest.fn(),
    } as unknown as SendContext.SendContextType);

    jest
      .spyOn(SendUtils, 'submitEvmTransaction')
      .mockImplementation(() =>
        Promise.resolve(() =>
          Promise.resolve({ id: 'tx123' } as unknown as TransactionMeta),
        ),
      );

    const result = renderHook();
    result.handleSubmit(MOCK_ADDRESS_2);

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        setMaxValueMode({ transactionId: 'tx123', enabled: true }),
      );
    });
  });

  it('does not enable max value mode when the amount is not the max', async () => {
    jest.spyOn(SendContext, 'useSendContext').mockReturnValue({
      asset: EVM_ASSET,
      chainId: '0x5',
      from: MOCK_ADDRESS_1,
      to: MOCK_ADDRESS_2,
      value: 10,
      updateNonEVMSubmitError: jest.fn(),
    } as unknown as SendContext.SendContextType);

    jest
      .spyOn(SendUtils, 'submitEvmTransaction')
      .mockImplementation(() =>
        Promise.resolve(() =>
          Promise.resolve({ id: 'tx123' } as unknown as TransactionMeta),
        ),
      );

    const result = renderHook();
    result.handleSubmit(MOCK_ADDRESS_2);

    await waitFor(() => {
      expect(mockUseNavigate).toHaveBeenCalled();
    });
    expect(mockDispatch).not.toHaveBeenCalledWith(
      setMaxValueMode({ transactionId: 'tx123', enabled: true }),
    );
  });

  it('normalizes trailing dot values before submitting evm transaction', async () => {
    jest.spyOn(SendContext, 'useSendContext').mockReturnValue({
      asset: EVM_ASSET,
      chainId: '0x5',
      from: MOCK_ADDRESS_1,
      to: MOCK_ADDRESS_2,
      value: '0.',
      updateNonEVMSubmitError: jest.fn(),
    } as unknown as SendContext.SendContextType);

    const mockSubmitEvmTransaction = jest
      .spyOn(SendUtils, 'submitEvmTransaction')
      .mockImplementation(() =>
        Promise.resolve(() =>
          Promise.resolve({} as unknown as TransactionMeta),
        ),
      );

    const result = renderHook();
    result.handleSubmit(MOCK_ADDRESS_2);

    expect(mockSubmitEvmTransaction).toHaveBeenCalledWith(
      expect.objectContaining({ value: '0' }),
    );
  });
});
