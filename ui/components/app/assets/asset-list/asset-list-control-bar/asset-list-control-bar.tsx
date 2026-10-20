import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  ButtonIcon,
  ButtonIconSize,
  Icon,
  IconColor,
  IconName,
  IconSize,
} from '@metamask/design-system-react';
import { isEvmAccountType } from '@metamask/keyring-api';
import {
  getAllChainsToPoll,
  getIsLineaMainnet,
  getIsMainnet,
  getTokenNetworkFilter,
} from '../../../../../selectors';
import { getSelectedInternalAccount } from '../../../../../../shared/lib/selectors/accounts';
import { selectAccountSupportsEnabledNetworks } from '../../../../../selectors/assets';
import {
  getAllEnabledNetworksForAllNamespaces,
  getEnabledNetworksByNamespace,
  selectEnabledNetworksAsCaipChainIds,
} from '../../../../../selectors/multichain/networks';
import { getNetworkConfigurationsByChainId } from '../../../../../../shared/lib/selectors/networks';
import {
  Box,
  ButtonBase,
  ButtonBaseSize,
  Popover,
  PopoverPosition,
  Text,
} from '../../../../component-library';
import SortControl, { SelectableListItem } from '../sort-control/sort-control';
import {
  AlignItems,
  BackgroundColor,
  BorderColor,
  Display,
  JustifyContent,
  TextColor,
  TextVariant,
} from '../../../../../helpers/constants/design-system';
import ImportControl from '../import-control';
import { useI18nContext } from '../../../../../hooks/useI18nContext';
import { useAnalytics } from '../../../../../hooks/useAnalytics';
import { useBoolean } from '../../../../../hooks/useBoolean';
import { TEST_CHAINS } from '../../../../../../shared/constants/network';
import {
  MetaMetricsEventCategory,
  MetaMetricsEventName,
} from '../../../../../../shared/constants/metametrics';
import { getEnvironmentType } from '../../../../../../shared/lib/environment-type';
import {
  ENVIRONMENT_TYPE_NOTIFICATION,
  ENVIRONMENT_TYPE_POPUP,
} from '../../../../../../shared/constants/app';
import {
  refreshAssetsForSelectedAccount,
  setEnabledAllPopularNetworks,
  setTokenNetworkFilter,
} from '../../../../../store/actions';
import type { MetaMaskReduxState } from '../../../../../store/store';
import Tooltip from '../../../../ui/tooltip';
import {
  getMultichainIsEvm,
  getMultichainNetwork,
} from '../../../../../selectors/multichain';
import { TOKEN_MANAGEMENT_ROUTE } from '../../../../../helpers/constants/routes';
import { useNetworkFilterButtonLabel } from '../../hooks/useNetworkFilterButtonLabel';
import {
  getInternalAccountsFromGroupById,
  getSelectedAccountGroup,
} from '../../../../../selectors/multichain-accounts/account-tree';
import type { MultichainAccountsState } from '../../../../../selectors/multichain-accounts/account-tree.types';
import { useDispatch } from '../../../../../store/hooks';
import { HomeNetworkFilterModal } from './home-network-filter-modal';

type AssetListControlBarProps = {
  showTokensLinks?: boolean;
  showImportTokenButton?: boolean;
  showSortControl?: boolean;
  onNetworkSelect?: (networks: string[]) => void;
  /**
   * When provided with `showImportTokenButton={false}`, shows the more-options
   * menu containing only a "Refresh list" action that invokes this callback.
   */
  onRefresh?: () => void;
  'data-testid'?: string;
};

