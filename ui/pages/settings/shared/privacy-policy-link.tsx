import React from 'react';

import { TextButton } from '@metamask/design-system-react';
import { getText } from '../../../helpers/utils/text';
import { CONSENSYS_PRIVACY_LINK } from '../../../../shared/lib/ui-utils';

export const PrivacyPolicyLink = () => {
  const t = getText;

  return (
    <TextButton asChild>
      <a
        href={CONSENSYS_PRIVACY_LINK}
        target="_blank"
        rel="noopener noreferrer"
      >
        {t('privacyMsg')}
      </a>
    </TextButton>
  );
};
