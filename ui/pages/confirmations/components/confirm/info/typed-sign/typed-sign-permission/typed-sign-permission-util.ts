import { Hex } from '@metamask/utils';
import { useSelector } from 'react-redux';
import {
  selectNetworkConfigurationByChainId,
  type NetworkConfigurationsByChainIdState,
} from '../../../../../../../../shared/lib/selectors/networks';
import { getTokenByAccountAndAddressAndChainId } from '../../../../../../../selectors/assets';
import type { getText } from '../../../../../../../helpers/utils/text';

export { MAX_UINT256 } from '../../../../../../../../shared/lib/gator-permissions/permission-constants';

/**
 * Retrieves ERC-20 token details (label and decimals) for a given token address and chain ID.
 *
 * Uses the Redux selector to fetch the token object from state. The label is determined by
 * preferring the token's name, falling back to its symbol if the name is not available.
 *
 * @param params - An object containing:
 * @param params.tokenAddress - The hexadecimal address of the ERC-20 token.
 * @param params.chainId - The hexadecimal chain ID where the token resides.
 * @returns the token details
 */
export const useErc20TokenDetails = ({
  tokenAddress,
  chainId,
}: {
  tokenAddress: Hex;
  chainId: Hex;
}): {
  label: string | undefined;
  decimals: number | undefined;
} => {
  const token = useSelector((state) =>
    getTokenByAccountAndAddressAndChainId(
      state,
      undefined, // Defaults to the selected account
      tokenAddress,
      chainId as Hex,
    ),
  );

  return {
    label: token?.name || token?.symbol,
    decimals: token?.decimals,
  };
};

/**
 * Retrieves the native token label (symbol or name) for a given chain ID.
 *
 * Uses the Redux selector to fetch the network configuration from state.
 *
 * @param chainId - The hexadecimal chain ID.
 * @returns The native token label (symbol or name), or undefined if not found.
 */
export const useNativeTokenLabel = (chainId: Hex): string => {
  const config = useSelector((state: NetworkConfigurationsByChainIdState) =>
    selectNetworkConfigurationByChainId(state, chainId),
  );

  return config?.nativeCurrency ?? 'NATIVE';
};

/**
 * Returns the English description for a given permission type.
 *
 * @param getTextForKey - English text function
 * @param permissionType - decoded permission type identifier
 * @returns Localized description string
 */
export const getPermissionDescription = (
  getTextForKey: typeof getText,
  permissionType?: string,
): string => {
  switch (permissionType) {
    case 'token-approval-revocation':
      return getTextForKey('confirmTitleDescTokenApprovalRevocation');
    default:
      return getTextForKey('confirmTitleDescPermission');
  }
};
