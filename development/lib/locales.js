const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

const log = require('loglevel');

const readFile = promisify(fs.readFile);
// Keep these patterns in sync with shared/lib/i18n.ts applySubstitutions().
const INVALID_REPLACEMENT_KEY_REGEX = /\$\d{2,}|\$0/gu;

function getLocalePath(code) {
  return path.resolve(
    __dirname,
    '..',
    '..',
    'app',
    '_locales',
    code,
    'messages.json',
  );
}

// eslint-disable-next-line consistent-return
async function getLocale(code) {
  try {
    const localeFilePath = getLocalePath(code);
    const fileContents = await readFile(localeFilePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (e) {
    if (e.code === 'ENOENT') {
      log.error('Locale file not found');
    } else {
      log.error(`Error opening your locale ("${code}") file: `, e);
    }
    process.exit(1);
  }
}

function getMessagesWithInvalidReplacementKeys(locale) {
  return Object.keys(locale).flatMap((key) => {
    const invalidReplacementKeys = getInvalidReplacementKeys(
      locale[key].message,
    );

    if (invalidReplacementKeys.length === 0) {
      return [];
    }

    return [
      {
        invalidReplacementKeys,
        key,
      },
    ];
  });
}

function getInvalidReplacementKeys(message) {
  return getReplacementKeyMatches(message, INVALID_REPLACEMENT_KEY_REGEX);
}

function getReplacementKeyMatches(message, regex) {
  return [...new Set(message.match(regex) ?? [])].sort(
    (firstKey, secondKey) =>
      Number(firstKey.slice(1)) - Number(secondKey.slice(1)),
  );
}

module.exports = {
  getMessagesWithInvalidReplacementKeys,
  getLocale,
  getLocalePath,
};
