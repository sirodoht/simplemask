import React from 'react';
import {
  Box,
  BoxAlignItems,
  BoxFlexDirection,
  BoxJustifyContent,
  Text,
  TextColor,
  TextVariant,
} from '@metamask/design-system-react';
import { ThemeType } from '../../../../../../shared/constants/preferences';
import { useI18nContext } from '../../../../../hooks/useI18nContext';
import { useTheme } from '../../../../../hooks/useTheme';

export const BatchSellEmptySelectTokens = () => {
  const t = useI18nContext();
  const theme = useTheme();

  const defiIcon =
    theme === ThemeType.dark
      ? '/images/empty-state-defi-dark.png'
      : '/images/empty-state-defi-light.png';

  return (
    <Box
      flexDirection={BoxFlexDirection.Column}
      className="h-full w-full"
      data-testid="batch-sell-select-empty-page"
    >
      <Box
        alignItems={BoxAlignItems.Center}
        justifyContent={BoxJustifyContent.Center}
        flexDirection={BoxFlexDirection.Column}
        gap={3}
        padding={4}
        className="flex-1"
      >
        <img alt={t('defiIcon')} src={defiIcon} className="h-[72px] w-[72px]" />
        <Box
          flexDirection={BoxFlexDirection.Column}
          alignItems={BoxAlignItems.Center}
          gap={3}
          paddingHorizontal={4}
        >
          <Text
            variant={TextVariant.BodyMd}
            color={TextColor.TextAlternative}
            className="w-[240px] text-center"
          >
            {t('batchSellEmptyStateDescription')}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};
