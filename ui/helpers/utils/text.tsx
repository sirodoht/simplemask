import React from 'react';
import { getTextParts } from '../../../shared/lib/text';
import { captureException } from '../../../shared/lib/sentry';

/**
 * Render English UI copy with optional text or React content in its placeholders.
 *
 * @param key - Product copy identifier.
 * @param input - Values for numbered placeholders.
 * @returns Text, or a span when inserting React content.
 */
// The existing component API accepts both strings and rich React content, often
// through callbacks declared in JavaScript. Keep that boundary permissive.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getText(key: string, input: any = []): any {
  const values: readonly unknown[] = Array.isArray(input) ? input : [];
  const parts = getTextParts(key, values, captureException);
  const hasReactContent = values.some(
    (value) =>
      value !== null &&
      (typeof value === 'function' || typeof value === 'object'),
  );
  return hasReactContent ? (
    <span> {parts as React.ReactNode[]} </span>
  ) : (
    parts.join('')
  );
}
