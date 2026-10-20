import React, { memo } from 'react';
import {
  AlignItems,
  Display,
  JustifyContent,
  TextColor,
  TextVariant,
} from '../../../../../helpers/constants/design-system';
import { getText } from '../../../../../helpers/utils/text';
import { Box } from '../../../../component-library/box';
import { Text } from '../../../../component-library/text';

/**
 * AdditionalNetworksInfo Component
 *
 * Displays the "Additional networks" section label in the network manager.
 */
export const AdditionalNetworksInfo = memo(() => {
  const t = getText;

  return (
    <Box paddingTop={4} paddingBottom={4} paddingRight={4} paddingLeft={4}>
      <Box display={Display.Flex} justifyContent={JustifyContent.spaceBetween}>
        {/* Container for the "Additional Networks" text */}
        <Box display={Display.Flex} alignItems={AlignItems.center}>
          {/* Label text - uses translation key "additionalNetworks" */}
          <Text
            color={TextColor.textAlternative}
            variant={TextVariant.bodyMdMedium}
          >
            {t('additionalNetworks')}
          </Text>
        </Box>
      </Box>
    </Box>
  );
});
