import { getText } from '../../helpers/utils/text';
import { getNotificationsSettingsSectionConfigs } from './notifications-settings-types';

describe('getNotificationsSettingsSectionConfigs', () => {
  const t = ((key: string) => key) as typeof getText;

  it('does not offer marketing notifications', () => {
    const sections = getNotificationsSettingsSectionConfigs(t);

    expect(sections.map(({ type }) => type)).not.toContain('marketing');
  });
});
