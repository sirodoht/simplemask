// Unicode confusables is not typed
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { confusables } from 'unicode-confusables';

import { RecipientValidationResult } from '../types/send';
import { LOWER_CASED_BURN_ADDRESSES } from '../constants/token';

export const findConfusablesInRecipient = (
  address: string,
): RecipientValidationResult => {
  const confusableCollection = confusables(address) as {
    point: string;
    similarTo: string;
  }[];

  // First filter out duplicate points, then filter by similarTo
  const uniquePoints = new Set<string>();
  const confusableCharacters = confusableCollection
    .filter(({ point }) => {
      if (uniquePoints.has(point)) {
        return false;
      }
      uniquePoints.add(point);
      return true;
    })
    .filter(({ similarTo }) => similarTo !== undefined);

  if (confusableCharacters.length) {
    const hasZeroWidthCharacters = confusableCharacters.some(
      ({ similarTo }) => similarTo === '',
    );

    if (hasZeroWidthCharacters) {
      return {
        error: 'invalidAddress',
        warning: 'confusableZeroWidthUnicode',
      };
    }

    return {
      confusableCharacters,
    };
  }
  return {};
};

export const validateEvmHexAddress = (
  address: string,
  assetAddress?: string,
) => {
  if (LOWER_CASED_BURN_ADDRESSES.includes(address.toLowerCase())) {
    return {
      error: 'invalidAddress',
    };
  }

  if (address?.toLowerCase() === assetAddress?.toLowerCase()) {
    return {
      error: 'contractAddressError',
    };
  }

  return {};
};
