import React from 'react';

import { FontWeight } from '../../../../../helpers/constants/design-system';
import { Text } from '../../../../component-library';
import {
  TranslateFunction,
  networkTitleOverrides,
} from '../../util/networkTitleOverrides';
import { getText } from '../../../../../helpers/utils/text';

type AssetCellTitleProps = {
  title: string;
};

export const AssetCellTitle = ({ title }: AssetCellTitleProps) => {
  const t = getText;

  // non-ellipsized title
  return (
    <Text
      fontWeight={FontWeight.Medium}
      className="text-s-body-md @compact:text-s-body-sm"
      ellipsis
      data-testid="multichain-token-list-item-token-name"
    >
      {networkTitleOverrides(t as TranslateFunction, { title })}
    </Text>
  );
};
