import React from 'react';

import { IconName, IconSize } from '@metamask/design-system-react';
import { Tag } from '../../../component-library';
import { getText } from '../../../../helpers/utils/text';

type StockBadgeProps = {
  isMarketClosed: boolean;
};

export const StockBadge = ({ isMarketClosed }: StockBadgeProps) => {
  const t = getText;

  return (
    <Tag
      label={t('tokenStock')}
      {...(isMarketClosed
        ? { iconName: IconName.AfterHours, iconSize: IconSize.Xs }
        : {})}
    />
  );
};
