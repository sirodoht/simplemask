import React from 'react';

import { fireEvent } from '@testing-library/react';
import { renderWithProvider } from '../../../../test/lib/render-helpers-navigate';
import { englishText as messages } from '../../../../shared/lib/text';
import SRPDetailsModal from './srp-details-modal';

describe('SRP Details Modal', () => {
  const onCloseStub = jest.fn();

  it('should render', () => {
    const { getByText } = renderWithProvider(
      <SRPDetailsModal onClose={onCloseStub} />,
    );

    const title = getByText(messages.srpDetailsTitle);
    expect(title).toBeInTheDocument();

    const gotItButton = getByText(messages.gotIt);
    expect(gotItButton).toBeInTheDocument();
  });

  it('onClose function is called when the button is clicked', () => {
    const { getByText } = renderWithProvider(
      <SRPDetailsModal onClose={onCloseStub} />,
    );

    const gotItButton = getByText(messages.gotIt);
    fireEvent.click(gotItButton);
    expect(onCloseStub).toHaveBeenCalled();
  });
});
