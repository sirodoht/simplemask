import path from 'node:path';
import browserslist from 'browserslist';

/** Keep installation requirements aligned with the compiled browser targets. */
export function getBrowserMinimumVersions(): Record<
  'chrome' | 'firefox',
  string
> {
  const targets = browserslist(undefined, {
    path: path.resolve(__dirname, '../../..'),
  });
  const versions = { chrome: '', firefox: '' };
  for (const browser of ['chrome', 'firefox'] as const) {
    const target = targets.filter((entry) => entry.startsWith(`${browser} `));
    if (target.length !== 1) {
      throw new Error(`Expected one latest stable target for ${browser}`);
    }
    versions[browser] = target[0].split(' ')[1];
  }
  return versions;
}
