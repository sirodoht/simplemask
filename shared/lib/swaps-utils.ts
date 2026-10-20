import BigNumber from 'bignumber.js';

import { addHexPrefix } from './add-hex-prefix';

export function calcTokenValue(value: number | string, decimals: number) {
  const multiplier = new BigNumber(10).pow(decimals);
  return new BigNumber(String(value)).times(multiplier);
}

export function addHexPrefixToObjectValues(
  obj: Record<string, string | undefined>,
): Record<string, string | undefined> {
  return Object.keys(obj).reduce<Record<string, string | undefined>>(
    (newObj, key) => {
      const value = obj[key];
      return {
        ...newObj,
        [key]: value === undefined ? undefined : addHexPrefix(value),
      };
    },
    {},
  );
}