const AssetListControlBar = ({
  showTokensLinks,
  showImportTokenButton = true,
  showSortControl = true,
  onNetworkSelect,
  onRefresh,
  'data-testid': dataTestId,
}: AssetListControlBarProps) => {
  const t = useI18nContext();
  const dispatch = useDispatch();
  const { trackEvent, createEventBuilder } = useAnalytics();
  const navigate = useNavigate();
  const [sortReferenceElement, setSortReferenceElement] =
    useState<HTMLButtonElement | null>(null);
  const [importReferenceElement, setImportReferenceElement] =
    useState<HTMLButtonElement | null>(null);
  const setSortButtonRef = useCallback((node: HTMLButtonElement | null) => {
    setSortReferenceElement(node);
  }, []);
  const setImportButtonRef = useCallback((node: HTMLButtonElement | null) => {
    setImportReferenceElement(node);
  }, []);
  const currentMultichainNetwork = useSelector(getMultichainNetwork);
  const allNetworks = useSelector(getNetworkConfigurationsByChainId);
  const isMainnet = useSelector(getIsMainnet);
  const isLineaMainnet = useSelector(getIsLineaMainnet);
  const allChainIds = useSelector(getAllChainsToPoll);
  const isEvm = useSelector(getMultichainIsEvm);
  const accountSupportsEnabledNetworks = useSelector(
    selectAccountSupportsEnabledNetworks,
  );
  const selectedInternalAccount = useSelector(getSelectedInternalAccount);
  const isEvmOnlySelectedAccountGroup = useSelector(
    (state: MetaMaskReduxState) => {
      const multichainAccountsState =
        state as unknown as MultichainAccountsState;
      const selectedAccountGroup = getSelectedAccountGroup(
        multichainAccountsState,
      );
      const selectedAccountGroupAccounts = getInternalAccountsFromGroupById(
        multichainAccountsState,
        selectedAccountGroup,
      );

      return (
        selectedAccountGroupAccounts.length > 0 &&
        selectedAccountGroupAccounts.every((account) =>
          isEvmAccountType(account.type),
        )
      );
    },
  );

  const enabledNetworksByNamespace = useSelector(getEnabledNetworksByNamespace);
  const allEnabledNetworksForAllNamespaces = useSelector(
    getAllEnabledNetworksForAllNamespaces,
  );
  const selectedCaipChainIds = useSelector(selectEnabledNetworksAsCaipChainIds);
  const tokenNetworkFilter = useSelector(getTokenNetworkFilter);
  const [isNetworkFilterModalOpen, setIsNetworkFilterModalOpen] =
    useState(false);
  const { value: isNetworkSwitchPending, setValue: setIsNetworkSwitchPending } =
    useBoolean();
  const [isTokenSortPopoverOpen, setIsTokenSortPopoverOpen] = useState(false);
  const [isImportTokensPopoverOpen, setIsImportTokensPopoverOpen] =
    useState(false);
  const [isRefreshListPopoverOpen, setIsRefreshListPopoverOpen] =
    useState(false);
  const currentNamespaceNetworkCount = Object.keys(
    enabledNetworksByNamespace,
  ).length;
  const totalEnabledNetworkCount = allEnabledNetworksForAllNamespaces.length;
  const isSingleNetworkFilterSelected = totalEnabledNetworkCount === 1;
  const networkButtonText = useNetworkFilterButtonLabel();

  useEffect(() => {
    if (!onNetworkSelect) {
      return;
    }
    onNetworkSelect(selectedCaipChainIds);
  }, [onNetworkSelect, selectedCaipChainIds]);

  const isTestNetwork = useMemo(() => {
    return (TEST_CHAINS as string[]).includes(
      currentMultichainNetwork.network.chainId,
    );
  }, [currentMultichainNetwork.network.chainId]);

  const allOpts: Record<string, boolean> = useMemo(() => {
    const opts: Record<string, boolean> = {};
    Object.keys(allNetworks || {}).forEach((chainId) => {
      opts[chainId] = true;
    });
    return opts;
  }, [allNetworks]);

  useEffect(() => {
    if (isTestNetwork) {
      const testnetFilter = {
        [currentMultichainNetwork.network.chainId]: true,
      };
      dispatch(setTokenNetworkFilter(testnetFilter));
    }
  }, [isTestNetwork, currentMultichainNetwork.network.chainId, dispatch]);

  // TODO: This useEffect should be a migration
  // We need to set the default filter for all users to be all included networks, rather than defaulting to empty object
  // This effect is to unblock and derisk in the short-term
  useEffect(() => {
    if (currentNamespaceNetworkCount === 0) {
      dispatch(setTokenNetworkFilter(allOpts));
    } else {
      dispatch(
        setTokenNetworkFilter({
          [currentMultichainNetwork.network.chainId]: true,
        }),
      );
    }
  }, [
    allOpts,
    currentMultichainNetwork.network.chainId,
    dispatch,
    currentNamespaceNetworkCount,
  ]);

  useEffect(() => {
    if (
      isEvmOnlySelectedAccountGroup &&
      !accountSupportsEnabledNetworks &&
      totalEnabledNetworkCount > 0
    ) {
      dispatch(setEnabledAllPopularNetworks());
    }
  }, [
    accountSupportsEnabledNetworks,
    dispatch,
    isEvmOnlySelectedAccountGroup,
    totalEnabledNetworkCount,
  ]);

  const windowType = getEnvironmentType();
  const isFullScreen =
    windowType !== ENVIRONMENT_TYPE_NOTIFICATION &&
    windowType !== ENVIRONMENT_TYPE_POPUP;

  const toggleTokenSortPopover = () => {
    setIsNetworkFilterModalOpen(false);
    setIsImportTokensPopoverOpen(false);
    setIsRefreshListPopoverOpen(false);
    setIsTokenSortPopoverOpen(!isTokenSortPopoverOpen);
  };

  const toggleImportTokensPopover = () => {
    setIsNetworkFilterModalOpen(false);
    setIsTokenSortPopoverOpen(false);
    setIsRefreshListPopoverOpen(false);
    setIsImportTokensPopoverOpen(!isImportTokensPopoverOpen);
  };

  const toggleRefreshListPopover = () => {
    setIsNetworkFilterModalOpen(false);
    setIsTokenSortPopoverOpen(false);
    setIsImportTokensPopoverOpen(false);
    setIsRefreshListPopoverOpen(!isRefreshListPopoverOpen);
  };

  const closePopover = () => {
    setIsNetworkFilterModalOpen(false);
    setIsTokenSortPopoverOpen(false);
    setIsImportTokensPopoverOpen(false);
    setIsRefreshListPopoverOpen(false);
  };

  const handleNetworkFilterClick = () => {
    setIsTokenSortPopoverOpen(false);
    setIsImportTokensPopoverOpen(false);
    setIsRefreshListPopoverOpen(false);
    setIsNetworkFilterModalOpen(!isNetworkFilterModalOpen);
  };

  const handleOpenTokenManagement = useCallback(() => {
    trackEvent(
      createEventBuilder(MetaMetricsEventName.TokenImportButtonClicked)
        .addCategory(MetaMetricsEventCategory.Navigation)
        .addProperties({
          location: 'HOME',
        })
        .build(),
    );
    setIsTokenSortPopoverOpen(false);
    setIsImportTokensPopoverOpen(false);
    navigate(TOKEN_MANAGEMENT_ROUTE, {
      state: {
        globalMenuTransition: 'forward',
      },
    });
  }, [createEventBuilder, navigate, trackEvent]);

  const handleRefresh = () => {
    if (selectedInternalAccount) {
      dispatch(
        refreshAssetsForSelectedAccount([selectedInternalAccount], {
          chainIds: selectedCaipChainIds,
          assetTypes: ['token', 'price', 'metadata'],
        }),
      );
    }
    closePopover();
  };

  const handleRefreshListOnly = () => {
    onRefresh?.();
    closePopover();
  };

  let networkFilterTextColor = TextColor.textDefault;
  if (isNetworkSwitchPending) {
    networkFilterTextColor = TextColor.transparent;
  } else if (isSingleNetworkFilterSelected) {
    networkFilterTextColor = TextColor.primaryDefault;
  }

  return (
    <Box
      className="asset-list-control-bar"
      marginLeft={4}
      marginRight={4}
      data-testid={dataTestId}
    >
      <Box display={Display.Flex} justifyContent={JustifyContent.spaceBetween}>
        <ButtonBase
          data-testid="sort-by-networks"
          variant={TextVariant.bodySmMedium}
          className="asset-list-control-bar__button asset-list-control-bar__network_control"
          onClick={handleNetworkFilterClick}
          size={ButtonBaseSize.Sm}
          loading={isNetworkSwitchPending}
          disabled={isNetworkSwitchPending}
          backgroundColor={
            isNetworkFilterModalOpen
              ? BackgroundColor.backgroundPressed
              : BackgroundColor.backgroundDefault
          }
          color={
            isSingleNetworkFilterSelected
              ? TextColor.primaryDefault
              : TextColor.textDefault
          }
          marginRight={isFullScreen ? 2 : null}
          borderColor={BorderColor.borderMuted}
          ellipsis
        >
          <Box display={Display.Flex} alignItems={AlignItems.center} gap={2}>
            {!isNetworkSwitchPending && (
              <Icon
                name={IconName.Filter}
                size={IconSize.Md}
                color={
                  isSingleNetworkFilterSelected
                    ? IconColor.PrimaryDefault
                    : IconColor.IconDefault
                }
              />
            )}
            <Text
              variant={TextVariant.bodySmMedium}
              color={networkFilterTextColor}
              ellipsis
            >
              {networkButtonText}
            </Text>
          </Box>
        </ButtonBase>

        <Box
          className="asset-list-control-bar__buttons"
          display={Display.Flex}
          justifyContent={JustifyContent.flexEnd}
          alignItems={AlignItems.center}
        >
          {showSortControl && (
            <Tooltip
              title={t('sortBy')}
              position="bottom"
              distance={20}
              disabled={isTokenSortPopoverOpen}
            >
              <ButtonIcon
                ref={setSortButtonRef}
                data-testid="sort-by-popover-toggle"
                className={`asset-list-control-bar__button flex items-center justify-center border-0 ${
                  isTokenSortPopoverOpen ? 'bg-pressed' : 'bg-transparent'
                } hover:bg-hover active:bg-pressed`}
                onClick={toggleTokenSortPopover}
                size={ButtonIconSize.Sm}
                iconName={IconName.ListArrow}
                ariaLabel={t('sortBy')}
              />
            </Tooltip>
          )}

          {showImportTokenButton && (
            <ImportControl
              ref={setImportButtonRef}
              showTokensLinks
              onClick={toggleImportTokensPopover}
            />
          )}

          {!showImportTokenButton && onRefresh ? (
            <ImportControl
              ref={setImportButtonRef}
              showTokensLinks
              onClick={toggleRefreshListPopover}
            />
          ) : null}
        </Box>
      </Box>

      <HomeNetworkFilterModal
        isOpen={isNetworkFilterModalOpen}
        onClose={closePopover}
        onPendingChange={setIsNetworkSwitchPending}
      />

      <Popover
        onClickOutside={closePopover}
        isOpen={isTokenSortPopoverOpen}
        position={PopoverPosition.BottomEnd}
        referenceElement={sortReferenceElement}
        matchWidth={false}
        style={{
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          minWidth: isFullScreen ? '250px' : '',
        }}
      >
        <SortControl handleClose={closePopover} />
      </Popover>

      {/* Tokens Popover */}
      <Popover
        onClickOutside={closePopover}
        isOpen={isImportTokensPopoverOpen}
        position={PopoverPosition.BottomEnd}
        referenceElement={importReferenceElement}
        matchWidth={false}
        style={{
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          minWidth: isFullScreen ? '158px' : '',
        }}
      >
        <SelectableListItem
          onClick={handleOpenTokenManagement}
          testId="manageTokens"
          className="min-h-12"
        >
          <Icon name={IconName.Setting} size={IconSize.Sm} className="mr-2" />
          {t('manageTokens')}
        </SelectableListItem>
        <SelectableListItem onClick={handleRefresh} testId="refreshList">
          <Icon name={IconName.Refresh} size={IconSize.Sm} className="mr-2" />
          {t('refreshList')}
        </SelectableListItem>
      </Popover>

      {/* NFT Popover */}

      {/* Refresh-only Popover (e.g. DeFi) */}
      <Popover
        onClickOutside={closePopover}
        isOpen={isRefreshListPopoverOpen}
        position={PopoverPosition.BottomEnd}
        referenceElement={importReferenceElement}
        matchWidth={false}
        style={{
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          minWidth: isFullScreen ? '158px' : '',
        }}
      >
        <SelectableListItem
          onClick={handleRefreshListOnly}
          testId="refreshList"
        >
          <Icon name={IconName.Refresh} size={IconSize.Sm} className="mr-2" />
          {t('refreshList')}
        </SelectableListItem>
      </Popover>
    </Box>
  );
};

export default AssetListControlBar;
