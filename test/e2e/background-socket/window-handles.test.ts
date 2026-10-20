import type { ThenableWebDriver } from 'selenium-webdriver';
import { WindowHandles } from './window-handles';

jest.mock('./server-mocha-to-background', () => ({
  getServerMochaToBackground: () => ({
    waitUntilWindowWithProperty: jest.fn(),
  }),
}));

describe('WindowHandles', () => {
  it('waits for WebDriver to discover a window already reported by the extension', async () => {
    let current = 'home';
    const getAllWindowHandles = jest
      .fn()
      .mockResolvedValueOnce(['home'])
      .mockResolvedValue(['home', 'dialog']);
    const driver = {
      getAllWindowHandles,
      switchTo: () => ({
        window: async (id: string) => {
          current = id;
        },
      }),
      getTitle: async () =>
        current === 'dialog' ? 'MetaMask Dialog' : 'MetaMask',
      getCurrentUrl: async () => `chrome-extension://wallet/${current}.html`,
      wait: async (condition: () => Promise<string | undefined>) => {
        for (let attempt = 0; attempt < 3; attempt++) {
          const result = await condition();
          if (result) {
            return result;
          }
        }
        throw new Error('Timed out');
      },
    } as unknown as ThenableWebDriver;
    expect(
      await new WindowHandles(driver).switchToWindowWithProperty(
        'title',
        'MetaMask Dialog',
      ),
    ).toBe('dialog');
    expect(getAllWindowHandles).toHaveBeenCalledTimes(2);
  });

  it('waits for a title even when the URL is already available', async () => {
    const getTitle = jest
      .fn()
      .mockResolvedValueOnce('')
      .mockResolvedValue('MetaMask Dialog');
    const driver = {
      getWindowHandle: async () => 'dialog',
      getTitle,
      getCurrentUrl: async () => 'chrome-extension://wallet/notification.html',
      sleep: jest.fn(),
    } as unknown as ThenableWebDriver;
    expect(
      await new WindowHandles(driver).getCurrentWindowProperties('title'),
    ).toBe('MetaMask Dialog');
    expect(getTitle).toHaveBeenCalledTimes(2);
  });
});
