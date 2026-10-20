import React, { memo, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { SECOND } from '../../../../shared/constants/time';
import { ENVIRONMENT_TYPE_SIDEPANEL } from '../../../../shared/constants/app';
import { getEnvironmentType } from '../../../../shared/lib/environment-type';
import { PRIVACY_POLICY_LINK } from '../../../../shared/lib/ui-utils';
import {
  BorderRadius,
  IconColor,
  TextVariant,
} from '../../../helpers/constants/design-system';
import {
  DEFAULT_ROUTE,
  REVEAL_SEED_ROUTE,
  SETTINGS_ROUTE,
} from '../../../helpers/constants/routes';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { toggleDefaultView } from '../../../store/actions';
import { Icon, IconName, IconSize } from '../../component-library';
import { Toast, ToastContainer } from '../../multichain';
import { SurveyToast } from '../../ui/survey-toast/survey-toast';
import { StorageWriteErrorType } from '../../../../shared/constants/app-state';
import { BasicFunctionalityMigrationToast } from '../basic-functionality-migration-toast';
import { ArcUsageNoticeToast } from '../arc-usage-notice-toast';
import { useDispatch } from '../../../store/hooks';

import {
  MetaMetricsEventCategory,
  MetaMetricsEventName,
} from '../../../../shared/constants/metametrics';
import {
  selectShowPrivacyPolicyToast,
  selectNewPrivacyPolicyToastShownDate,
  selectShowStorageErrorToast,
  selectStorageWriteErrorType,
  selectShowInfuraSwitchToast,
  selectShowSidePanelMigrationToast,
} from './selectors';
import {
  setNewPrivacyPolicyToastClickedOrClosed,
  setNewPrivacyPolicyToastShownDate,
  setShowInfuraSwitchToast,
  dismissSidePanelMigrationToast,
} from './utils';

// Memoized to prevent re-renders when ToastMaster re-renders due to location changes.
const MemoizedSurveyToast = memo(SurveyToast);
const MemoizedPrivacyPolicyToast = memo(PrivacyPolicyToast);
const MemoizedInfuraSwitchToast = memo(InfuraSwitchToast);
const MemoizedSidePanelMigrationToast = memo(SidePanelMigrationToast);
const MemoizedBasicFunctionalityMigrationToast = memo(
  BasicFunctionalityMigrationToast,
);
const MemoizedStorageErrorToast = memo(StorageErrorToast);
const MemoizedArcUsageNoticeToast = memo(ArcUsageNoticeToast);

export function ToastMaster() {
  const location = useLocation();

  // Check if storage error toast should be shown (needed for conditional rendering on other screens)
  // The selector includes all conditions: flag is true, onboarding complete, and unlocked
  const shouldShowStorageErrorToast = useSelector(selectShowStorageErrorToast);

  // Get current pathname from React Router
  const currentPathname = location?.pathname ?? DEFAULT_ROUTE;
  const onHomeScreen = currentPathname === DEFAULT_ROUTE;
  const onSettingsScreen = currentPathname.startsWith(SETTINGS_ROUTE);

  // BFT migration toast must appear on any screen (including confirmation /
  // notification) so users cannot complete a tx before seeing it.
  const basicFunctionalityMigrationToast = (
    <MemoizedBasicFunctionalityMigrationToast key="basic-functionality-migration" />
  );

  if (onHomeScreen) {
    return (
      <ToastContainer>
        <MemoizedStorageErrorToast />
        <MemoizedSurveyToast />
        <MemoizedPrivacyPolicyToast />
        <MemoizedArcUsageNoticeToast />
        <MemoizedInfuraSwitchToast />

        <MemoizedSidePanelMigrationToast />
        {basicFunctionalityMigrationToast}
      </ToastContainer>
    );
  }

  if (onSettingsScreen) {
    return (
      <ToastContainer>
        <MemoizedStorageErrorToast />
        {basicFunctionalityMigrationToast}
      </ToastContainer>
    );
  }

  // On other screens, always mount a container so the BFT migration toast can
  // show (e.g. confirmation / notification). Storage-error toast stays optional.
  return (
    <ToastContainer>
      {shouldShowStorageErrorToast ? <MemoizedStorageErrorToast /> : null}
      {basicFunctionalityMigrationToast}
    </ToastContainer>
  );
}

function PrivacyPolicyToast() {
  const t = useI18nContext();

  const showPrivacyPolicyToast = useSelector(selectShowPrivacyPolicyToast);
  const newPrivacyPolicyToastShownDate = useSelector(
    selectNewPrivacyPolicyToastShownDate,
  );

  // If the privacy policy toast is shown, and there is no date set, set it
  if (showPrivacyPolicyToast && !newPrivacyPolicyToastShownDate) {
    setNewPrivacyPolicyToastShownDate(Date.now());
  }

  return (
    showPrivacyPolicyToast && (
      <Toast
        key="privacy-policy-toast"
        startAdornment={
          <Icon name={IconName.Info} color={IconColor.iconDefault} />
        }
        text={t('newPrivacyPolicyTitle')}
        actionText={t('newPrivacyPolicyActionButton')}
        onActionClick={() => {
          global.platform.openTab({
            url: PRIVACY_POLICY_LINK,
          });
          setNewPrivacyPolicyToastClickedOrClosed();
        }}
        onClose={setNewPrivacyPolicyToastClickedOrClosed}
      />
    )
  );
}

function InfuraSwitchToast() {
  const t = useI18nContext();
  const dispatch = useDispatch();

  const showInfuraSwitchToast = useSelector(selectShowInfuraSwitchToast);
  const autoHideDelay = 5 * SECOND;

  return (
    showInfuraSwitchToast && (
      <Toast
        key="infura-switch-toast"
        dataTestId="infura-switch-toast"
        text={t('updatedToMetaMaskDefault')}
        startAdornment={
          <Icon name={IconName.CheckBold} color={IconColor.iconDefault} />
        }
        onClose={() => dispatch(setShowInfuraSwitchToast(false))}
        autoHideTime={autoHideDelay}
        onAutoHideToast={() => dispatch(setShowInfuraSwitchToast(false))}
      />
    )
  );
}

function StorageErrorToast() {
  const t = useI18nContext();
  const navigate = useNavigate();
  const { trackEvent, createEventBuilder } = useAnalytics();
  const [isDismissed, setIsDismissed] = useState(false);
  const hasTrackedViewRef = useRef(false);

  // Selector includes all conditions: flag is true, onboarding complete, and unlocked
  const showStorageErrorToast = useSelector(selectShowStorageErrorToast);
  const storageWriteErrorType = useSelector(selectStorageWriteErrorType);

  // Only show toast if selector returns true and user hasn't dismissed it
  const shouldShow = showStorageErrorToast && !isDismissed;

  // Show disk space-specific message when error is due to no space
  const isNoSpaceError =
    storageWriteErrorType === StorageWriteErrorType.FileErrorNoSpace;
  const description = isNoSpaceError
    ? t('storageErrorDescriptionNoSpace')
    : t('storageErrorDescriptionDefault');

  // Track "Viewed" event when toast becomes visible
  useEffect(() => {
    if (shouldShow && !hasTrackedViewRef.current) {
      trackEvent(
        createEventBuilder(MetaMetricsEventName.StorageErrorToastViewed)
          .addCategory(MetaMetricsEventCategory.Error)
          .build(),
      );
      hasTrackedViewRef.current = true;
    }
  }, [shouldShow, trackEvent, createEventBuilder]);

  const handleRevealSrpClick = () => {
    trackEvent(
      createEventBuilder(
        MetaMetricsEventName.StorageErrorToastBackupSrpButtonPressed,
      )
        .addCategory(MetaMetricsEventCategory.Error)
        .build(),
    );
    setIsDismissed(true);
    navigate(REVEAL_SEED_ROUTE, { state: { skipQuiz: true } });
  };

  const handleClose = () => {
    trackEvent(
      createEventBuilder(MetaMetricsEventName.StorageErrorToastDismissed)
        .addCategory(MetaMetricsEventCategory.Error)
        .build(),
    );
    setIsDismissed(true);
  };

  // Only show action button for default errors (not for no-space errors)
  const actionProps = isNoSpaceError
    ? {}
    : {
        actionText: t('storageErrorAction'),
        onActionClick: handleRevealSrpClick,
      };

  return (
    shouldShow && (
      <Toast
        key="storage-error-toast"
        dataTestId="storage-error-toast"
        startAdornment={
          <Icon
            name={IconName.Danger}
            color={IconColor.errorDefault}
            size={IconSize.Lg}
          />
        }
        text={t('storageErrorTitle')}
        description={description}
        {...actionProps}
        borderRadius={BorderRadius.LG}
        textVariant={TextVariant.bodyMd}
        onClose={handleClose}
      />
    )
  );
}

function SidePanelMigrationToast() {
  const t = useI18nContext();
  const dispatch = useDispatch();

  const showSidePanelMigrationToast = useSelector(
    selectShowSidePanelMigrationToast,
  );

  const isSidePanel = getEnvironmentType() === ENVIRONMENT_TYPE_SIDEPANEL;

  const handleSwitchBackToPopup = async () => {
    try {
      await dispatch(toggleDefaultView());
    } finally {
      dismissSidePanelMigrationToast();
    }
  };

  return (
    showSidePanelMigrationToast &&
    isSidePanel && (
      <Toast
        key="side-panel-migration-toast"
        dataTestId="side-panel-migration-toast"
        startAdornment={
          <Icon name={IconName.Info} color={IconColor.iconDefault} />
        }
        text={t('sidePanelMigrationToast', [
          <button
            key="side-panel-migration-switch-back"
            type="button"
            onClick={handleSwitchBackToPopup}
            className="inline h-auto min-h-0 cursor-pointer bg-transparent p-0 align-baseline text-inherit underline underline-offset-[0.25em]"
          >
            {t('switchBackToPopup')}
          </button>,
        ])}
        borderRadius={BorderRadius.LG}
        textVariant={TextVariant.bodyMd}
        onClose={() => dismissSidePanelMigrationToast()}
      />
    )
  );
}
