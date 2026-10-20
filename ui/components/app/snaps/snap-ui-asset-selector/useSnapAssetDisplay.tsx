import {
  CaipAccountId,
  CaipAssetType,
  CaipChainId,
  Hex,
  parseCaipAccountId,
  parseCaipAssetType,
} from '@metamask/utils';
import { useSelector } from 'react-redux';
import { getInternalAccountByAddress } from '../../../../selectors';
import {
  getAssetsInfo,
  getAssetsBalance,
  getAssetsPrice,
} from '../../../../selectors/assets';
import { useFormatters } from '../../../../hooks/useFormatters';
import { getCurrentCurrency } from '../../../../ducks/metamask/metamask';
import { getIntlLocale } from '../../../../ducks/locale/locale';
import { formatWithThreshold } from '../../assets/util/formatWithThreshold';
import { getImageForChainId } from '../../../../selectors/multichain';
import { getNetworkConfigurationsByChainId } from '../../../../../shared/lib/selectors/networks';

/** An EVM asset offered by a Snap form. */
export type SnapUIAsset = {
  icon: string;
  symbol: string;
  name: string;
  balance: string;
  fiat: string;
  chainId: CaipChainId;
  address: CaipAssetType;
  networkName: string;
  networkIcon?: string;
};

type UseSnapAssetSelectorDataParams = {
  addresses: CaipAccountId[];
  chainIds?: CaipChainId[];
};

/**
 * Format retained EVM assets for Snap forms, scoped to the requested account.
 *
 * @param params - Requested accounts and chains.
 * @param params.addresses - CAIP account addresses.
 * @param params.chainIds - Optional additional chain filter.
 * @returns Available EVM assets.
 */
export const useSnapAssetSelectorData = ({
  addresses,
  chainIds,
}: UseSnapAssetSelectorDataParams): SnapUIAsset[] => {
  const currency = useSelector(getCurrentCurrency);
  const locale = useSelector(getIntlLocale);
  const { formatTokenQuantity } = useFormatters();
  const parsed = addresses.map(parseCaipAccountId);
  const account = useSelector((state) =>
    parsed[0]
      ? getInternalAccountByAddress(state, parsed[0].address)
      : undefined,
  );
  const metadata = useSelector(getAssetsInfo);
  const balances = useSelector(getAssetsBalance);
  const prices = useSelector(getAssetsPrice);
  const networks = useSelector(getNetworkConfigurationsByChainId);
  if (!account) {
    return [];
  }

  const matchesChain = (requested: CaipChainId, actual: CaipChainId) =>
    requested === 'eip155:0' || requested === actual;

  return Object.entries(balances[account.id] ?? {}).flatMap(([id, balance]) => {
    if (!id.startsWith('eip155:')) {
      return [];
    }
    const assetId = id as CaipAssetType;
    const { chainId } = parseCaipAssetType(assetId);
    const info = metadata[assetId];
    if (
      !info ||
      (info.type !== 'native' && info.type !== 'erc20') ||
      !('amount' in balance) ||
      !parsed.some(
        (address) =>
          address.address.toLowerCase() === account.address.toLowerCase() &&
          matchesChain(address.chainId, chainId),
      ) ||
      (chainIds && !chainIds.some((chain) => matchesChain(chain, chainId)))
    ) {
      return [];
    }
    const hexChainId = `0x${BigInt(chainId.split(':')[1]).toString(16)}` as Hex;
    const amount = Number(balance.amount);
    return [
      {
        icon: info.image ?? '',
        symbol: info.symbol,
        name: info.name,
        balance: formatTokenQuantity(amount, info.symbol),
        fiat: formatWithThreshold(
          amount * (prices[assetId]?.price ?? 0),
          0.01,
          locale,
          {
            style: 'currency',
            currency: currency.toUpperCase(),
          },
        ),
        chainId,
        address: assetId,
        networkName: networks[hexChainId]?.name ?? chainId,
        networkIcon: getImageForChainId(hexChainId),
      },
    ];
  });
};
