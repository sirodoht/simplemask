import { t, getCurrentLocale } from './translate';

describe('English messages', () => {
  it('renders messages from the English catalog', () => {
    expect(getCurrentLocale()).toBe('en');
    expect(t('cancel')).toBe('Cancel');
    expect(t('activity')).toBe('Activity');
  });
});
