import React, { useCallback, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toHex } from '@metamask/controller-utils';
import { isCaipChainId, CaipChainId } from '@metamask/utils';
import { InternalAccount } from '@metamask/keyring-internal-api';
import {
  Box,
  BoxFlexDirection,
  BoxJustifyContent,
  ButtonBase,
  FontWeight,
  Icon,
  IconColor,
  IconName,
  IconSize,
  Text,
  TextAlign,
  TextColor,
  TextVariant,
} from '@metamask/design-system-react';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { useDispatch } from '../../../store/hooks';
import { transitionForward } from '../../ui/transition';

import { getText } from '../../../helpers/utils/text';

import { getMultichainAccountAddressListReceivePagePath } from '../../../pages/multichain-accounts/multichain-account-address-list-page';
import {
  getUseExternalServices,
  getNetworkConfigurationIdByChainId,
} from '../../../selectors';
import { getSelectedAccountGroup } from '../../../selectors/multichain-accounts/account-tree';
import Tooltip from '../../ui/tooltip';
import {
  MetaMetricsEventCategory,
  MetaMetricsEventName,
} from '../../../../shared/constants/metametrics';
import { BlockSize } from '../../../helpers/constants/design-system';
import { Tag, TagProps } from '../../component-library';
import IconButton from '../../ui/icon-button';
import { ReceiveModal } from '../../multichain/receive-modal';
import { setActiveNetworkWithError } from '../../../store/actions';
import {
  getMultichainNativeCurrency,
  getMultichainNetwork,
} from '../../../selectors/multichain';
import { useMultichainSelector } from '../../../hooks/useMultichainSelector';
import { getCurrentChainId } from '../../../../shared/lib/selectors/networks';
import { isEvmChainId } from '../../../../shared/lib/asset-utils';
import { trace, TraceName } from '../../../../shared/lib/trace';
import { navigateToSendRoute } from '../../../pages/confirmations/utils/send';
import { useOnClickOutside } from '../../../hooks/useClickOutside';

type MoreButtonsGroupProps<TagElem extends React.ElementType = 'div'> = {
  classPrefix?: string;
  onClick: () => void;
  modalIsOpen: boolean;
  actions: {
    label: string;
    onClick: () => void;
    testId?: string;
    iconName: IconName;
    iconClassName?: string;
    tagProps?: TagProps<TagElem>;
    enabled: boolean;
  }[];
};

export const MoreButtonsGroup = ({
  actions,
  classPrefix,
  onClick,
  modalIsOpen,
}: MoreButtonsGroupProps) => {
  const t = getText;
  const enabledActions = actions.filter(({ enabled }) => enabled);
  const [onlyEnabledAction] = enabledActions;

  if (enabledActions.length === 0) {
    return null;
  }

  if (enabledActions.length === 1) {
    return (
      <IconButton
        className={`${classPrefix}-overview__button`}
        data-testid={`${classPrefix}-overview-default`}
        Icon={
          <Icon
            name={onlyEnabledAction.iconName}
            color={IconColor.IconAlternative}
            size={IconSize.Md}
            className={onlyEnabledAction.iconClassName}
          />
        }
        label={onlyEnabledAction.label}
        width={BlockSize.Full}
        onClick={onlyEnabledAction.onClick}
      />
    );
  }

  return (
    <>
      <IconButton
        className={`${classPrefix}-overview__button`}
        data-testid={`${classPrefix}-overview-more`}
        Icon={
          <Icon
            name={IconName.MoreHorizontal}
            color={IconColor.IconAlternative}
            size={IconSize.Md}
          />
        }
        label={t('moreCapital')}
        width={BlockSize.Full}
        onClick={onClick}
      />
      {modalIsOpen && (
        <Box className="flex flex-col absolute right-0 top-full z-10 mt-4 min-w-[120px] overflow-hidden rounded-lg border border-border-muted shadow-lg bg-elevated2">
          {enabledActions.map((action) => (
            <ButtonBase
              key={action.label}
              className="text-left rounded-none px-4 py-3 bg-transparent min-w-0 flex w-full items-center h-auto hover:bg-hover active:bg-pressed"
              onClick={action.onClick}
              data-testid={action.testId}
            >
              <Icon
                name={action.iconName}
                color={IconColor.IconAlternative}
                size={IconSize.Md}
                className={action.iconClassName}
              />
              <Text
                variant={TextVariant.BodyMd}
                fontWeight={FontWeight.Medium}
                color={TextColor.TextDefault}
                textAlign={TextAlign.Left}
                className="pl-4 pr-2 flex-1"
              >
                {action.label}
              </Text>
              {action.tagProps && <Tag {...action.tagProps} />}
            </ButtonBase>
          ))}
        </Box>
      )}
    </>
  );
};

