import React from 'react';

import { fireEvent } from '@testing-library/react';
import configureStore from '../../../store/store';
import { renderWithProvider } from '../../../../test/lib/render-helpers-navigate';
import { englishText as messages } from '../../../../shared/lib/text';
import { DATA_DELETION_ERROR_MODAL_CLOSE } from '../../../store/actionConstants';

import DataDeletionErrorModal from './data-deletion-error-modal';

const mockCloseDeleteMetaMetricsErrorModal = jest
  .fn()
  .mockImplementation(() => {
    return {
      type: DATA_DELETION_ERROR_MODAL_CLOSE,
    };
  });

jest.mock('../../../ducks/app/app.ts', () => {
  return {
    hideDataDeletionErrorModal: () => {
      return mockCloseDeleteMetaMetricsErrorModal();
    },
  };
});

describe('DataDeletionErrorModal', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render data deletion error modal', async () => {
    const store = configureStore({});
    const { getByText } = renderWithProvider(<DataDeletionErrorModal />, store);

    expect(
      getByText(messages.deleteMetaMetricsDataErrorTitle),
    ).toBeInTheDocument();
    expect(
      getByText(messages.deleteMetaMetricsDataErrorDesc),
    ).toBeInTheDocument();
  });

  it('should call hideDeleteMetaMetricsDataModal when Ok button is clicked', () => {
    const store = configureStore({});
    const { getByText } = renderWithProvider(<DataDeletionErrorModal />, store);
    expect(getByText(messages.ok)).toBeEnabled();
    fireEvent.click(getByText(messages.ok));
    expect(mockCloseDeleteMetaMetricsErrorModal).toHaveBeenCalledTimes(1);
  });
});
