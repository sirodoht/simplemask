import React from 'react';

import { Text } from '../../../../components/component-library';
import { getText } from '../../../../helpers/utils/text';
// eslint-disable-next-line import-x/no-restricted-paths -- TODO(ADR-0021): route-isolation backlog
import { SnapAccountCard } from '../../../remove-snap-account/snap-account-card';

const SnapAccountSuccessMessage = ({
  message,
  address,
  learnMoreLink,
}: {
  message: string;
  address: string;
  learnMoreLink?: string;
}) => {
  const t = getText;

  return (
    <>
      <SnapAccountCard address={address} />
      <Text data-testid="snap-account-success-message-text">
        {message}
        {Boolean(learnMoreLink) && (
          <>
            {' '}
            <a
              data-testid="snap-account-success-message-learn-more-link"
              href={learnMoreLink}
              rel="noopener noreferrer"
              target="_blank"
            >
              {t('learnMoreUpperCase') as string}
            </a>
          </>
        )}
      </Text>
    </>
  );
};

export default SnapAccountSuccessMessage;
