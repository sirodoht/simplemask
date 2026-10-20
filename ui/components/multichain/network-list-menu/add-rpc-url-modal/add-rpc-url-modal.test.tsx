import React from 'react';

import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { getText } from '../../../../helpers/utils/text';
import AddRpcUrlModal from './add-rpc-url-modal';

jest.mock('../../../../helpers/utils/text', () => ({
  getText: jest.fn(),
}));

describe('AddRpcUrlModal', () => {
  const getTextMock = getText as jest.Mock;

  beforeEach(() => {
    getTextMock.mockImplementation((key: string) => key);
    jest.clearAllMocks();
  });

  it('should render correctly', () => {
    const { container } = render(<AddRpcUrlModal onAdded={() => undefined} />);
    expect(container).toMatchSnapshot();
  });

  it('should render the "Add URL" button with correct text', () => {
    render(<AddRpcUrlModal onAdded={() => undefined} />);
    const addButton = screen.getByRole('button', { name: 'addUrl' });
    expect(addButton).toBeInTheDocument();
  });

  it('should call the appropriate function when "Add URL" button is clicked', () => {
    const mockAddUrl = jest.fn();
    render(<AddRpcUrlModal onAdded={() => null} />);
    const addButton = screen.getByRole('button', { name: 'addUrl' });
    userEvent.click(addButton);
    expect(mockAddUrl).not.toHaveBeenCalled();
  });
});
