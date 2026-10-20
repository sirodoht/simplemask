import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { transformSync } from '@swc/core';
import browserslist from 'browserslist';
import { getBrowserMinimumVersions } from './browser-targets';

describe('browser support', () => {
  it('accepts the browser query in the SWC compiler', () => {
    const targets = readFileSync(
      path.resolve(__dirname, '../../../.browserslistrc'),
      'utf8',
    );
    assert.doesNotThrow(() =>
      transformSync('const value = object?.property;', {
        env: { targets },
      }),
    );
  });
  it('uses the latest Chrome and Firefox versions from the locked browser data', () => {
    const versions = getBrowserMinimumVersions();
    assert.deepEqual(
      [`chrome ${versions.chrome}`, `firefox ${versions.firefox}`],
      browserslist(['last 1 Chrome version', 'last 1 Firefox version']),
    );
  });
});
