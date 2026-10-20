import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Product,
  PRODUCT_TYPES,
  RECURRING_INTERVALS,
  Subscription,
  SUBSCRIPTION_STATUSES,
} from '@metamask/subscription-controller';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  BoxBackgroundColor,
  Button,
  ButtonVariant,
  Icon,
  IconColor,
  IconName,
  IconSize,
  Text,
  TextButton,
  TextColor,
  TextVariant,
  Skeleton,
} from '@metamask/design-system-react';
import { useSelector } from 'react-redux';
import { useI18nContext } from '../../../hooks/useI18nContext';
import {
  useSubscriptionError,
  useUserLastSubscriptionByProduct,
  useUserSubscriptionByProduct,
  useUserSubscriptions,
} from '../../../hooks/subscription/useSubscription';
import {
  DEFAULT_ROUTE,
  SHIELD_PLAN_ROUTE,
  TRANSACTION_SHIELD_CLAIM_ROUTES,
  TRANSACTION_SHIELD_MANAGE_PAST_PLAN_ROUTE,
  TRANSACTION_SHIELD_MANAGE_PLAN_ROUTE,
} from '../../../helpers/constants/routes';
import { TRANSACTION_SHIELD_LINK } from '../../../helpers/constants/common';
import { getProductPrice } from '../plan/utils';
import { useFormatters } from '../../../hooks/useFormatters';
import LoadingScreen from '../../../components/ui/loading-screen';
import AddFundsModal from '../../../components/app/modals/add-funds-modal/add-funds-modal';
import { useSubscriptionPricing } from '../../../hooks/subscription/useSubscriptionPricing';
import {
  getIsShieldSubscriptionEndingSoon,
  getIsShieldSubscriptionPaused,
  getIsShieldSubscriptionTrialing,
} from '../../../../shared/lib/shield';
import { useTimeout } from '../../../hooks/useTimeout';
import { MINUTE } from '../../../../shared/constants/time';
import { useSubscriptionMetrics } from '../../../hooks/shield/metrics/useSubscriptionMetrics';
import {
  ShieldMetricsSourceEnum,
  ShieldCtaActionClickedEnum,
  ShieldUnexpectedErrorEventLocationEnum,
} from '../../../../shared/constants/subscriptions';
import ApiErrorHandler from '../../../components/app/api-error-handler';
import { useHandlePayment } from '../../../hooks/subscription/useHandlePayment';
import { useDispatch } from '../../../store/hooks';
import { getIntlLocale } from '../../../ducks/locale/locale';
import { isCardPaymentMethod, isCryptoPaymentMethod } from './types';
import { formatOptionalDate } from './utils';
import {
  ButtonRow,
  ButtonRowContainer,
  MembershipErrorBanner,
  MembershipHeader,
} from './components';
import ReactivateButton from './components/reactivate-button';
import CryptoAccountDisplay from './components/crypto-account-display';

