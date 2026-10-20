import React from 'react';

import { render, fireEvent } from '@testing-library/react';
import { getText } from '../../../../helpers/utils/text';
import NetworkListSearch from './network-list-search';

jest.mock('../../../../helpers/utils/text', () => ({
  getText: jest.fn(),
}));

describe('NetworkListSearch', () => {
  const mockSetSearchQuery = jest.fn();
  const mockSetFocusSearch = jest.fn();
  const getTextMock = getText as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    getTextMock.mockImplementation((key: string) => key);
  });

  it('renders search list component', () => {
    const { container } = render(
      <NetworkListSearch
        searchQuery=""
        setSearchQuery={mockSetSearchQuery}
        setFocusSearch={mockSetFocusSearch}
      />,
    );

    expect(container).toMatchSnapshot();
  });

  it('should update search query on user input', () => {
    const { getByPlaceholderText } = render(
      <NetworkListSearch
        searchQuery=""
        setSearchQuery={mockSetSearchQuery}
        setFocusSearch={mockSetFocusSearch}
      />,
    );

    const searchInput = getByPlaceholderText('search');
    fireEvent.change(searchInput, { target: { value: 'Ethereum' } });

    expect(mockSetSearchQuery).toHaveBeenCalledWith('Ethereum');
  });

  it('should clear search query when clear button is clicked', () => {
    const { getByRole } = render(
      <NetworkListSearch
        searchQuery="Ethereum"
        setSearchQuery={mockSetSearchQuery}
        setFocusSearch={mockSetFocusSearch}
      />,
    );

    const clearButton = getByRole('button', { name: /clear/iu });
    fireEvent.click(clearButton);

    expect(mockSetSearchQuery).toHaveBeenCalledWith('');
  });
});
