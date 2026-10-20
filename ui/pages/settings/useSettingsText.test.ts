import { renderHook } from '@testing-library/react';
import { getText } from '../../helpers/utils/text';
import { useSettingsText } from './useSettingsText';

jest.mock('../../../shared/lib/passkey', () => ({
  getPasskeyAuthMethodKey: jest.fn(() => 'passkeyAuthMethodBiometrics'),
}));

jest.mock('../../helpers/utils/text');

const mockGetText = jest.mocked(getText);

const { getPasskeyAuthMethodKey } = jest.requireMock<
  typeof import('../../../shared/lib/passkey')
>('../../../shared/lib/passkey');

describe('useSettingsText', () => {
  beforeEach(() => {
    mockGetText.mockReset();
  });

  it('forwards to raw t when substitutions are passed', () => {
    const rawT = jest.fn(() => 'forwarded');
    mockGetText.mockImplementation(rawT);

    const { result } = renderHook(() => useSettingsText());
    expect(result.current('settingsSearchCantFindSetting', [{}])).toBe(
      'forwarded',
    );

    expect(rawT).toHaveBeenCalledWith('settingsSearchCantFindSetting', [{}]);
  });

  it('fills passkey placeholder for unlockWithPasskey when only key is passed', () => {
    const rawT = jest.fn((key: string, substitutions?: string[]) => {
      if (key === 'passkeyAuthMethodBiometrics') {
        return 'Biometrics';
      }
      if (key === 'unlockWithPasskey' && substitutions?.[0] === 'Biometrics') {
        return 'Unlock with Biometrics';
      }
      return key;
    });
    mockGetText.mockImplementation(rawT);

    const { result } = renderHook(() => useSettingsText());
    expect(result.current('unlockWithPasskey')).toBe('Unlock with Biometrics');
    expect(getPasskeyAuthMethodKey).toHaveBeenCalled();
    expect(rawT).toHaveBeenCalledWith('passkeyAuthMethodBiometrics');
    expect(rawT).toHaveBeenCalledWith('unlockWithPasskey', ['Biometrics']);
  });

  it('fills passkey placeholder for setUpPasskey and turnOffPasskey', () => {
    const rawT = jest.fn((key: string, substitutions?: string[]) => {
      if (key === 'passkeyAuthMethodBiometrics') {
        return 'X';
      }
      if (substitutions?.[0] === 'X') {
        return `${key} done`;
      }
      return key;
    });
    mockGetText.mockImplementation(rawT);

    const { result } = renderHook(() => useSettingsText());
    expect(result.current('setUpPasskey')).toBe('setUpPasskey done');
    expect(result.current('turnOffPasskey')).toBe('turnOffPasskey done');
  });

  it('delegates to raw t for keys without passkey substitution', () => {
    const rawT = jest.fn((key: string) => `:${key}:`);
    mockGetText.mockImplementation(rawT);

    const { result } = renderHook(() => useSettingsText());
    expect(result.current('theme')).toBe(':theme:');
    expect(rawT).toHaveBeenCalledWith('theme');
  });
});
