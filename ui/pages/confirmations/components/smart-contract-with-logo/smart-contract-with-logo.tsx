import React from 'react';

import {
  AlignItems,
  BorderRadius,
  Display,
  FlexDirection,
  TextColor,
} from '../../../../helpers/constants/design-system';
import { Box, Text } from '../../../../components/component-library';
import { getText } from '../../../../helpers/utils/text';

function SmartContractWithLogo() {
  const t = getText;
  return (
    <Box
      display={Display.Flex}
      flexDirection={FlexDirection.Row}
      alignItems={AlignItems.center}
      borderRadius={BorderRadius.pill}
    >
      <img src="images/logo/metamask-fox.svg" width="16" height="16" />
      <Text marginLeft={2} color={TextColor.inherit}>
        {t('interactWithSmartContract')}
      </Text>
    </Box>
  );
}

export default SmartContractWithLogo;
