import React, {
  useCallback,
  useContext,
  useDeferredValue,
  useMemo,
} from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

import {
  Text,
  Button,
  ButtonVariant,
  ButtonSize,
  Box,
} from '../../../../../components/component-library';
import {
  TextColor,
  TextVariant,
  Display,
  FlexDirection,
  AlignItems,
  JustifyContent,
} from '../../../../../helpers/constants/design-system';
import { useI18nContext } from '../../../../../hooks/useI18nContext';
import { type Asset } from '../../../types/send';
import { useNavigateSendPage } from '../../../hooks/send/useNavigateSendPage';
import { useAssetSelectionMetrics } from '../../../hooks/send/metrics/useAssetSelectionMetrics';
import { SendContext } from '../../../context/send';
import { Asset as AssetComponent, type TokenTagRenderer } from '../../UI/asset';
import { useScrollContainer } from '../../../../../contexts/scroll-container';
import { toNormalizedCaipAssetId } from '../../../../../../shared/lib/asset-utils';
import { useTokenAssetSecurityResults } from '../../../../../hooks/token-asset/useTokenAssetSecurityResults';

type AssetListProps = {
  tokens: Asset[];
  allTokens: Asset[];
  onClearFilters?: () => void;
  hideBalances?: boolean;
  onAssetSelect?: (asset: Asset) => void;
  emptyStateMessage?: string;
  disableMetrics?: boolean;
  tagRenderers?: TokenTagRenderer[];
  endRenderers?: TokenTagRenderer[];
};

type ListItem = { type: 'token'; asset: Asset; safetyResult?: string };

const ITEM_HEIGHT = 70;
const noop = () => undefined;

export const AssetList = ({
  tokens,
  allTokens,
  onClearFilters,
  hideBalances = false,
  onAssetSelect,
  emptyStateMessage,
  disableMetrics = false,
  tagRenderers,
  endRenderers,
}: AssetListProps) => {
  const t = useI18nContext();
  const scrollContainerRef = useScrollContainer();
  const { goToAmountRecipientPage } = useNavigateSendPage();
  // Use context directly so catalog pickers (e.g. ramps) can reuse this list
  // outside SendContextProvider when `onAssetSelect` is provided.
  const sendContext = useContext(SendContext);
  const { captureAssetSelected: captureAssetSelectedFromMetrics } =
    useAssetSelectionMetrics();
  const captureAssetSelected = disableMetrics
    ? noop
    : captureAssetSelectedFromMetrics;

  const tokenRows = useMemo(
    () =>
      tokens.map((asset) => ({
        asset,
        caipAssetId: toNormalizedCaipAssetId(
          asset.assetId ?? asset.address,
          asset.chainId,
        ),
      })),
    [tokens],
  );

  const displayedAssetIds = useMemo(
    () =>
      tokenRows
        .map(({ caipAssetId }) => caipAssetId)
        .filter((caipAssetId) => caipAssetId !== undefined),
    [tokenRows],
  );

  const deferredDisplayedAssetIds = useDeferredValue(displayedAssetIds);
  const securityResultByAssetId = useTokenAssetSecurityResults({
    assetIds: deferredDisplayedAssetIds,
  });

  const hasFilteredResults = tokens.length > 0;
  const hasAnyAssets = allTokens.length > 0;

  const handleAssetClick = useCallback(
    (asset: Asset) => {
      if (asset.disabled) {
        return;
      }

      if (onAssetSelect) {
        onAssetSelect(asset);
        return;
      }

      sendContext.updateAsset(asset);
      goToAmountRecipientPage();
      captureAssetSelected(asset);
    },
    [captureAssetSelected, goToAmountRecipientPage, onAssetSelect, sendContext],
  );

  const items: ListItem[] = [];

  tokenRows.forEach(({ asset, caipAssetId }) => {
    items.push({
      type: 'token',
      asset,
      safetyResult: caipAssetId
        ? securityResultByAssetId[caipAssetId]
        : undefined,
    });
  });

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollContainerRef?.current || document.body,
    estimateSize: () => ITEM_HEIGHT,
    overscan: 10,
  });

  // Show "no results" message only if there are assets available but none match the search
  if (!hasFilteredResults && hasAnyAssets) {
    return (
      <Box
        display={Display.Flex}
        flexDirection={FlexDirection.Column}
        alignItems={AlignItems.center}
        justifyContent={JustifyContent.center}
        margin={4}
        gap={3}
      >
        <Text
          variant={TextVariant.bodyMdMedium}
          color={TextColor.textAlternative}
        >
          {emptyStateMessage ?? t('noTokensMatchingYourFilters')}
        </Text>
        {onClearFilters && (
          <Button
            variant={ButtonVariant.Link}
            size={ButtonSize.Sm}
            onClick={onClearFilters}
            data-testid="clear-filters-button"
          >
            {t('clearFilters')}
          </Button>
        )}
      </Box>
    );
  }

  if (items.length === 0) {
    if (!emptyStateMessage) {
      return null;
    }

    return (
      <Box
        display={Display.Flex}
        flexDirection={FlexDirection.Column}
        alignItems={AlignItems.center}
        justifyContent={JustifyContent.center}
        margin={4}
        gap={3}
        data-testid="asset-list-empty"
      >
        <Text
          variant={TextVariant.bodyMdMedium}
          color={TextColor.textAlternative}
        >
          {emptyStateMessage}
        </Text>
      </Box>
    );
  }

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div
      className="relative w-full"
      style={{
        height: `${virtualizer.getTotalSize()}px`,
      }}
    >
      {virtualItems.map((virtualItem) => {
        const item = items[virtualItem.index];

        return (
          <div
            key={extractKey(item)}
            className="absolute top-0 left-0 w-full"
            style={{
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {
              <AssetComponent
                asset={item.asset}
                onClick={() => handleAssetClick(item.asset)}
                hideBalances={hideBalances}
                safetyResult={
                  item.type === 'token' ? item.safetyResult : undefined
                }
                tagRenderers={tagRenderers}
                endRenderers={endRenderers}
              />
            }
          </div>
        );
      })}
    </div>
  );
};

function extractKey(item: { type: 'token'; asset: Asset }) {
  const { asset } = item;
  if (item.type === 'token') {
    return `${asset.address ?? asset.assetId}-${asset.chainId}`;
  }
  return `${asset.address}-${asset.chainId}-${asset.tokenId}`;
}
