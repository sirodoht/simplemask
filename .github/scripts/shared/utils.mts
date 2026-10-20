import humanizeDuration from 'humanize-duration';
import * as xml2js from 'xml2js';

export function normalizeTestPath(path: string): string {
  const normalized = path.replace(/\\/g, '/');
  return normalized.slice(normalized.indexOf('test/'));
}

export const XML = {
  parse: new xml2js.Parser().parseStringPromise,
};

const humanizer = humanizeDuration.humanizer({
  language: 'shortEn',
  languages: {
    shortEn: {
      y: () => 'y',
      mo: () => 'mo',
      w: () => 'w',
      d: () => 'd',
      h: () => 'h',
      m: () => 'm',
      s: () => 's',
      ms: () => 'ms',
    },
  },
  delimiter: ' ',
  spacer: '',
  round: true,
});

export function formatTime(ms: number): string {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  }
  return humanizer(ms);
}
