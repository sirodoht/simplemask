import React, { useCallback, useContext, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, BoxJustifyContent } from '@metamask/design-system-react';
import { I18nContext } from '../../../contexts/i18n';
import { getUseExternalServices } from '../../../selectors';
import { getSelectedInternalAccount } from '../../../../shared/lib/selectors/accounts';
import { getSelectedAccountGroup } from '../../../selectors/multichain-accounts/account-tree';
// eslint-disable-next-line import-x/no-restricted-paths -- TODO(ADR-0021): route-isolation backlog
import { getMultichainAccountAddressListReceivePagePath } from '../../multichain-accounts/multichain-account-address-list-page';

import { INVALID_ASSET_TYPE } from '../../../helpers/constants/error-keys';
import { useDispatch } from '../../../store/hooks';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { AssetType } from '../../../../shared/constants/transaction';
import {
  MetaMetricsEventCategory,
  MetaMetricsEventName,
  MetaMetricsSwapsEventSource,
} from '../../../../shared/constants/metametrics';
import { IconColor } from '../../../helpers/constants/design-system';
import IconButton from '../../../components/ui/icon-button/icon-button';
import {
  Icon,
  IconName,
  IconSize,
} from '../../../components/component-library';
import { ReceiveModal } from '../../../components/multichain/receive-modal';
import { transitionForward } from '../../../components/ui/transition';
import { useOnClickOutside } from '../../../hooks/useClickOutside';
import { trace, TraceName } from '../../../../shared/lib/trace';
import { Asset } from '../types/asset';
// eslint-disable-next-line import-x/no-restricted-paths -- TODO(ADR-0021): route-isolation backlog
import { navigateToSendRoute } from '../../confirmations/utils/send';
import { isEvmChainId } from '../../../../shared/lib/asset-utils';

const TokenButtons = ({
  token,
  disableSendForNonEvm = false,
  isMarketClosed = false,
}: {
  token: Asset & { type: AssetType.token };
  /** When true, disables the send button for non-EVM chains (used on asset page) */
  disableSendForNonEvm?: boolean;
  /** When true, disables the swap button because the stock market is closed */
  isMarketClosed?: boolean;
}) => {
  const dispatch = useDispatch();
  const t = useContext(I18nContext);
  const { trackEvent, createEventBuilder } = useAnalytics();
  const navigate = useNavigate();
  const isExternalServicesEnabled = useSelector(getUseExternalServices);
  const selectedAccount = useSelector(getSelectedInternalAccount);
  const selectedAccountGroup = useSelector(getSelectedAccountGroup);
  const isEvm = isEvmChainId(token.chainId);
  const shouldShowSendButton = Boolean(
    !token.isERC721 && token.balance?.value && token.balance.value !== '0',
  );

  const currentChainId = token.chainId;

  const containerRef = useRef<HTMLDivElement>(null);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [isMoreOptionsDropdownOpen, setIsMoreOptionsDropdownOpen] =
    useState(false);

  const handleMoreOptionsButtonClick = useCallback(() => {
    setIsMoreOptionsDropdownOpen((prev) => !prev);
  }, []);

  useOnClickOutside({
    containerRef,
    onClickOutside: () => setIsMoreOptionsDropdownOpen(false),
    active: isMoreOptionsDropdownOpen,
  });

  const handleSendOnClick = useCallback(async () => {
    trackEvent(
      createEventBuilder(MetaMetricsEventName.SendStarted)
        .addCategory(MetaMetricsEventCategory.Navigation)
        .addProperties({
          // TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31860
          // eslint-disable-next-line @typescript-eslint/naming-convention
          token_symbol: token.symbol,
          location: MetaMetricsSwapsEventSource.TokenView,
          text: 'Send',
          // TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31860
          // eslint-disable-next-line @typescript-eslint/naming-convention
          chain_id: token.chainId,
        })
        .build({ excludeMetaMetricsId: false }),
    );

    try {
      navigateToSendRoute(navigate, {
        address: token.address,
        chainId: token.chainId,
      });

      // TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31973
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (!err.message.includes(INVALID_ASSET_TYPE)) {
        throw err;
      }
    }
  }, [trackEvent, createEventBuilder, navigate, token]);

  const handleReceiveOnClick = useCallback(() => {
    trace({ name: TraceName.ReceiveModal });
    trackEvent(
      createEventBuilder(MetaMetricsEventName.NavReceiveButtonClicked)
        .addCategory(MetaMetricsEventCategory.Navigation)
        .addProperties({
          text: 'Receive',
          location: 'asset-page',
          // TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31860
          // eslint-disable-next-line @typescript-eslint/naming-convention
          chain_id: token.chainId,
        })
        .build(),
    );

    if (selectedAccountGroup) {
      // Navigate to the multichain address list page with receive source
      transitionForward(() =>
        navigate(
          getMultichainAccountAddressListReceivePagePath(selectedAccountGroup),
        ),
      );
    } else {
      // Show the traditional receive modal
      setShowReceiveModal(true);
    }
  }, [
    selectedAccountGroup,
    navigate,
    trackEvent,
    createEventBuilder,
    token.chainId,
  ]);

  const sendButton = (
    <IconButton
      className="token-overview__button"
      onClick={handleSendOnClick}
      Icon={
        <Icon
          name={IconName.Arrow2UpRight}
          color={IconColor.iconAlternative}
          size={IconSize.Md}
        />
      }
      label={t('send')}
      data-testid="eth-overview-send"
      width={undefined}
      disabled={
        token.isERC721 ||
        (disableSendForNonEvm && !isEvm && !isExternalServicesEnabled)
      }
    />
  );

  return (
    <>
      {
        <Box className="flex" gap={3} justifyContent={BoxJustifyContent.Evenly}>
          {shouldShowSendButton ? sendButton : null}
        </Box>
      }
      {showReceiveModal && selectedAccount ? (
        <ReceiveModal
          address={selectedAccount.address}
          onClose={() => setShowReceiveModal(false)}
        />
      ) : null}
    </>
  );
};

export default TokenButtons;
