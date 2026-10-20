import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { detectSnapLocation } from '@metamask/snaps-controllers';
import { detectSupportedSnapLocation } from './supported-snap-location';

jest.mock('@metamask/snaps-controllers', () => ({
  detectSnapLocation: jest.fn(),
}));

describe('detectSupportedSnapLocation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each(['bitcoin', 'solana', 'tron', 'stellar'])(
    'rejects the retired %s wallet before resolving or fetching it',
    (chain) => {
      expect(() =>
        detectSupportedSnapLocation(`npm:@metamask/${chain}-wallet-snap`),
      ).toThrow('no longer supported');
      expect(detectSnapLocation).not.toHaveBeenCalled();
    },
  );

  it('retains ordinary Snap resolution and security options', () => {
    const options = { allowLocal: false, allowHttp: false };
    detectSupportedSnapLocation('npm:@metamask/ens-resolver-snap', options);
    expect(detectSnapLocation).toHaveBeenCalledWith(
      'npm:@metamask/ens-resolver-snap',
      options,
    );
  });
});