const TransactionShield = () => {
  const t = useI18nContext();
  const locale = useSelector(getIntlLocale);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { search } = useLocation();
  const { captureShieldCtaClickedEvent } = useSubscriptionMetrics();
  const { shieldSubscriptionApiError, getSubscriptionErrorMessage } =
    useSubscriptionError();

  const shouldWaitForSubscriptionCreation = useMemo(() => {
    const searchParams = new URLSearchParams(search);
    // param to wait for subscription creation happen in the background
    const waitForSubscriptionCreation = searchParams.get(
      'waitForSubscriptionCreation',
    );
    return waitForSubscriptionCreation === 'true';
  }, [search]);

  const { formatCurrency } = useFormatters();

  const {
    customerId,
    subscriptions,
    lastSubscription,
    loading: subscriptionsLoading,
    error: subscriptionsError,
  } = useUserSubscriptions({
    refetch: !shouldWaitForSubscriptionCreation, // always fetch latest subscriptions state in settings screen unless we are waiting for subscription creation (subscription is refetch in background)
  });
  const currentShieldSubscription = useUserSubscriptionByProduct(
    PRODUCT_TYPES.SHIELD,
    subscriptions,
  );
  const lastShieldSubscription = useUserLastSubscriptionByProduct(
    PRODUCT_TYPES.SHIELD,
    lastSubscription,
  );
  // show current active shield subscription or last subscription if no active subscription
  const displayedShieldSubscription:
    | (Subscription & { rewardAccountId?: string }) // TODO: fix this type once we have controller released.
    | undefined = currentShieldSubscription ?? lastShieldSubscription;

  const timeoutCancelledRef = useRef(false);
  useEffect(() => {
    // cancel timeout when component unmounts
    return () => {
      timeoutCancelledRef.current = true;
    };
  }, []);
  useEffect(() => {
    // cancel timeout when subscription is created
    if (currentShieldSubscription) {
      timeoutCancelledRef.current = true;
    }
  }, [currentShieldSubscription]);

  const startSubscriptionCreationTimeout = useTimeout(
    () => {
      if (timeoutCancelledRef.current) {
        return;
      }

      // nav back home after timeout and no subscription created
      navigate(DEFAULT_ROUTE);
    },
    MINUTE,
    false,
  );
  // trigger wait for subscription creation timeout
  useEffect(() => {
    if (shouldWaitForSubscriptionCreation) {
      startSubscriptionCreationTimeout?.();
    }
  }, [shouldWaitForSubscriptionCreation, startSubscriptionCreationTimeout]);

  const {
    subscriptionPricing,
    loading: subscriptionPricingLoading,
    error: subscriptionPricingError,
  } = useSubscriptionPricing({
    refetch: true, // need to refetch here in case user already subscribed and doesn't go through shield plan screen
  });

  const isCancelled =
    displayedShieldSubscription?.status === SUBSCRIPTION_STATUSES.canceled;
  const isPaused = getIsShieldSubscriptionPaused(subscriptions);
  const isTrialing = getIsShieldSubscriptionTrialing(subscriptions);
  const isMembershipInactive = isCancelled || isPaused;
  const isSubscriptionEndingSoon =
    getIsShieldSubscriptionEndingSoon(subscriptions);

  const isCryptoPayment =
    displayedShieldSubscription?.paymentMethod &&
    isCryptoPaymentMethod(displayedShieldSubscription?.paymentMethod);

  const productInfo = useMemo(
    () =>
      displayedShieldSubscription?.products.find(
        (p) => p.name === PRODUCT_TYPES.SHIELD,
      ),
    [displayedShieldSubscription],
  );

  const isWaitingForSubscriptionCreation =
    shouldWaitForSubscriptionCreation && !currentShieldSubscription;

  const showSkeletonLoader =
    isWaitingForSubscriptionCreation ||
    subscriptionsLoading ||
    subscriptionPricingLoading;

  // redirect to shield plan page if user doesn't have a subscription
  useEffect(() => {
    if (!shouldWaitForSubscriptionCreation && !displayedShieldSubscription) {
      navigate({
        pathname: SHIELD_PLAN_ROUTE,
        search: `?source=${ShieldMetricsSourceEnum.Settings}`,
      });
    }
  }, [
    shouldWaitForSubscriptionCreation,
    navigate,
    displayedShieldSubscription,
  ]);

  const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false);

  const trialDaysLeft = useMemo(() => {
    if (!isTrialing || !displayedShieldSubscription?.trialEnd) {
      return '';
    }
    const today = new Date();
    const trialEndDateDate = new Date(displayedShieldSubscription.trialEnd);
    const diffTime = Math.abs(trialEndDateDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays.toString();
  }, [displayedShieldSubscription, isTrialing]);

  const priceDetails = useMemo(() => {
    if (!displayedShieldSubscription || !productInfo) {
      return '';
    }
    const isYearly =
      displayedShieldSubscription.interval === RECURRING_INTERVALS.year;
    const price = isCryptoPaymentMethod(
      displayedShieldSubscription.paymentMethod,
    )
      ? `${getProductPrice(productInfo as Product)} ${displayedShieldSubscription.paymentMethod.crypto.tokenSymbol}`
      : formatCurrency(
          getProductPrice(productInfo as Product),
          productInfo?.currency.toUpperCase(),
          {
            maximumFractionDigits: 2,
            minimumFractionDigits: 0,
          },
        );
    return t(isYearly ? 'shieldPlanAnnualPrice' : 'shieldPlanMonthlyPrice', [
      price,
    ]);
  }, [displayedShieldSubscription, productInfo, t, formatCurrency]);

  const amountDetails = useMemo(() => {
    if (!displayedShieldSubscription) {
      return '';
    }

    return isTrialing
      ? t('shieldTxDetails1DescriptionTrial', [trialDaysLeft, priceDetails])
      : priceDetails;
  }, [displayedShieldSubscription, isTrialing, t, trialDaysLeft, priceDetails]);

  const paymentMethodDetails = useMemo(() => {
    if (!displayedShieldSubscription) {
      return '';
    }
    if (isCryptoPaymentMethod(displayedShieldSubscription.paymentMethod)) {
      return (
        <Text
          asChild
          variant={TextVariant.BodySm}
          color={TextColor.TextAlternative}
          className="flex items-center gap-1"
          data-testid="shield-detail-payment-method"
        >
          {t('shieldTxDetails3DescriptionCryptoWithAccount', [
            displayedShieldSubscription.paymentMethod.crypto.tokenSymbol,
            <CryptoAccountDisplay
              key="crypto-account-display"
              payerAddress={
                displayedShieldSubscription.paymentMethod.crypto.payerAddress
              }
              chainId={displayedShieldSubscription.paymentMethod.crypto.chainId}
              showIcon={false}
            />,
          ])}
        </Text>
      );
    }
    return t('shieldPlanCard');
  }, [displayedShieldSubscription, t]);

  const isCardPayment =
    currentShieldSubscription &&
    isCardPaymentMethod(currentShieldSubscription.paymentMethod);

  const {
    handlePaymentError,
    resultTriggerSubscriptionCheckInsufficientFunds,
    updateSubscriptionCardPaymentMethodResult,
    updateSubscriptionCryptoPaymentMethodResult,
    currentToken,
  } = useHandlePayment({
    currentShieldSubscription,
    displayedShieldSubscription,
    subscriptions,
    isCancelled: isCancelled ?? false,
    subscriptionPricing,
    onOpenAddFundsModal: () => setIsAddFundsModalOpen(true),
  });

  const hasApiError =
    subscriptionsError ||
    subscriptionPricingError ||
    updateSubscriptionCardPaymentMethodResult.error ||
    updateSubscriptionCryptoPaymentMethodResult.error ||
    resultTriggerSubscriptionCheckInsufficientFunds.error ||
    shieldSubscriptionApiError;
  const apiErrorMessage = getSubscriptionErrorMessage(hasApiError);

  const loading =
    updateSubscriptionCardPaymentMethodResult.pending ||
    updateSubscriptionCryptoPaymentMethodResult.pending ||
    resultTriggerSubscriptionCheckInsufficientFunds.pending;

  const handleViewFullBenefitsClicked = useCallback(() => {
    window.open(TRANSACTION_SHIELD_LINK, '_blank', 'noopener noreferrer');
    captureShieldCtaClickedEvent({
      source: ShieldMetricsSourceEnum.Settings,
      ctaActionClicked: ShieldCtaActionClickedEnum.ViewFullBenefits,
      redirectToUrl: TRANSACTION_SHIELD_LINK,
    });
  }, [captureShieldCtaClickedEvent]);

  if (!loading && hasApiError) {
    return (
      <Box
        className="transaction-shield-page w-full pb-4 overflow-y-auto"
        data-testid="transaction-shield-page"
      >
        <ApiErrorHandler
          className="transaction-shield-page__error-content mx-auto"
          error={hasApiError}
          location={ShieldUnexpectedErrorEventLocationEnum.TransactionShieldTab}
          message={apiErrorMessage}
        />
      </Box>
    );
  }

  return (
    <Box
      className="transaction-shield-page flex flex-col w-full pb-4 overflow-y-auto"
      data-testid="transaction-shield-page"
    >
      {currentShieldSubscription?.cancelAtPeriodEnd && (
        <Box
          className="transaction-shield-page__notification-banner flex items-center px-4 py-1 gap-2 mb-4"
          backgroundColor={BoxBackgroundColor.WarningMuted}
        >
          <Icon name={IconName.Info} size={IconSize.Lg} />
          <Text variant={TextVariant.BodySm}>
            {t('shieldTxMembershipCancelNotification', [
              formatOptionalDate(currentShieldSubscription.currentPeriodEnd),
            ])}
          </Text>
        </Box>
      )}
      <MembershipErrorBanner
        isPaused={isPaused}
        isCryptoPayment={isCryptoPayment ?? false}
        isCardPayment={isCardPayment ?? false}
        isSubscriptionEndingSoon={isSubscriptionEndingSoon}
        currentShieldSubscription={currentShieldSubscription}
        onActionButtonClick={handlePaymentError}
      />
      <Box className="transaction-shield-page__container mb-4">
        <MembershipHeader
          className="mb-4"
          showSkeletonLoader={showSkeletonLoader}
          isTrialing={isTrialing}
          isPaused={isPaused}
          isCancelled={isCancelled}
          customerId={customerId}
          startDate={displayedShieldSubscription?.currentPeriodStart}
          endDate={displayedShieldSubscription?.currentPeriodEnd}
          trialDaysLeft={trialDaysLeft}
          cancelledDate={displayedShieldSubscription?.canceledAt}
        />
        {/* TODO: verify if we need to hide on all inactive states */}
        {displayedShieldSubscription && !isCancelled && (
          <>
            <Box>
              <Box className="flex items-center justify-between gap-2 px-4 mb-2">
                {showSkeletonLoader ? (
                  <Skeleton width="40%" height={20} />
                ) : (
                  <Text variant={TextVariant.HeadingSm}>
                    {t('shieldTxDetailsTitle')}
                  </Text>
                )}
                {showSkeletonLoader ? (
                  <Skeleton width="30%" height={20} />
                ) : (
                  <TextButton
                    data-testid="shield-detail-manage-plan-button"
                    className="text-text-alternative hover:text-text-alternative hover:decoration-text-alternative hover:bg-transparent"
                    endIconName={IconName.ArrowRight}
                    endIconProps={{
                      size: IconSize.Sm,
                      color: IconColor.IconAlternative,
                    }}
                    onClick={() => {
                      navigate(TRANSACTION_SHIELD_MANAGE_PLAN_ROUTE);
                    }}
                  >
                    {t('shieldTxDetailsManage')}
                  </TextButton>
                )}
              </Box>
              <ButtonRowContainer>
                <ButtonRow
                  startIconName={IconName.SecurityTick}
                  title={t('shieldTxDetails1Title')}
                  description={amountDetails}
                  descriptionTestId="shield-detail-charges"
                  loading={showSkeletonLoader}
                />
                <ButtonRow
                  startIconName={IconName.Calendar}
                  title={t('shieldTxDetails2Title')}
                  description={t('shieldTxDetails2Description', [
                    displayedShieldSubscription?.interval ===
                    RECURRING_INTERVALS.year
                      ? t('shieldPlanYearly')
                      : t('shieldPlanMonthly'),
                    formatOptionalDate(
                      displayedShieldSubscription?.currentPeriodEnd,
                    ),
                  ])}
                  descriptionTestId="shield-detail-next-billing"
                  loading={showSkeletonLoader}
                />
                <ButtonRow
                  startIconName={IconName.Card}
                  title={t('shieldTxDetails3Title')}
                  description={paymentMethodDetails}
                  descriptionTestId="shield-detail-payment-method"
                  loading={showSkeletonLoader}
                />
              </ButtonRowContainer>
            </Box>
            <Box className="transaction-shield-page__divider my-4">
              <Box className="border-t border-muted w-full h-px" />
            </Box>
          </>
        )}

        <Box>
          <Box className="flex items-center justify-between gap-2 px-4 mb-2">
            {showSkeletonLoader ? (
              <Skeleton width="40%" height={20} />
            ) : (
              <Text variant={TextVariant.HeadingSm}>
                {isMembershipInactive
                  ? t('shieldTxMembershipBenefitsInactive')
                  : t('shieldTxMembershipBenefits')}
              </Text>
            )}
            {showSkeletonLoader ? (
              <Skeleton width="30%" height={20} />
            ) : (
              <TextButton
                data-testid="shield-detail-view-benefits-button"
                className="text-text-alternative hover:text-text-alternative hover:decoration-text-alternative hover:bg-transparent"
                endIconName={IconName.ArrowRight}
                endIconProps={{
                  size: IconSize.Sm,
                  color: IconColor.IconAlternative,
                }}
                onClick={() => {
                  handleViewFullBenefitsClicked();
                }}
              >
                {t('shieldTxMembershipBenefitsViewAll')}
              </TextButton>
            )}
          </Box>
          <ButtonRowContainer>
            <ButtonRow
              startIconName={IconName.Cash}
              title={t('shieldTxMembershipBenefits1Title', ['$10,000'])}
              description={t('shieldTxMembershipBenefits1Description')}
              loading={showSkeletonLoader}
            />
            <ButtonRow
              startIconName={IconName.Sms}
              title={t('shieldTxMembershipBenefits2Title')}
              description={t('shieldTxMembershipBenefits2Description')}
              loading={showSkeletonLoader}
            />
          </ButtonRowContainer>
        </Box>
        {!isCancelled && displayedShieldSubscription?.isEligibleForSupport && (
          <Box className="px-4 mt-4">
            {showSkeletonLoader ? (
              <Skeleton width="100%" height={40} />
            ) : (
              <Button
                data-testid="shield-detail-submit-case-button"
                className="w-full"
                variant={ButtonVariant.Secondary}
                onClick={() => {
                  navigate(TRANSACTION_SHIELD_CLAIM_ROUTES.BASE);
                }}
              >
                {t('shieldTxMembershipSubmitCase')}
              </Button>
            )}
          </Box>
        )}
        {isCancelled && (
          <Box className="px-4 mt-4">
            {showSkeletonLoader ? (
              <Skeleton width="100%" height={40} />
            ) : (
              <ReactivateButton
                subscriptionPricing={subscriptionPricing}
                handlePaymentError={handlePaymentError}
              />
            )}
          </Box>
        )}
        {isCancelled && lastShieldSubscription && (
          <>
            <Box className="border-t border-muted my-4 w-full h-px" />
            <Box>
              <Box className="flex items-center justify-between gap-2 px-4 mb-2">
                {showSkeletonLoader ? (
                  <Skeleton width="40%" height={20} />
                ) : (
                  <Text variant={TextVariant.HeadingSm}>
                    {t('shieldTxPastPlans')}
                  </Text>
                )}
              </Box>
              <ButtonRowContainer>
                <ButtonRow
                  title={
                    lastShieldSubscription.interval === RECURRING_INTERVALS.year
                      ? t('shieldTxPastPlansYearly')
                      : t('shieldTxPastPlansMonthly')
                  }
                  description={`${formatOptionalDate(
                    lastShieldSubscription.currentPeriodStart,
                  )} - ${formatOptionalDate(
                    lastShieldSubscription.currentPeriodEnd,
                  )}`}
                  loading={showSkeletonLoader}
                  onClick={() => {
                    navigate(TRANSACTION_SHIELD_MANAGE_PAST_PLAN_ROUTE);
                  }}
                />
              </ButtonRowContainer>
            </Box>
          </>
        )}
      </Box>

      {loading && <LoadingScreen />}
      {currentToken &&
        isAddFundsModalOpen &&
        currentShieldSubscription &&
        isCryptoPaymentMethod(currentShieldSubscription.paymentMethod) && (
          <AddFundsModal
            onClose={() => {
              setIsAddFundsModalOpen(false);
            }}
            token={currentToken}
            chainId={currentShieldSubscription.paymentMethod.crypto.chainId}
            payerAddress={
              currentShieldSubscription.paymentMethod.crypto.payerAddress
            }
          />
        )}
    </Box>
  );
};

export default TransactionShield;
