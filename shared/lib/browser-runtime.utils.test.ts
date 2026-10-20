import Bowser from 'bowser';
import browser from 'webextension-polyfill';
import log from 'loglevel';
import * as BrowserRuntimeUtil from './browser-runtime.utils';

const mockLastError = { message: 'error', stack: [] as string[] };

let mockRuntimeLastError: { message: string; stack?: string[] } | undefined;

const mockGetURL = browser.runtime.getURL as jest.MockedFunction<
  typeof browser.runtime.getURL
>;

jest.mock('webextension-polyfill', () => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention -- Jest ESM interop
  __esModule: true,
  default: {
    runtime: {
      get lastError() {
        return mockRuntimeLastError;
      },
      getURL: jest.fn(),
    },
  },
}));

describe('Browser Runtime Utils', () => {
  beforeEach(() => {
    mockRuntimeLastError = undefined;
    mockGetURL.mockReset();
  });

  describe('checkForLastError', () => {
    it('returns undefined if no lastError found', () => {
      expect(BrowserRuntimeUtil.checkForLastError()).toBeUndefined();
    });

    it('returns the lastError (Error object) if lastError is found', () => {
      mockRuntimeLastError = mockLastError;

      expect(BrowserRuntimeUtil.checkForLastError()).toStrictEqual(
        mockLastError,
      );
    });

    it('returns an Error object if the lastError is found with no stack', () => {
      mockRuntimeLastError = { message: mockLastError.message };

      const result = BrowserRuntimeUtil.checkForLastError();

      expect(result).toStrictEqual(expect.any(Error));
      expect(result).toHaveProperty('stack');
      expect((result as Error).message).toBe(mockLastError.message);
    });
  });

  describe('checkForLastErrorAndLog', () => {
    it('logs and returns error if error was found', () => {
      mockRuntimeLastError = { ...mockLastError };
      const logErrorSpy = jest
        .spyOn(log, 'error')
        .mockImplementation(() => undefined);

      const result = BrowserRuntimeUtil.checkForLastErrorAndLog();

      expect(logErrorSpy).toHaveBeenCalledWith(result);
      expect(result).toStrictEqual(mockLastError);
    });
  });

  describe('getBrowserName', () => {
    it('returns the name of the browser', () => {
      const bowser = Bowser.getParser(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:78.0) Gecko/20100101 Firefox/91.0',
      );
      const result = BrowserRuntimeUtil.getBrowserName(bowser);
      expect(result).toStrictEqual('Firefox');
    });
  });

  describe('isFirefoxBrowser', () => {
    it('uses window.navigator defaults when called with no arguments', () => {
      const getParserSpy = jest.spyOn(Bowser, 'getParser');
      const explicit = BrowserRuntimeUtil.isFirefoxBrowser(
        Bowser.getParser(window.navigator.userAgent),
      );
      getParserSpy.mockClear();

      const implicit = BrowserRuntimeUtil.isFirefoxBrowser();

      expect(getParserSpy).toHaveBeenCalledTimes(1);
      expect(getParserSpy).toHaveBeenCalledWith(window.navigator.userAgent);
      expect(implicit).toBe(explicit);
      getParserSpy.mockRestore();
    });

    it('returns true for Firefox user agent', () => {
      const bowser = Bowser.getParser(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0',
      );
      expect(BrowserRuntimeUtil.isFirefoxBrowser(bowser)).toBe(true);
    });

    it('returns false for Chrome user agent', () => {
      const bowser = Bowser.getParser(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      );
      expect(BrowserRuntimeUtil.isFirefoxBrowser(bowser)).toBe(false);
    });
  });
  describe('getChromeExtensionCameraSiteSettingsUrl', () => {
    it('uses the running extension origin for Chrome camera settings', () => {
      const root = 'chrome-extension://hebhblbkkdabgoldnojllkipeoacjioc/';
      mockGetURL.mockReturnValue(root);
      expect(BrowserRuntimeUtil.getChromeExtensionCameraSiteSettingsUrl()).toBe(
        `chrome://settings/content/siteDetails?site=${encodeURIComponent(root)}`,
      );
    });
  });

  describe('getMozExtensionOriginForDisplay', () => {
    it('returns a truncated moz-extension origin', () => {
      mockGetURL.mockReturnValue(
        'moz-extension://ab5f75ae-cfd3-4ace-830e-155830d4aa03/',
      );
      expect(BrowserRuntimeUtil.getMozExtensionOriginForDisplay()).toBe(
        'moz-extension://ab5f75ae…0d4aa03',
      );
    });

    it('returns the full getURL string when it is not a moz-extension origin', () => {
      const chromeUrl = 'chrome-extension://abcdefghijklmnopqrstuvwxyz012345/';
      mockGetURL.mockReturnValue(chromeUrl);

      expect(BrowserRuntimeUtil.getMozExtensionOriginForDisplay()).toBe(
        chromeUrl,
      );
    });

    it('returns full moz-extension URL when the id is short after removing hyphens', () => {
      mockGetURL.mockReturnValue('moz-extension://abc-def-ghi/');

      expect(BrowserRuntimeUtil.getMozExtensionOriginForDisplay()).toBe(
        'moz-extension://abc-def-ghi',
      );
    });

    it('returns full moz-extension URL when compact id length is exactly 15', () => {
      mockGetURL.mockReturnValue('moz-extension://abcdefghijklmno/');

      expect(BrowserRuntimeUtil.getMozExtensionOriginForDisplay()).toBe(
        'moz-extension://abcdefghijklmno',
      );
    });

    it('returns empty string when runtime.getURL throws', () => {
      mockGetURL.mockImplementation(() => {
        throw new Error('unavailable');
      });

      expect(BrowserRuntimeUtil.getMozExtensionOriginForDisplay()).toBe('');
    });
  });
});
