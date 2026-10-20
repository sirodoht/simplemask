import { FALLBACK_LOCALE } from './i18n';

/** Return the only supported UI language, independent of browser preferences. */
export default async function getFirstPreferredLangCode(): Promise<string> {
  return FALLBACK_LOCALE;
}
