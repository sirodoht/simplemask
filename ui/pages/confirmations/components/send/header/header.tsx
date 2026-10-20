import React, { useCallback } from 'react';

import {
  AlignItems,
  Display,
  JustifyContent,
  TextVariant,
} from '../../../../../helpers/constants/design-system';
import {
  Box,
  ButtonIcon,
  ButtonIconSize,
  IconName,
  Text,
} from '../../../../../components/component-library';
import { getText } from '../../../../../helpers/utils/text';
import { useNavigateSendPage } from '../../../hooks/send/useNavigateSendPage';
import { transitionBack } from '../../../../../components/ui/transition';

export const Header = () => {
  const t = getText;
  const { goToPreviousPage } = useNavigateSendPage();

  const handleBack = useCallback(() => {
    transitionBack(goToPreviousPage);
  }, [goToPreviousPage]);

  return (
    <Box
      alignItems={AlignItems.center}
      className="send-header__wrapper"
      display={Display.Flex}
      justifyContent={JustifyContent.center}
    >
      <ButtonIcon
        ariaLabel="go to previous page"
        className="send-header__previous-btn"
        iconName={IconName.ArrowLeft}
        onClick={handleBack}
        size={ButtonIconSize.Md}
      />
      <Text variant={TextVariant.headingSm}>{t('send')}</Text>
    </Box>
  );
};
