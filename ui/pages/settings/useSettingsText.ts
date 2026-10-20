import { useCallback } from 'react';
import { getText } from '../../helpers/utils/text';
import { getPasskeyAuthMethodKey } from '../../../shared/lib/passkey';

const PASSKEY_SUBSTITUTED_LABEL_KEYS: ReadonlySet<string> = new Set([
  'setUpPasskey',
  'turnOffPasskey',
  'unlockWithPasskey',
]);

type TextFormatter = (key: string, substitutions?: string[]) => string;

function formatLabel(t: TextFormatter, labelKey: string): string {
  if (PASSKEY_SUBSTITUTED_LABEL_KEYS.has(labelKey)) {
    return t(labelKey, [t(getPasskeyAuthMethodKey())]);
  }
  return t(labelKey);
}

/**
 * Settings text: same as {@link getText}, but bare `t(key)` calls
 * resolve passkey-related label keys that need the OS-specific auth-method
 * noun. Calls with any additional arguments forward unchanged (substitutions,
 * React nodes, etc.).
 *
 * @returns Formatted settings text function
 */
export function useSettingsText() {
  const rawT = getText;

  return useCallback(
    (key: string, ...args: unknown[]) => {
      if (args.length > 0) {
        return rawT(key, ...args);
      }
      return formatLabel(rawT as TextFormatter, key);
    },
    [rawT],
  );
}
