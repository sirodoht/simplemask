import { render, screen } from '@testing-library/react';
import React from 'react';

import { englishText as messages } from '../../../../shared/lib/text';
import { ConnectionPermissionsList } from './connection-permissions-list';

describe('ConnectionPermissionsList', () => {
  const renderComponent = () => {
    return render(<ConnectionPermissionsList />);
  };

  it('renders the permissions header', () => {
    renderComponent();
    expect(screen.getByText(messages.permissions)).toBeInTheDocument();
  });

  it('renders see addresses permission item', () => {
    renderComponent();
    expect(
      screen.getByText(messages.permissionSeeAddresses),
    ).toBeInTheDocument();
  });

  it('renders send requests permission item', () => {
    renderComponent();
    expect(
      screen.getByText(messages.permissionSendRequests),
    ).toBeInTheDocument();
  });

  it('renders cannot move funds permission item', () => {
    renderComponent();
    expect(
      screen.getByText(messages.permissionCannotMoveFunds),
    ).toBeInTheDocument();
  });
});
