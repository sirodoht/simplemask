import { render as renderComponent } from '@testing-library/react';
import React from 'react';
import { DelineatorType } from '../../../../helpers/constants/snaps';

import { SnapDelineator } from './snap-delineator';

describe('SnapDelineator', () => {
  const args = {
    snapName: 'Test Snap',
    type: DelineatorType.Content,
    children: 'This is some test content',
  };

  it('should render the SnapDelineator with content inside', () => {
    const { getByText } = renderComponent(<SnapDelineator {...args} />);

    expect(getByText(/Content from Test Snap/u)).toBeDefined();
    expect(getByText(args.children)).toBeDefined();
  });

  it('should render an insight title', () => {
    args.type = DelineatorType.Insights;

    const { getByText } = renderComponent(<SnapDelineator {...args} />);

    expect(getByText(/Insights from Test Snap/u)).toBeDefined();
  });

  it('should render an error title', () => {
    args.type = DelineatorType.Error;

    const { getByText } = renderComponent(<SnapDelineator {...args} />);

    expect(getByText(/Error with Test Snap/u)).toBeDefined();
  });
});
