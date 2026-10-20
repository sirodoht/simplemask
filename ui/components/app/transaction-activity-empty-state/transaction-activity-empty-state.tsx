import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { twMerge } from '@metamask/design-system-react';
import { TabEmptyState } from '../../ui/tab-empty-state';
import { getText } from '../../../helpers/utils/text';
import { useTheme } from '../../../hooks/useTheme';
import { getCurrentChainId } from '../../../../shared/lib/selectors/networks';
import {
  MetaMetricsEventCategory,
  MetaMetricsEventName,
} from '../../../../shared/constants/metametrics';
import { ThemeType } from '../../../../shared/constants/preferences';
import { selectAccountGroupBalanceForEmptyState } from '../../../selectors/assets';
import { getSelectedAccountGroup } from '../../../selectors/multichain-accounts/account-tree';
import { FundingMethodModal } from '../../multichain/funding-method-modal/funding-method-modal';
import { getMultichainAccountAddressListReceivePagePath } from '../../../pages/multichain-accounts/multichain-account-address-list-page';
import { useAnalytics } from '../../../hooks/useAnalytics';

export type TransactionActivityEmptyStateProps = {
  /**
   * Additional className to apply to the component
   */
  className?: string;
};

export const TransactionActivityEmptyState = ({
  className,
}: TransactionActivityEmptyStateProps) => {
  const t = getText;
  const theme = useTheme();
  const navigate = useNavigate();
  const { trackEvent, createEventBuilder } = useAnalytics();
  const hasTokens = useSelector(selectAccountGroupBalanceForEmptyState);
  const selectedAccountGroup = useSelector(getSelectedAccountGroup);
  const [isFundingModalOpen, setIsFundingModalOpen] = useState(false);
  const chainId = useSelector(getCurrentChainId);

  const activityIcon =
    theme === ThemeType.dark
      ? './images/empty-state-activity-dark.png'
      : './images/empty-state-activity-light.png';

  const handleAddFundsOnClick = useCallback(() => {
    trackEvent(
      createEventBuilder(MetaMetricsEventName.NavBuyButtonClicked)
        .addCategory(MetaMetricsEventCategory.Navigation)
        .addProperties({
          location: 'Activity Tab Empty State',
          text: 'Add funds',
          chainId,
        })
        .build(),
    );

    setIsFundingModalOpen(true);
  }, [chainId, trackEvent, createEventBuilder]);

  const handleFundingModalClose = useCallback(() => {
    setIsFundingModalOpen(false);
  }, []);

  const handleReceiveOnClick = useCallback(() => {
    setIsFundingModalOpen(false);

    if (selectedAccountGroup) {
      navigate(
        getMultichainAccountAddressListReceivePagePath(selectedAccountGroup),
      );
    }
  }, [navigate, selectedAccountGroup]);

  return (
    <>
      <TabEmptyState
        icon={
          <img src={activityIcon} alt={t('activity')} width={72} height={72} />
        }
        description={
          hasTokens
            ? t('activityEmptyDescription')
            : t('activityEmptyNoFundsDescription')
        }
        actionButtonText={hasTokens ? undefined : t('addFunds')}
        onAction={hasTokens ? undefined : handleAddFundsOnClick}
        data-testid="activity-tab-empty-state"
        className={twMerge('max-w-56', className)}
      />
      {!hasTokens && (
        <FundingMethodModal
          isOpen={isFundingModalOpen}
          onClose={handleFundingModalClose}
          title={t('addFunds')}
          onClickReceive={handleReceiveOnClick}
          data-testid="activity-tab-empty-state-funding-modal"
        />
      )}
    </>
  );
};
