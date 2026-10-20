import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useDeferredSearchQuery } from '../../../../../hooks/useDeferredSearchQuery';

import {
  Display,
  FlexDirection,
} from '../../../../../helpers/constants/design-system';
import { Box } from '../../../../../components/component-library';
import { useSendAssets } from '../../../hooks/send/useSendAssets';
import { useSendAssetFilter } from '../../../hooks/send/useSendAssetFilter';
import { useAssetSelectionMetrics } from '../../../hooks/send/metrics/useAssetSelectionMetrics';
import { AssetFilterMethod } from '../../../context/send-metrics';
import { AssetList } from '../asset-list';
import { AssetFilterInput } from '../asset-filter-input';
import { NetworkFilter } from '../network-filter';
import { type Asset as AssetType } from '../../../types/send';
import { type TokenTagRenderer } from '../../UI/asset';

const noop = () => undefined;

export type AssetProps = {
  includeNoBalance?: boolean;
  onAssetSelect?: (asset: AssetType) => void;
  tokenFilter?: (assets: AssetType[]) => AssetType[];
  /**
   * When provided, these tokens are used instead of wallet tokens from
   * `useSendAssets`. Useful for catalog-style pickers (e.g. ramps).
   */
  tokens?: AssetType[];
  hideBalances?: boolean;
  disableMetrics?: boolean;
  searchPlaceholder?: string;
  emptyStateMessage?: string;
  onSearchQueryChange?: (searchQuery: string) => void;
  onSelectedChainIdChange?: (selectedChainId: string | null) => void;
  /**
   * Optional tag renderers shown next to token names (e.g. "No fee").
   */
  tagRenderers?: TokenTagRenderer[];
  /**
   * Optional row-end accessory renderers (e.g. ramps' unavailable-token info
   * button), vertically centered against the full row like the balance
   * column.
   */
  endRenderers?: TokenTagRenderer[];
};

type AssetPickerViewProps = Omit<AssetProps, 'tokens' | 'includeNoBalance'> & {
  tokens: AssetType[];
};

const AssetPickerView = ({
  onAssetSelect,
  tokenFilter,
  tokens,
  hideBalances = false,
  disableMetrics = false,
  searchPlaceholder,
  emptyStateMessage,
  onSearchQueryChange,
  onSelectedChainIdChange,
  tagRenderers,
  endRenderers,
}: AssetPickerViewProps) => {
  const [selectedChainId, setSelectedChainId] = useState<string | null>(null);
  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    deferredQuery: deferredSearchQuery,
  } = useDeferredSearchQuery();
  const {
    addAssetFilterMethod: addAssetFilterMethodFromMetrics,
    removeAssetFilterMethod: removeAssetFilterMethodFromMetrics,
    setAssetListSize: setAssetListSizeFromMetrics,
  } = useAssetSelectionMetrics();

  const addAssetFilterMethod = disableMetrics
    ? noop
    : addAssetFilterMethodFromMetrics;
  const removeAssetFilterMethod = disableMetrics
    ? noop
    : removeAssetFilterMethodFromMetrics;
  const setAssetListSize = disableMetrics ? noop : setAssetListSizeFromMetrics;

  const filteredByCustomFilter = useMemo(() => {
    return tokenFilter ? tokenFilter(tokens) : tokens;
  }, [tokens, tokenFilter]);

  const { filteredTokens } = useSendAssetFilter({
    tokens: filteredByCustomFilter,
    selectedChainId,
    searchQuery: deferredSearchQuery,
  });

  useEffect(() => {
    const allAssets = tokens;
    setAssetListSize(allAssets.length.toString());
  }, [tokens, setAssetListSize]);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedChainId(null);
    onSearchQueryChange?.('');
    onSelectedChainIdChange?.(null);
  }, [onSearchQueryChange, onSelectedChainIdChange, setSearchQuery]);

  const handleSearchQueryChange = useCallback(
    (value: string) => {
      if (value === '') {
        removeAssetFilterMethod(AssetFilterMethod.Search);
      } else {
        addAssetFilterMethod(AssetFilterMethod.Search);
      }
      setSearchQuery(value);
      onSearchQueryChange?.(value);
    },
    [
      addAssetFilterMethod,
      onSearchQueryChange,
      removeAssetFilterMethod,
      setSearchQuery,
    ],
  );

  const handleSelectedChainIdChange = useCallback(
    (chainId: string | null) => {
      setSelectedChainId(chainId);
      onSelectedChainIdChange?.(chainId);
    },
    [onSelectedChainIdChange],
  );

  return (
    <Box
      display={Display.Flex}
      flexDirection={FlexDirection.Column}
      style={{ flex: 1, height: '100%' }}
    >
      <AssetFilterInput
        searchQuery={searchQuery}
        onChange={handleSearchQueryChange}
        placeholder={searchPlaceholder}
      />
      <NetworkFilter
        tokens={filteredByCustomFilter}
        selectedChainId={selectedChainId}
        onChainIdChange={handleSelectedChainIdChange}
        disableMetrics={disableMetrics}
      />
      <AssetList
        tokens={filteredTokens}
        allTokens={filteredByCustomFilter}
        onClearFilters={handleClearFilters}
        hideBalances={hideBalances}
        onAssetSelect={onAssetSelect}
        emptyStateMessage={emptyStateMessage}
        disableMetrics={disableMetrics}
        tagRenderers={tagRenderers}
        endRenderers={endRenderers}
      />
    </Box>
  );
};

type SendWalletAssetPickerProps = Omit<AssetProps, 'tokens'> & {
  includeNoBalance?: boolean;
};

const SendWalletAssetPicker = ({
  includeNoBalance = false,
  ...props
}: SendWalletAssetPickerProps) => {
  const sendAssets = useSendAssets({ includeNoBalance });

  return <AssetPickerView {...props} tokens={sendAssets.tokens} />;
};

type CatalogAssetPickerProps = Omit<
  AssetProps,
  'tokens' | 'includeNoBalance'
> & {
  tokens: AssetType[];
};

const CatalogAssetPicker = ({ tokens, ...props }: CatalogAssetPickerProps) => {
  return <AssetPickerView {...props} tokens={tokens} />;
};

/**
 * Asset picker used by send and catalog flows (e.g. ramps).
 * When `tokens` is provided, wallet asset hooks are skipped.
 * @param props
 */
export const Asset = (props: AssetProps = {}) => {
  if (props.tokens !== undefined) {
    return <CatalogAssetPicker {...props} tokens={props.tokens} />;
  }

  return <SendWalletAssetPicker {...props} />;
};
