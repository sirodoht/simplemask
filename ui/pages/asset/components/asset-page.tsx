import { getNativeTokenAddress } from '@metamask/assets-controllers';
import { formatChainIdToCaip } from '@metamask/bridge-controller';
import {
  Box,
  BoxAlignItems,
  BoxFlexDirection,
  BoxJustifyContent,
  AvatarNetwork,
  AvatarNetworkSize,
  FontWeight,
  Text,
  TextButton,
  TextButtonSize,
  TextColor,
  TextVariant,
} from '@metamask/design-system-react';
import {
  BtcMethod,
  EthMethod,
  SolMethod,
  TrxAccountType,
} from '@metamask/keyring-api';
import { InternalAccount } from '@metamask/keyring-internal-api';
import {
  type CaipAssetType,
  isCaipChainId,
  parseCaipAssetType,
} from '@metamask/utils';
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { AssetType } from '../../../../shared/constants/transaction';
import { DEFAULT_ROUTE } from '../../../helpers/constants/routes';
import { isEvmChainId, toAssetId } from '../../../../shared/lib/asset-utils';
import { endTrace, TraceName } from '../../../../shared/lib/trace';
import { hexToDecimal } from '../../../../shared/lib/conversion.utils';
import { toChecksumHexAddress } from '../../../../shared/lib/hexstring-utils';
import TokenCell from '../../../components/app/assets/token-cell';
import { isArcUsdcForBridge } from '../../../components/app/assets/enablement/arc';
import { MarketClosedModal } from '../../../components/app/assets/market-closed-modal';
import { type TokenWithFiatAmount } from '../../../components/app/assets/types';
import CoinButtons from '../../../components/app/wallet-overview/coin-buttons';
import { StockBadge } from '../../../components/app/assets/stock-badge/stock-badge';
import { AddressCopyButton } from '../../../components/multichain';
// eslint-disable-next-line import-x/no-restricted-paths
import { ActivityList } from '../../activity/activity-list';
import { getCurrentCurrency } from '../../../ducks/metamask/metamask';
import { getPortfolioUrl } from '../../../helpers/utils/portfolio';
import { getText } from '../../../helpers/utils/text';
import { useInAppBack } from '../../../hooks/useInAppBack';
import { useMultichainSelector } from '../../../hooks/useMultichainSelector';
import { transitionBack } from '../../../components/ui/transition';
import {
  getDataCollectionForMarketing,
  getAnalyticsId,
  getConsentDecisionMade,
  getOptedIn,
  getPrivacyMode,
  getShowFiatInTestnets,
} from '../../../selectors';
import {
  getAsset,
  getAssetsBySelectedAccountGroup,
  getMultichainNativeAssetType,
} from '../../../selectors/assets';
import {
  getImageForChainId,
  getMultichainIsTestnet,
  getMultichainNetworkConfigurationsByChainId,
  getMultichainShouldShowFiat,
} from '../../../selectors/multichain';
import { getInternalAccountBySelectedAccountGroupAndCaip } from '../../../selectors/multichain-accounts/account-tree';
import { useSafeChains } from '../../../components/multichain/networks-form/use-safe-chains';
import { useCurrentPrice } from '../hooks/useCurrentPrice';
import { isNativeAsset, type Asset } from '../types/asset';

import { useRWAToken } from '../../../hooks/rwa/useRWAToken';
import { processAssetParams } from '../util';
import { AssetMarketDetails } from './asset-market-details';
import { AssetPageHeader } from './asset-page-header';
import AssetChart from './chart/asset-chart';
import { MarketClosedActionButton } from './market-closed-action-button';
import TokenButtons from './token-buttons';
import {
  AssetPageSecurityTrustBanner,
  AssetPageSecurityTrustHeaderBadge,
  AssetPageSecurityTrustProvider,
  AssetPageSecurityTrustSection,
} from './security-trust';

