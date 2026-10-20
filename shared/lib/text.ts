import log from 'loglevel';
import { englishText } from '../constants/english-text';

export { englishText };

const reportedErrors = new Set<string>();

function report(error: Error, onError?: (error: Error) => void): void {
  if (!reportedErrors.has(error.message)) {
    reportedErrors.add(error.message);
    log.error(error);
    onError?.(error);
  }
}

/**
 * Insert values into English product copy without interpreting HTML.
 *
 * @param key - Product copy identifier.
 * @param values - Values for numbered placeholders, starting at $1.
 * @param onError - Optional reporting callback.
 * @returns Text and inserted values in display order.
 */
export function getTextParts(
  key: string,
  values: readonly unknown[] = [],
  onError?: (error: Error) => void,
): unknown[] {
  const text = englishText[key];
  if (text === undefined) {
    const error = new Error(`Unknown product text: ${key}`);
    report(error, onError);
    if (process.env.IN_TEST || process.env.ENABLE_SETTINGS_PAGE_DEV_OPTIONS) {
      throw error;
    }
    return [];
  }
  if (values.length === 0) {
    return [text];
  }
  return text.split(/(\$\d)/gu).map((part) => {
    const match = /^\$(\d)$/u.exec(part);
    if (!match) {
      return part;
    }
    const value = values[Number(match[1]) - 1];
    if (value === undefined || value === null) {
      report(
        new Error(`Missing value for ${part} in product text: ${key}`),
        onError,
      );
    }
    return value;
  });
}

/**
 * Render plain English text for background services and HTML error screens.
 *
 * @param key - Product copy identifier.
 * @param values - Values for numbered placeholders.
 * @returns Rendered text.
 */
export function getText(key: string, values: readonly unknown[] = []): string {
  return getTextParts(key, values).join('');
}
