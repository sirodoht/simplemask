import { getMessagesWithInvalidReplacementKeys } from './locales';

describe('getMessagesWithInvalidReplacementKeys', () => {
  it('returns an empty array when locale messages use valid replacement keys', () => {
    expect(
      getMessagesWithInvalidReplacementKeys({
        revealSeedWordsDescription1: {
          message: 'Your $1 gives full access to your wallet.',
        },
      }),
    ).toStrictEqual([]);
  });

  it('returns invalid replacement keys used by a locale', () => {
    expect(
      getMessagesWithInvalidReplacementKeys({
        shieldTxDetails1Title: {
          message: 'Shield details $0 $10 $10 $12',
        },
      }),
    ).toStrictEqual([
      {
        invalidReplacementKeys: ['$0', '$10', '$12'],
        key: 'shieldTxDetails1Title',
      },
    ]);
  });

  it('returns the full invalid replacement key when it starts with zero', () => {
    expect(
      getMessagesWithInvalidReplacementKeys({
        shieldTxDetails1Title: {
          message: 'Shield details $01',
        },
      }),
    ).toStrictEqual([
      {
        invalidReplacementKeys: ['$01'],
        key: 'shieldTxDetails1Title',
      },
    ]);
  });
});
