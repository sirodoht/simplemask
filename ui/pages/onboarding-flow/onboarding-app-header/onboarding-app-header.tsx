import React, { useMemo } from 'react';
import type { Location as RouterLocation } from 'react-router-dom';
import classnames from 'clsx';
import {
  Box,
  BoxJustifyContent,
  BoxBackgroundColor,
  Text,
  TextColor,
  TextVariant,
  Icon,
  IconName,
  IconColor,
  IconSize,
  BoxFlexDirection,
} from '@metamask/design-system-react';
import {
  BackgroundColor,
  BorderColor,
} from '../../../helpers/constants/design-system';
import MetaFoxLogo from '../../../components/ui/metafox-logo';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { BannerTip } from '../../../components/component-library';
import {
  ONBOARDING_COMPLETION_ROUTE,
  ONBOARDING_WELCOME_ROUTE,
} from '../../../helpers/constants/routes';
import { getEnvironmentType } from '../../../../shared/lib/environment-type';
import { ENVIRONMENT_TYPE_SIDEPANEL } from '../../../../shared/constants/app';
import { useOnboardingSearchParams } from '../hooks/useOnboardingSearchParams';

type OnboardingAppHeaderProps = {
  isWelcomePage: boolean;
  location: RouterLocation;
};

export default function OnboardingAppHeader({
  isWelcomePage = false,
  location,
}: OnboardingAppHeaderProps) {
  const { pathname } = location;
  const t = useI18nContext();
  const { isFromReminder, isFromSettingsSecurity } =
    useOnboardingSearchParams();
  const isFromSettingsSRPBackup = isFromReminder || isFromSettingsSecurity;

  // We don't wanna show the logo in the sidepanel view
  const showLogo = useMemo(() => {
    const windowType = getEnvironmentType();
    return windowType !== ENVIRONMENT_TYPE_SIDEPANEL;
  }, []);

  return (
    <Box
      backgroundColor={BoxBackgroundColor.BackgroundDefault}
      padding={4}
      className={classnames('onboarding-app-header w-full', {
        'onboarding-app-header--welcome': isWelcomePage,
      })}
    >
      {showLogo ? (
        <Box
          flexDirection={BoxFlexDirection.Row}
          justifyContent={
            pathname === ONBOARDING_WELCOME_ROUTE
              ? BoxJustifyContent.End
              : BoxJustifyContent.Between
          }
          className="onboarding-app-header__contents w-full mx-auto"
        >
          {pathname !== ONBOARDING_WELCOME_ROUTE && (
            <MetaFoxLogo unsetIconHeight isOnboarding />
          )}

          {pathname === ONBOARDING_COMPLETION_ROUTE &&
          !isFromSettingsSRPBackup ? (
            <Box
              paddingTop={12}
              className="onboarding-app-header__banner-tip-container"
            >
              <BannerTip
                borderColor={BorderColor.borderMuted}
                backgroundColor={BackgroundColor.backgroundMuted}
                title={t('pinMetaMask')}
                className="onboarding-app-header__banner-tip"
                padding={3}
              >
                <Text
                  variant={TextVariant.BodySm}
                  color={TextColor.TextAlternative}
                  className="flex items-center pr-2"
                >
                  {t('pinMetaMaskDescription', [
                    <Icon
                      name={IconName.Extension}
                      key="extension"
                      color={IconColor.IconDefault}
                      size={IconSize.Md}
                      className="onboarding-app-header__banner-tip-icon"
                    />,
                    <Icon
                      name={IconName.Keep}
                      key="keep"
                      color={IconColor.IconDefault}
                      size={IconSize.Md}
                      className="onboarding-app-header__banner-tip-icon"
                    />,
                  ])}
                </Text>
              </BannerTip>
            </Box>
          ) : null}
        </Box>
      ) : (
        <></>
      )}
    </Box>
  );
}
