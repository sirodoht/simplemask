import type { I18nFunction, I18nValue } from '@metamask/7715-permission-types';

/**
 * Translates an {@link I18nValue} (key + optional interpolation args) with the given English text function.
 * @param t
 * @param value
 */
export function formatPermissionText(
  t: I18nFunction,
  value: I18nValue,
): string {
  return t(value.key, value.args);
}
