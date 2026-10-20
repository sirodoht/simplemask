import React from 'react';

import { Box } from '@metamask/design-system-react';
import { getText } from '../../../helpers/utils/text';
import { AccountOverviewCommonProps } from './common';
import { AccountOverviewLayout } from './account-overview-layout';

export type AccountOverviewUnknownProps = AccountOverviewCommonProps;

export const AccountOverviewUnknown = (props: AccountOverviewUnknownProps) => {
  const t = getText;

  return (
    <AccountOverviewLayout showTokens={false} showActivity={true} {...props}>
      <Box className="account-overview-unknown__empty">
        <Box className="account-overview-unknown__empty-text">
          <span>{t('accountTypeNotSupported')}</span>
        </Box>
      </Box>
    </AccountOverviewLayout>
  );
};
