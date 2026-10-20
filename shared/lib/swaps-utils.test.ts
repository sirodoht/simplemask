import nock from 'nock';
import { calcTokenValue } from './swaps-utils';

jest.mock('./storage-helpers', () => ({
  getStorageItem: jest.fn(),
  setStorageItem: jest.fn(),
}));

describe('Swaps Utils', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  describe('calcTokenValue', () => {
    it('should be possible to calculate very big values', () => {
      let result = calcTokenValue(1, 20);
      expect(result.toString()).toStrictEqual('100000000000000000000');
      result = calcTokenValue(1, 30);
      expect(result.toString()).toStrictEqual('1e+30');
    });
  });
});
