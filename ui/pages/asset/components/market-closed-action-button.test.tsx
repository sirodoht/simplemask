import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import { englishText as messages } from '../../../../shared/lib/text';
import { MarketClosedActionButton } from './market-closed-action-button';

const renderComponent = (component: React.ReactElement) => {
  return render(<>{component}</>);
};

describe('MarketClosedActionButton', () => {
  it('renders the translated button text', () => {
    renderComponent(<MarketClosedActionButton onClick={jest.fn()} />);

    expect(
      screen.getByText(messages.bridgeMarketClosedAction),
    ).toBeInTheDocument();
  });

  it('renders with data-testid', () => {
    renderComponent(<MarketClosedActionButton onClick={jest.fn()} />);

    expect(
      screen.getByTestId('market-closed-action-button'),
    ).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    renderComponent(<MarketClosedActionButton onClick={handleClick} />);

    fireEvent.click(screen.getByTestId('market-closed-action-button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
