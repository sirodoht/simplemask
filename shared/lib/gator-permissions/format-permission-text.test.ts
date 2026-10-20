import { formatPermissionText } from './format-permission-text';

describe('formatPermissionText', () => {
  it('passes key and args to the i18n function', () => {
    const t = jest.fn().mockReturnValue('translated');
    const result = formatPermissionText(t, {
      key: 'someKey',
      args: [1, 'two'],
    });
    expect(t).toHaveBeenCalledWith('someKey', [1, 'two']);
    expect(result).toBe('translated');
  });

  it('omits args when undefined', () => {
    const t = jest.fn().mockReturnValue('ok');
    formatPermissionText(t, { key: 'plain' });
    expect(t).toHaveBeenCalledWith('plain', undefined);
  });
});
