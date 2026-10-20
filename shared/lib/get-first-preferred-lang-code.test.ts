import browser from 'webextension-polyfill';
import getFirstPreferredLangCode from './get-first-preferred-lang-code';

jest.mock('webextension-polyfill', () => ({
  i18n: { getAcceptLanguages: jest.fn() },
}));

describe('getFirstPreferredLangCode', () => {
  it('uses English without consulting browser language preferences', async () => {
    jest
      .mocked(browser.i18n.getAcceptLanguages)
      .mockResolvedValue(['ar', 'ja']);
    expect(await getFirstPreferredLangCode()).toBe('en');
    expect(browser.i18n.getAcceptLanguages).not.toHaveBeenCalled();
  });
});
