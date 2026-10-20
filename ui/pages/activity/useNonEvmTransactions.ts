import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectNonEvmActivityItems } from '../../selectors/activity';
import { activityMatchesAssetId, type ActivityListFilter } from './helpers';

export function useNonEvmTransactions(filters: ActivityListFilter) {
  const nonEvmItems = useSelector(selectNonEvmActivityItems);
  const assetId = 'assetId' in filters ? filters.assetId : undefined;
  const networks = 'networks' in filters ? filters.networks : undefined;

  return useMemo(() => {
    let items = nonEvmItems;

    if (assetId) {
      items = items.filter((item) => activityMatchesAssetId(item, assetId));
    } else if (networks?.length) {
      const selectedNetworks = new Set(networks);
      items = items.filter((item) => selectedNetworks.has(item.chainId));
    } else {
      return [];
    }

    return items;
  }, [assetId, networks, nonEvmItems]);
}
