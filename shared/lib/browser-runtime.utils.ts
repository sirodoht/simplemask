/**
 * Utility Functions to support browser.runtime JavaScript API
 */

import Bowser from 'bowser';
import browser from 'webextension-polyfill';
import type { Runtime } from 'webextension-polyfill';
import log from 'loglevel';
import { PLATFORM_FIREFOX } from '../constants/app';
import {
  BROKEN_PRERENDER_BROWSER_VERSIONS,
  FIXED_PRERENDER_BROWSER_VERSIONS,
  // TODO: Remove restricted import
  // eslint-disable-next-line import-x/no-restricted-paths
} from '../../ui/helpers/constants/common';

/**
 * Returns an Error if extension.runtime.lastError is present
 * this is a workaround for the non-standard error object that's used
 *
 * According to the docs, we are expected to check lastError in runtime API callbacks:
 * "
 * If you call an asynchronous function that may set lastError, you are expected to
 * check for the error when you handle the result of the function. If lastError has been
 * set and you don't check it within the callback function, then an error will be raised.
 * "
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/lastError}
 * @returns The last error, or undefined
 */
export function checkForLastError(): Error | undefined {
  const { lastError } = browser.runtime;
  if (!lastError) {
    return undefined;
  }
  // if it quacks like an Error, its an Error
  if ('stack' in lastError && lastError.stack && lastError.message) {
    return lastError as Error;
  }
  // repair incomplete error object (eg chromium v77)
  return new Error(lastError.message);
}

/**
 * @returns The last error, or undefined
 */
export function checkForLastErrorAndLog(): Error | undefined {
  const error = checkForLastError();

  if (error) {
    log.error(error);
  }

  return error;
}

/**
 * Returns true if the browser is affected by a regression that causes the
 * extension port stream established between the contentscript and background
 * to be broken when a prerendered (eagerly rendered, hidden) page becomes active (visible to the user).
 *
 * @param bowser - optional Bowser instance to check against
 * @returns Whether the browser is affected by the prerender regression
 */
export function getIsBrowserPrerenderBroken(
  bowser: Bowser.Parser.Parser = Bowser.getParser(window.navigator.userAgent),
): boolean {
  return (
    (bowser.satisfies(BROKEN_PRERENDER_BROWSER_VERSIONS) &&
      !bowser.satisfies(FIXED_PRERENDER_BROWSER_VERSIONS)) ??
    false
  );
}

/**
 * Returns the name of the browser
 *
 * @param bowser - optional Bowser instance to check against
 * @returns The name of the browser
 */
export function getBrowserName(
  bowser: Bowser.Parser.Parser = Bowser.getParser(window.navigator.userAgent),
): string {
  return bowser.getBrowserName();
}

/**
 * Checks whether the current browser is Firefox.
 *
 * @param args - Same optional `[bowser]` accepted by {@link getBrowserName}.
 * @returns Whether the host browser is Firefox (MV2 extension build).
 */
export function isFirefoxBrowser(
  ...args: Parameters<typeof getBrowserName>
): boolean {
  return getBrowserName(...args) === PLATFORM_FIREFOX;
}

/**
 * Open this extension's camera permissions in Chrome's site settings.
 *
 * @returns Chrome site-details URL for the running extension.
 */
export function getChromeExtensionCameraSiteSettingsUrl(): string {
  const site = encodeURIComponent(browser.runtime.getURL('/'));
  return `chrome://settings/content/siteDetails?site=${site}`;
}

/**
 * Shortened `moz-extension://…` origin so users can match Firefox camera
 * permission entries. Only meaningful on Firefox; on other browsers the
 * `moz-extension://` URL scheme is not used and this returns an empty string.
 *
 * @returns Display string, or empty string if unavailable.
 */
export function getMozExtensionOriginForDisplay(): string {
  try {
    const url = browser.runtime.getURL('');
    const match = /^moz-extension:\/\/([^/]+)/u.exec(url);
    if (!match) {
      return url;
    }
    const uuid = match[1];
    const compact = uuid.replaceAll('-', '');
    if (compact.length <= 15) {
      return `moz-extension://${uuid}`;
    }
    return `moz-extension://${compact.slice(0, 8)}…${compact.slice(-7)}`;
  } catch {
    return '';
  }
}

/**
 * Bridges webextension-polyfill `Runtime.Port` to APIs typed against `chrome.runtime.Port`.
 * @param port
 */
export function asChromeRuntimePort(port: Runtime.Port): chrome.runtime.Port {
  return port as chrome.runtime.Port;
}
