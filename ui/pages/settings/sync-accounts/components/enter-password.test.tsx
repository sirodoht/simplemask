import {
  render as renderComponent,
  fireEvent,
  screen,
  waitFor,
} from '@testing-library/react';
import React from 'react';

import { englishText as messages } from '../../../../../shared/lib/text';
import { verifyPassword } from '../../../../store/actions';

import EnterPassword from './enter-password';

jest.mock('../../../../store/actions', () => ({
  verifyPassword: jest.fn(),
}));

const mockVerifyPassword = jest.mocked(verifyPassword);

const getPasswordInput = () =>
  document.querySelector('input[type="password"]') as HTMLInputElement;

describe('EnterPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the heading and description', () => {
    renderComponent(<EnterPassword onPasswordChange={jest.fn()} />);

    expect(screen.getByText(messages.enter_your_password)).toBeInTheDocument();
    expect(
      screen.getByText(messages.enter_your_password_desc),
    ).toBeInTheDocument();
  });

  it('continues to the AddWallets step when the password is correct', async () => {
    mockVerifyPassword.mockResolvedValue(true);
    const onPasswordChange = jest.fn();
    renderComponent(<EnterPassword onPasswordChange={onPasswordChange} />);

    fireEvent.change(getPasswordInput(), { target: { value: 'correct' } });
    fireEvent.click(screen.getByText(messages.continue));

    await waitFor(() => {
      expect(onPasswordChange).toHaveBeenCalledWith('correct');
    });
    expect(mockVerifyPassword).toHaveBeenCalledWith('correct');
  });

  it('shows an error and does not continue when the password is incorrect', async () => {
    mockVerifyPassword.mockRejectedValue(new Error('wrong password'));
    const onPasswordChange = jest.fn();
    renderComponent(<EnterPassword onPasswordChange={onPasswordChange} />);

    fireEvent.change(getPasswordInput(), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByText(messages.continue));

    expect(
      await screen.findByText(messages.unlockPageIncorrectPassword),
    ).toBeInTheDocument();
    expect(onPasswordChange).not.toHaveBeenCalled();
  });
});
