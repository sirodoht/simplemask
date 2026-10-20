#!/usr/bin/env node
// Validate the English UI catalog and its substitutions. --fix removes unused keys.
// Non-English bundles are rejected: this project supports English only.

const { deepStrictEqual } = require('node:assert');
const path = require('node:path');
const fs = require('fs');
const { promisify } = require('util');
const log = require('loglevel');
const glob = require('fast-glob');
const matchAll = require('string.prototype.matchall').getPolyfill();
const localeIndex = require('../app/_locales/index.json');
const {
  getMessagesWithInvalidReplacementKeys,
  getLocale,
  getLocalePath,
} = require('./lib/locales');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

log.setDefaultLevel('info');

let fix = false;
let specifiedLocale;
for (const arg of process.argv.slice(2)) {
  if (arg === '--fix') {
    fix = true;
  } else if (arg === '--quiet') {
    log.setLevel('error');
  } else {
    specifiedLocale = arg;
  }
}

main().catch((error) => {
  log.error(error);
  process.exit(1);
});

async function main() {
  if (specifiedLocale && specifiedLocale !== 'en') {
    throw new Error('Only the English locale is supported.');
  }
  deepStrictEqual(localeIndex, [{ code: 'en', name: 'English' }]);
  const localeDirectories = fs
    .readdirSync(path.resolve(__dirname, '../app/_locales'), {
      withFileTypes: true,
    })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  deepStrictEqual(
    localeDirectories,
    ['en'],
    'Only the English catalog may be shipped.',
  );
  if (await verifyEnglishLocale()) {
    process.exitCode = 1;
  } else {
    console.log('English catalog is valid.');
  }
}

// eslint-disable-next-line consistent-return
async function writeLocale(code, locale) {
  try {
    const localeFilePath = getLocalePath(code);
    return writeFile(
      localeFilePath,
      `${JSON.stringify(locale, null, 2)}\n`,
      'utf8',
    );
  } catch (e) {
    if (e.code === 'ENOENT') {
      log.error('Locale file not found');
    } else {
      log.error(`Error writing your locale ("${code}") file: `, e);
    }
    process.exit(1);
  }
}

async function verifyEnglishLocale() {
  const englishLocale = await getLocale('en');
  const invalidReplacementKeys =
    getMessagesWithInvalidReplacementKeys(englishLocale);
  // As time allows we'll switch to only performing the strict search.
  // In the meantime we'll use glob to specify which paths can be strict searched
  // and gradually phase out the key based search
  const globsToStrictSearch = [
    'ui/components/app/metamask-translation/*.js',
    'ui/components/app/metamask-translation/*.ts',
    'ui/pages/confirmation/templates/*.js',
    'ui/pages/confirmation/templates/*.ts',
  ];
  const testGlob = '**/*.test.js';
  const javascriptFiles = await glob(
    [
      'ui/**/*.js',
      'ui/**/*.ts',
      'ui/**/*.tsx',
      'shared/**/*.js',
      'shared/**/*.ts',
      'shared/**/*.tsx',
      'app/scripts/lib/**/*.js',
      'app/scripts/lib/**/*.ts',
      'app/scripts/constants/**/*.js',
      'app/scripts/constants/**/*.ts',
      'app/scripts/platforms/**/*.js',
      'app/scripts/platforms/**/*.ts',
      'app/scripts/controllers/**/*.ts',
    ],
    {
      ignore: [...globsToStrictSearch, testGlob],
    },
  );
  const javascriptFilesToStrictSearch = await glob(globsToStrictSearch, {
    ignore: [testGlob],
  });

  const strictSearchRegex =
    /\bt\(\s*'(\w+)'\s*\)|\btranslationKey:\s*'(\w+)'/gu;
  // match "t(`...`)" because constructing message keys from template strings
  // prevents this script from finding the messages, and then inappropriately
  // deletes them
  const templateStringRegex = /\bt\(`.*`\)/gu;
  const templateUsage = [];

  // match the keys from the locale file
  const keyRegex = /'(\w+)'|"(\w+)"/gu;
  const usedMessages = new Set();
  for await (const fileContents of getFileContents(javascriptFiles)) {
    for (const match of matchAll.call(fileContents, keyRegex)) {
      usedMessages.add(match[1] || match[2]);
    }
    const templateMatches = fileContents.match(templateStringRegex);
    if (templateMatches) {
      templateMatches.forEach((match) => templateUsage.push(match));
    }
  }

  for await (const fileContents of getFileContents(
    javascriptFilesToStrictSearch,
  )) {
    for (const match of matchAll.call(fileContents, strictSearchRegex)) {
      usedMessages.add(match[1] || match[2] || match[3] || match[4]);
    }

    const templateMatches = fileContents.match(templateStringRegex);
    if (templateMatches) {
      templateMatches.forEach((match) => templateUsage.push(match));
    }
  }

  // never consider these messages as unused
  const messageExceptions = [
    'appName',
    'appNameBeta',
    'appNameFlask',
    'appDescription',
    'rejected',
    'signed',
    'unexpectedError',
    // used via CSS
    'CSS_loadingTakingTooLongMessageText',
    'CSS_loadingTakingTooLongActionText',
  ];

  const messageExceptionPatterns = [
    /^activity_[a-zA-Z0-9]+_(failed|pending|success)_(description|title)$/u,
    /^activity_fallback_(description|title)$/u,
  ];

  const englishMessages = Object.keys(englishLocale);
  const unusedMessages = englishMessages.filter(
    (message) =>
      !messageExceptions.includes(message) &&
      !messageExceptionPatterns.some((pattern) => pattern.test(message)) &&
      !usedMessages.has(message),
  );

  if (unusedMessages.length) {
    console.log(`**en**: ${unusedMessages.length} unused messages`);
    log.info(`Messages not present in UI:`);
    unusedMessages.forEach(function (key) {
      log.info(`  - [ ] ${key}`);
    });
  }

  if (templateUsage.length) {
    log.info(`Forbidden use of template strings in 't' function:`);
    templateUsage.forEach(function (occurrence) {
      log.info(` - ${occurrence}`);
    });
  }

  if (invalidReplacementKeys.length) {
    console.log(
      `**en**: ${invalidReplacementKeys.length} messages with invalid replacement keys`,
    );
    log.info('Messages with invalid replacement keys:');
    invalidReplacementKeys.forEach(function ({
      key,
      invalidReplacementKeys: invalidKeys,
    }) {
      log.info(`  - [ ] ${key} (${invalidKeys.join(', ')})`);
    });
  }

  if (
    !unusedMessages.length &&
    !templateUsage.length &&
    !invalidReplacementKeys.length
  ) {
    return false; // failed === false
  }

  if (unusedMessages.length > 0 && fix) {
    const newLocale = { ...englishLocale };
    for (const key of unusedMessages) {
      delete newLocale[key];
    }
    await writeLocale('en', newLocale);
  }

  return true; // failed === true
}

async function* getFileContents(filenames) {
  for (const filename of filenames) {
    yield readFile(filename, 'utf8');
  }
}
