import {
  Box,
  BoxFlexDirection,
  Button,
  ButtonSize,
  ButtonVariant,
  IconName,
} from '@metamask/design-system-react';
import { formatChainIdToCaip } from '@metamask/bridge-controller';
import React, { useCallback, useContext, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ALL_ALLOWED_BRIDGE_CHAIN_IDS } from '../../../../shared/constants/bridge';
import {
  MetaMetricsEventName,
  MetaMetricsSwapsEventSource,
} from '../../../../shared/constants/metametrics';
import { getSwapNativeTokenWithOverridesForChain } from '../../../components/app/wallet-overview/coin-buttons';
import { transitionForward } from '../../../components/ui/transition';
import { I18nContext } from '../../../contexts/i18n';
import useBridging from '../../../hooks/bridge/useBridging';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { getUseExternalServices } from '../../../selectors';
import { useBalanceAwareSwapDefaults } from '../hooks/useBalanceAwareSwapDefaults';
import { isNativeAsset, type Asset } from '../types/asset';
import { getUsdAmountRange } from '../utils/get-usd-amount-range';
import {
  useAssetPageSecurityTrustCtaGate,
  useAssetPageSecurityTrustCtaGateReady,
} from './security-trust';

const STICKY_PRIMARY_BUTTON_CLASS_NAME =
  'flex-1 bg-success-default text-success-inverse hover:bg-success-default-hover active:bg-success-default-pressed';

type AssetStickyActionsProps = {
  asset: Asset;
  /** Disables Swap while a stock token's market is closed */
  isMarketClosed?: boolean;
  /** Native assets cannot swap from accounts that cannot sign */
  isSigningEnabled?: boolean;
};

/**
 * Swap call to action, pinned to the bottom of the asset page so they
 * stay reachable while the rest of the page scrolls.
 *
 * @param props - The component props.
 * @param props.asset - The native or token asset being displayed.
 * @param props.isMarketClosed - Whether the asset's stock market is closed.
 * @param props.isSigningEnabled - Whether the selected account can sign.
 */
export const AssetStickyActions = ({
  asset,
  isMarketClosed = false,
  isSigningEnabled = true,
}: AssetStickyActionsProps) => {
  const t = useContext(I18nContext);
  const { trackEvent, createEventBuilder } = useAnalytics();
  const isExternalServicesEnabled = useSelector(getUseExternalServices);
  const gateCtaAction = useAssetPageSecurityTrustCtaGate();
  const isCtaGateReady = useAssetPageSecurityTrustCtaGateReady();
  const { openBridgeExperience } = useBridging();

  const isNative = isNativeAsset(asset);
  const { chainId, symbol } = asset;

  const currentSwapToken = useMemo(() => {
    if (!isNativeAsset(asset)) {
      return asset;
    }

    if (!ALL_ALLOWED_BRIDGE_CHAIN_IDS.includes(chainId)) {
      return null;
    }

    // Native swaps start from the chain's default bridge asset, which some
    // chains override (e.g. Arc swaps the ERC20 flavor of USDC).
    const nativeSwapToken = getSwapNativeTokenWithOverridesForChain(chainId);
    return {
      symbol: nativeSwapToken.symbol,
      address: nativeSwapToken.address,
      // `getNativeAssetForChainId` reports the chain as a decimal number, which
      // the bridge entry point does not recognize as a supported chain.
      chainId: formatChainIdToCaip(chainId),
      decimals: nativeSwapToken.decimals,
      name: nativeSwapToken.name ?? nativeSwapToken.symbol,
    };
  }, [asset, chainId]);

  const { sourceToken, destTokenAssetId } = useBalanceAwareSwapDefaults({
    currentToken: currentSwapToken,
    currentTokenBalance: asset.balance?.value ?? asset.balance?.display,
  });

  const trackStickyCtaClick = useCallback(
    (ctaType: 'buy' | 'swap') => {
      trackEvent(
        createEventBuilder(MetaMetricsEventName.TokenDetailsCtaClicked)
          .addProperties({
            // eslint-disable-next-line @typescript-eslint/naming-convention
            cta_type: ctaType,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            usd_amount_range: getUsdAmountRange(asset.balance?.fiat),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            token_address: currentSwapToken?.address ?? '',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            chain_id: chainId,
          })
          .build(),
      );
    },
    [
      asset.balance?.fiat,
      chainId,
      createEventBuilder,
      currentSwapToken?.address,
      trackEvent,
    ],
  );

  const handleSwapClick = useCallback(() => {
    trackStickyCtaClick('swap');

    const runSwap = () => {
      if (isNative) {
        transitionForward(() =>
          openBridgeExperience(
            MetaMetricsSwapsEventSource.MainView,
            sourceToken,
            destTokenAssetId,
          ),
        );
        return;
      }

      openBridgeExperience(
        MetaMetricsSwapsEventSource.TokenView,
        sourceToken,
        destTokenAssetId,
      );
    };

    if (gateCtaAction) {
      gateCtaAction(runSwap, 'swap');
      return;
    }

    runSwap();
  }, [
    destTokenAssetId,
    gateCtaAction,
    isNative,
    openBridgeExperience,
    sourceToken,
    trackStickyCtaClick,
  ]);

  const isSwapDisabled =
    !isExternalServicesEnabled ||
    !isCtaGateReady ||
    isMarketClosed ||
    (isNative && !isSigningEnabled);

  return (
    <Box
      // Sticky CTA footer: pinned to the bottom of the asset page scroll
      // container, elevated above content, and padded for the device safe-area.
      // Uses `.cta-footer` so the toaster lifts above it.
      className="cta-footer sticky inset-x-0 bottom-0 z-[1] mt-auto shrink-0 border-t border-muted bg-default px-4 pt-3 pb-[calc(16px+env(safe-area-inset-bottom,0px))] shadow-[0_-4px_12px_var(--color-shadow-default)]"
      flexDirection={BoxFlexDirection.Row}
      gap={3}
      data-testid="asset-sticky-actions"
    >
      <Button
        variant={ButtonVariant.Primary}
        size={ButtonSize.Lg}
        startIconName={IconName.SwapVertical}
        className={STICKY_PRIMARY_BUTTON_CLASS_NAME}
        onClick={handleSwapClick}
        disabled={isSwapDisabled}
        data-testid="asset-sticky-swap"
      >
        {t('swap')}
      </Button>
    </Box>
  );
};

export default AssetStickyActions;
