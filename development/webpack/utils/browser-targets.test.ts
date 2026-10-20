import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import browserslist from 'browserslist';
import { getBrowserMinimumVersions } from './browser-targets';

describe('browser support', () => {
  it('uses the latest Chrome and Firefox versions from the locked browser data', () => {
    const versions = getBrowserMinimumVersions();
    assert.deepEqual(
      [`chrome ${versions.chrome}`, `firefox ${versions.firefox}`],
      browserslist(['last 1 Chrome version', 'last 1 Firefox version']),
    );
  });
});
