import type {
  I18nFunction,
  TranslationKeys,
} from '@metamask/7715-permission-types';
import { buildPermissionTextMap } from '../../../shared/lib/gator-permissions/permission-text-map';
import { getText } from '../../helpers/utils/text';

/**
 * Returns a lookup map for every {@link TranslationKeys} entry, wrapping
 * {@link getText} so callers don't need the intermediary `t` function.
 */
export function getPermissionTextMap(): Record<TranslationKeys, string> {
  const t = getText as I18nFunction;
  return buildPermissionTextMap(t);
}
