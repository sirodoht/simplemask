import React from 'react';
import configureStore from 'redux-mock-store';
import { renderWithProvider } from '../../../../../../test/lib/render-helpers-navigate';
import mockState from '../../../../../../test/data/mock-state.json';
import NftDefaultImage from '.';

describe('NFT Default Image', () => {
  const store = configureStore()(mockState);

  it('should render with no props', () => {
    const { container } = renderWithProvider(<NftDefaultImage />, store);

    expect(container).toMatchSnapshot();
  });
});
