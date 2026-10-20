// eslint-disable-next-line import-x/no-restricted-paths
import enTranslations from '../../app/_locales/en/messages.json';
import { FALLBACK_LOCALE, getMessage } from './i18n';

export function getCurrentLocale(): string {
  return FALLBACK_LOCALE;
}

export function t(key: string, ...substitutions: string[]): string | null {
  return getMessage(FALLBACK_LOCALE, enTranslations, key, substitutions);
}