// TODO BIP44 Refactor: BIP-44 has been enabled and is stable, this page needs a significant refactor to remove confusing branching logic
const AssetPage = ({
  asset,
  optionsButton,
}: {
  asset: Asset;
  optionsButton: React.ReactNode;
}) => {
  const t = getText;
  const { decodedAsset } = processAssetParams(useParams());
  const currency = useSelector(getCurrentCurrency);
  const isEvm = isEvmChainId(asset.chainId);
  // TODO BIP44 Refactor: This selector does not work with BIP44 enabled, pass the information in the asset object
  const nativeAssetType = useSelector(getMultichainNativeAssetType);
  const accountGroupIdAssets = useSelector(getAssetsBySelectedAccountGroup);
  const caipChainId = useMemo(
    () =>
      isCaipChainId(asset.chainId)
        ? asset.chainId
        : formatChainIdToCaip(asset.chainId),
    [asset.chainId],
  );
  const selectSelectedAccount = useMemo(
    () =>
      (
        state: Parameters<
          typeof getInternalAccountBySelectedAccountGroupAndCaip
        >[0],
      ) =>
        getInternalAccountBySelectedAccountGroupAndCaip(state, caipChainId),
    [caipChainId],
  );
  const selectedAccount = useSelector(selectSelectedAccount) as InternalAccount;

  useEffect(() => {
    endTrace({ name: TraceName.AssetDetails });
  }, []);

  const { chainId, type, symbol, name, image } = asset;
  const tokenAddress =
    asset.type === AssetType.token ? asset.address : undefined;
  const aggregators =
    asset.type === AssetType.token ? asset.aggregators : undefined;

  const isSigningEnabled = useMemo(
    () =>
      selectedAccount.methods.includes(EthMethod.SignTransaction) ||
      selectedAccount.methods.includes(EthMethod.SignUserOperation) ||
      selectedAccount.methods.includes(SolMethod.SignTransaction) ||
      selectedAccount.methods.includes(BtcMethod.SignPsbt) ||
      selectedAccount.type === TrxAccountType.Eoa,
    [selectedAccount.methods, selectedAccount.type],
  );

  const isTestnet = useMultichainSelector(getMultichainIsTestnet);
  const shouldShowFiat = useMultichainSelector(getMultichainShouldShowFiat);
  const isMainnet = !isTestnet;
  // Check if show conversion is enabled
  const showFiatInTestnets = useSelector(getShowFiatInTestnets);
  const showFiat =
    shouldShowFiat && (isMainnet || (isTestnet && showFiatInTestnets));

  const consentDecisionMade = useSelector(getConsentDecisionMade);
  const isOptedIn = useSelector(getOptedIn);
  const isMetaMetricsEnabled = useMemo(
    () => consentDecisionMade && isOptedIn,
    [consentDecisionMade, isOptedIn],
  );
  const isMarketingEnabled = useSelector(getDataCollectionForMarketing);
  const analyticsId = useSelector(getAnalyticsId);

  let address =
    (() => {
      if (tokenAddress) {
        return isEvm ? toChecksumHexAddress(tokenAddress) : tokenAddress;
      }
      return isEvm ? getNativeTokenAddress(chainId) : nativeAssetType;
    })() ?? '';

  const shouldShowContractAddress = type === AssetType.token;
  const contractAddress = useMemo(() => {
    if (shouldShowContractAddress && tokenAddress) {
      return isEvm
        ? toChecksumHexAddress(tokenAddress)
        : parseCaipAssetType(address as CaipAssetType).assetReference;
    }
    return '';
  }, [shouldShowContractAddress, isEvm, tokenAddress, address]);

  const { currentPrice, marketData } = useCurrentPrice(asset);

  const assetWithBalance = accountGroupIdAssets[chainId]?.find(
    (item) =>
      item.assetId.toLowerCase() === address.toLowerCase() ||
      isArcUsdcForBridge(chainId, address, item) ||
      // TODO: This is a workaround for non-evm native assets, as the address that is received here is blank
      (!address && !isEvm && item.isNative),
  );

  // Display historical data for non-evm token without a balance
  address = assetWithBalance?.assetId || address;
  const assetId = assetWithBalance?.assetId || '';
  const balance = assetWithBalance?.balance ?? '0';
  const tokenFiatAmount = assetWithBalance?.fiat?.balance ?? 0;
  const tokenHexBalance = assetWithBalance?.rawBalance as string;

  const shouldShowSpendingCaps = isEvm;
  const portfolioSpendingCapsUrl = useMemo(
    () =>
      getPortfolioUrl(
        '',
        'asset_page',
        analyticsId,
        isMetaMetricsEnabled === true,
        isMarketingEnabled === true,
        selectedAccount.address,
        'spending-caps',
      ),
    [
      selectedAccount.address,
      isMarketingEnabled,
      isMetaMetricsEnabled,
      analyticsId,
    ],
  );

  const networkConfigurationsByChainId = useSelector(
    getMultichainNetworkConfigurationsByChainId,
  );
  const caipAssetId = isEvm
    ? toAssetId(address, caipChainId)
    : (decodedAsset as CaipAssetType);

  const securityTrustToken = useMemo(
    () => ({
      symbol,
      name,
      chainId: caipChainId,
      address,
      decimals: asset.decimals,
      isNative: type === AssetType.native,
      image,
    }),
    [address, asset.decimals, caipChainId, image, name, symbol, type],
  );

  const networkName = networkConfigurationsByChainId[chainId]?.name;
  const tokenChainImage = getImageForChainId(chainId);

  const selectBip44Asset = useMemo(
    () => (state: Parameters<typeof getAsset>[0]) =>
      getAsset(state, address, chainId),
    [address, chainId],
  );
  const bip44Asset = useSelector(selectBip44Asset);
  const rwaData =
    assetWithBalance?.rwaData ?? bip44Asset?.rwaData ?? asset.rwaData;
  const updatedAsset: Asset = {
    ...asset,
    rwaData,
    balance: {
      value: hexToDecimal(tokenHexBalance),
      display: balance,
      fiat: String(tokenFiatAmount),
    },
  };

  const tokenWithFiatAmount = useMemo(
    () => ({
      address: isEvm ? address : assetId,
      chainId,
      symbol,
      image,
      title: name ?? symbol,
      tokenFiatAmount: showFiat ? tokenFiatAmount : null,
      string: balance ? balance.toString() : '',
      decimals: asset.decimals,
      aggregators: aggregators ?? [],
      isNative: type === AssetType.native,
      balance,
      secondary: balance ? Number(balance) : 0,
      accountType: bip44Asset?.accountType,
      assetId: bip44Asset?.assetId ?? assetId,
      rwaData,
    }),
    [
      isEvm,
      address,
      assetId,
      chainId,
      symbol,
      image,
      name,
      showFiat,
      tokenFiatAmount,
      balance,
      asset.decimals,
      aggregators,
      type,
      bip44Asset,
      rwaData,
    ],
  );
  const privacyMode = useSelector(getPrivacyMode);
  const { safeChains } = useSafeChains();
  const { isStockToken: checkIsStockToken, isTokenTradingOpen } = useRWAToken();
  const isStockToken = checkIsStockToken(updatedAsset);
  const isMarketClosed = isStockToken && !isTokenTradingOpen(updatedAsset);
  const assetHeaderBadges = (
    <Box
      flexDirection={BoxFlexDirection.Row}
      alignItems={BoxAlignItems.Center}
      gap={2}
    >
      <AssetPageSecurityTrustHeaderBadge />
      {isStockToken && <StockBadge isMarketClosed={isMarketClosed} />}
    </Box>
  );

  const isUpdatedAssetNative = isNativeAsset(updatedAsset);
  const tokenAsset = isUpdatedAssetNative ? null : updatedAsset;

  const [isMarketClosedModalOpen, setIsMarketClosedModalOpen] = useState(false);
  const handleOpenMarketClosedModal = useCallback(() => {
    setIsMarketClosedModalOpen(true);
  }, []);

  const handleBack = useInAppBack(DEFAULT_ROUTE, transitionBack);

  return (
    <AssetPageSecurityTrustProvider
      assetId={caipAssetId as CaipAssetType}
      token={securityTrustToken}
    >
      <Box
        className="asset__content"
        data-testid="parent-selector-asset-details"
      >
        <AssetPageHeader
          symbol={symbol}
          image={image}
          networkImage={tokenChainImage}
          networkName={networkName}
          contractAddress={contractAddress || undefined}
          titleEndAccessory={assetHeaderBadges}
          endAccessory={optionsButton}
          onBack={handleBack}
        />

        <AssetPageSecurityTrustBanner />
        <AssetChart
          chainId={chainId}
          address={address}
          currentPrice={currentPrice}
          currency={currency}
        />
        <>
          <Box marginTop={4} paddingLeft={4} paddingRight={4}>
            {
              <>
                {isUpdatedAssetNative ? (
                  <CoinButtons
                    {...{
                      account: selectedAccount,
                      trackingLocation: 'asset-page',
                      isSigningEnabled,
                      chainId,
                      hasBalance: Boolean(
                        updatedAsset.balance?.value &&
                        updatedAsset.balance.value !== '0',
                      ),
                      disableSendForNonEvm: true,
                    }}
                  />
                ) : null}
                {tokenAsset ? (
                  <TokenButtons
                    token={tokenAsset}
                    disableSendForNonEvm
                    isMarketClosed={isMarketClosed}
                  />
                ) : null}
                {isMarketClosed && tokenAsset ? (
                  <Box marginTop={4}>
                    <MarketClosedActionButton
                      onClick={handleOpenMarketClosedModal}
                    />
                  </Box>
                ) : null}
              </>
            }
          </Box>
        </>

        <Box flexDirection={BoxFlexDirection.Column} paddingTop={3}>
          <>
            <Text
              variant={TextVariant.HeadingSm}
              className="asset-page__balance-heading"
            >
              {t('yourBalance')}
            </Text>
            {null}
            {null}
            {[AssetType.token, AssetType.native].includes(type) && (
              <TokenCell
                key={`${symbol}-${address}`}
                token={tokenWithFiatAmount as TokenWithFiatAmount}
                safeChains={safeChains}
              />
            )}
            {null}
            {null}
          </>

          <Box marginTop={6} flexDirection={BoxFlexDirection.Column} gap={4}>
            <AssetPageSecurityTrustSection />
            {[AssetType.token, AssetType.native].includes(type) && (
              <Box
                flexDirection={BoxFlexDirection.Column}
                paddingLeft={4}
                paddingRight={4}
              >
                <Text
                  variant={TextVariant.HeadingSm}
                  className="asset-page__details-heading"
                >
                  {t('tokenDetails')}
                </Text>
                <Box flexDirection={BoxFlexDirection.Column} gap={2}>
                  {renderRow(
                    t('network'),
                    <Box
                      flexDirection={BoxFlexDirection.Row}
                      alignItems={BoxAlignItems.Center}
                      gap={2}
                      data-testid="asset-network"
                    >
                      <AvatarNetwork
                        src={tokenChainImage}
                        name={networkName}
                        size={AvatarNetworkSize.Xs}
                      />
                      <Text
                        variant={TextVariant.BodyMd}
                        fontWeight={FontWeight.Medium}
                      >
                        {networkName}
                      </Text>
                    </Box>,
                  )}
                  {shouldShowContractAddress && (
                    <Box>
                      {renderRow(
                        t('contractAddress'),
                        <AddressCopyButton address={contractAddress} shorten />,
                      )}
                      <Box flexDirection={BoxFlexDirection.Column} gap={2}>
                        {asset.decimals !== undefined &&
                          renderRow(
                            t('tokenDecimal'),
                            <Text
                              variant={TextVariant.BodyMd}
                              fontWeight={FontWeight.Medium}
                              data-testid="asset-token-decimals"
                            >
                              {asset.decimals}
                            </Text>,
                          )}
                        {aggregators && aggregators.length > 0 && (
                          <Box>
                            <Text
                              variant={TextVariant.BodyMd}
                              fontWeight={FontWeight.Medium}
                              color={TextColor.TextAlternative}
                            >
                              {t('tokenList')}
                            </Text>
                            <Text
                              variant={TextVariant.BodyMd}
                              fontWeight={FontWeight.Medium}
                            >
                              {aggregators
                                .map((agg) =>
                                  agg.replace(/^metamask$/iu, 'MetaMask'),
                                )
                                .join(', ')}
                            </Text>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  )}
                  {shouldShowSpendingCaps &&
                    renderRow(
                      t('spendingCaps'),
                      <TextButton size={TextButtonSize.BodyMd} asChild>
                        <a
                          className="asset-page__spending-caps"
                          href={portfolioSpendingCapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {t('editInPortfolio')}
                        </a>
                      </TextButton>,
                    )}
                </Box>
              </Box>
            )}
            <AssetMarketDetails
              asset={updatedAsset}
              address={address}
              fallbackMarketData={marketData}
            />
            <Box className="asset-page__divider" />
            <Box marginBottom={4}>
              <Text
                variant={TextVariant.HeadingSm}
                className="asset-page__activity-heading"
              >
                {t('yourActivity')}
              </Text>
              {caipAssetId && (
                <ActivityList
                  filter={{
                    assetId: caipAssetId,
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>
        <MarketClosedModal
          isOpen={isMarketClosedModalOpen}
          onClose={() => setIsMarketClosedModalOpen(false)}
        />
      </Box>
      {/* Sibling of `asset__content` so it is a direct child of the scrolling
      container, which is what lets it stick to the bottom of the viewport. */}
    </AssetPageSecurityTrustProvider>
  );
};

function renderRow(leftColumn: string, rightColumn: ReactNode) {
  return (
    <Box
      flexDirection={BoxFlexDirection.Row}
      justifyContent={BoxJustifyContent.Between}
    >
      <Text
        color={TextColor.TextAlternative}
        variant={TextVariant.BodyMd}
        fontWeight={FontWeight.Medium}
      >
        {leftColumn}
      </Text>
      <Box>{rightColumn}</Box>
    </Box>
  );
}

export default AssetPage;