type CoinButtonsProps = {
  account: InternalAccount;
  chainId: `0x${string}` | CaipChainId | number;
  trackingLocation: string;
  isSigningEnabled: boolean;
  classPrefix?: string;
  /**
   * Whether the displayed native asset has a spendable balance. When false,
   * a Perps action row shows Receive instead of Send.
   */
  hasBalance?: boolean;
  /** When true, disables the send button for non-EVM chains (used on asset page) */
  disableSendForNonEvm?: boolean;
};

const CoinButtons = ({
  account,
  chainId,
  trackingLocation,
  isSigningEnabled,
  classPrefix = 'coin',
  hasBalance = true,
  disableSendForNonEvm = false,
}: CoinButtonsProps) => {
  const t = getText;
  const dispatch = useDispatch();

  const { trackEvent, createEventBuilder } = useAnalytics();
  const [showReceiveModal, setShowReceiveModal] = useState(false);

  const { address: selectedAddress } = account;
  const navigate = useNavigate();
  const networks = useSelector(getNetworkConfigurationIdByChainId) as Record<
    string,
    string
  >;
  const currentChainId = useSelector(getCurrentChainId);
  const selectedAccountGroup = useSelector(getSelectedAccountGroup);

  const containerRef = useRef<HTMLDivElement>(null);
  const [isMoreOptionsDropdownOpen, setIsMoreOptionsDropdownOpen] =
    useState(false);

  // Initially, those events were using a "ETH" as `token_symbol`, so we keep this behavior
  // for EVM, no matter the currently selected native token (e.g. SepoliaETH if you are on Sepolia
  // network).
  const { isEvmNetwork, chainId: multichainChainId } = useMultichainSelector(
    getMultichainNetwork,
    account,
  );
  const multichainNativeToken = useMultichainSelector(
    getMultichainNativeCurrency,
    account,
  );
  const nativeToken = isEvmNetwork ? 'ETH' : multichainNativeToken;

  const isExternalServicesEnabled = useSelector(getUseExternalServices);
  const normalizedChainId = isCaipChainId(chainId) ? chainId : toHex(chainId);
  const isEvmAsset = isEvmChainId(normalizedChainId);

  const buttonTooltips = {
    sendButton: [
      { condition: !isSigningEnabled, message: 'methodNotSupported' },
      {
        condition:
          disableSendForNonEvm && !isEvmAsset && !isExternalServicesEnabled,
        message: 'currentlyUnavailable',
      },
    ],
  };

  const generateTooltip = (
    buttonKey: keyof typeof buttonTooltips,
    contents: React.ReactElement,
  ) => {
    const conditions = buttonTooltips[buttonKey];
    const tooltipInfo = conditions.find(({ condition }) => condition);
    if (tooltipInfo?.message) {
      return (
        <Tooltip
          title={t(tooltipInfo.message)}
          position="bottom"
          wrapperClassName="tooltip-button-wrapper"
        >
          {contents}
        </Tooltip>
      );
    }
    return contents;
  };

  const getSnapAccountMetaMetricsPropertiesIfAny = (
    internalAccount: InternalAccount,
    // TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31860
    // eslint-disable-next-line @typescript-eslint/naming-convention
  ): { snap_id?: string } => {
    // Some accounts might be Snap accounts, in this case we add some extra properties
    // to the metrics:
    const snapId = internalAccount.metadata.snap?.id;
    if (snapId) {
      return {
        // TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31860
        // eslint-disable-next-line @typescript-eslint/naming-convention
        snap_id: snapId,
      };
    }

    // If the account is not a Snap account or that we could not get the Snap ID for
    // some reason, we don't add any extra property.
    return {};
  };

  const handleMoreOptionsButtonClick = useCallback(() => {
    setIsMoreOptionsDropdownOpen((prev) => !prev);
  }, []);

  const setCorrectChain = useCallback(async () => {
    if (currentChainId !== chainId && multichainChainId !== chainId) {
      try {
        const networkConfigurationId = networks[chainId];
        await dispatch(setActiveNetworkWithError(networkConfigurationId));
      } catch (err) {
        console.error(`Failed to switch chains.
        Target chainId: ${chainId}, Current chainId: ${currentChainId}.
        ${
          // TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31893
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          err
        }`);
        throw err;
      }
    }
  }, [currentChainId, multichainChainId, chainId, networks, dispatch]);

  const handleSendOnClick = useCallback(async () => {
    trackEvent(
      createEventBuilder(MetaMetricsEventName.SendStarted)
        .addCategory(MetaMetricsEventCategory.Navigation)
        .addProperties({
          // TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31860
          // eslint-disable-next-line @typescript-eslint/naming-convention
          account_type: account.type,
          // TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31860
          // eslint-disable-next-line @typescript-eslint/naming-convention
          token_symbol: nativeToken,
          text: 'Send',
          location: 'Home',
          // TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31860
          // eslint-disable-next-line @typescript-eslint/naming-convention
          chain_id: chainId,
          ...getSnapAccountMetaMetricsPropertiesIfAny(account),
        })
        .build({ excludeMetaMetricsId: false }),
    );

    // Native Send flow
    await setCorrectChain();
    const params =
      trackingLocation === 'home' ? undefined : { chainId: chainId.toString() };
    transitionForward(() => navigateToSendRoute(navigate, params));
  }, [chainId, account, setCorrectChain, trackingLocation]);

  const handleReceiveOnClick = useCallback(() => {
    trace({ name: TraceName.ReceiveModal });
    trackEvent(
      createEventBuilder(MetaMetricsEventName.NavReceiveButtonClicked)
        .addCategory(MetaMetricsEventCategory.Navigation)
        .addProperties({
          text: 'Receive',
          location: trackingLocation,
          // TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31860
          // eslint-disable-next-line @typescript-eslint/naming-convention
          chain_id: chainId,
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
  }, [selectedAccountGroup, navigate, trackEvent, trackingLocation, chainId]);

  useOnClickOutside({
    containerRef,
    onClickOutside: () => setIsMoreOptionsDropdownOpen(false),
    active: isMoreOptionsDropdownOpen,
  });

  return (
    <Box
      flexDirection={BoxFlexDirection.Row}
      className="flex relative w-full"
      justifyContent={BoxJustifyContent.Between}
      gap={3}
      ref={containerRef}
    >
      {<></>}
      {
        <IconButton
          className={`${classPrefix}-overview__button`}
          data-testid={`${classPrefix}-overview-send`}
          Icon={
            <Icon
              name={IconName.Arrow2UpRight}
              color={IconColor.IconAlternative}
              size={IconSize.Md}
            />
          }
          disabled={
            !isSigningEnabled ||
            (disableSendForNonEvm && !isEvmAsset && !isExternalServicesEnabled)
          }
          label={t('send')}
          onClick={handleSendOnClick}
          width={BlockSize.Full}
          tooltipRender={(contents: React.ReactElement) =>
            generateTooltip('sendButton', contents)
          }
        />
      }
      {showReceiveModal && (
        <ReceiveModal
          address={selectedAddress}
          onClose={() => setShowReceiveModal(false)}
        />
      )}

      <MoreButtonsGroup
        onClick={handleMoreOptionsButtonClick}
        modalIsOpen={isMoreOptionsDropdownOpen}
        classPrefix={classPrefix}
        actions={[
          {
            label: t('receive'),
            onClick: handleReceiveOnClick,
            testId: `${classPrefix}-overview-receive`,
            iconName: IconName.Received,
            enabled: true,
          },
        ]}
      />
    </Box>
  );
};

export default CoinButtons;
