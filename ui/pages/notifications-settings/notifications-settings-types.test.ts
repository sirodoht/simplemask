import { useI18nContext } from '../../hooks/useI18nContext';
import { getNotificationsSettingsSectionConfigs } from './notifications-settings-types';

describe('getNotificationsSettingsSectionConfigs', () => {
  const t = ((key: string) => key) as ReturnType<typeof useI18nContext>;

  it('does not offer marketing notifications', () => {
    const sections = getNotificationsSettingsSectionConfigs(t);

    expect(sections.map(({ type }) => type)).not.toContain('marketing');
  });
});
