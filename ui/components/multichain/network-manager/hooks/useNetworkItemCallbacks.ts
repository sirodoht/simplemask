import { useCallback } from 'react';
import { EthScope } from '@metamask/keyring-api';
import { type MultichainNetworkConfiguration } from '@metamask/multichain-network-controller';
import { type CaipChainId } from '@metamask/utils';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { CHAIN_IDS } from '../../../../../shared/constants/network';
import {
  convertCaipToHexChainId,
  getRpcDataByChainId,
} from '../../../../../shared/lib/network.utils';
import { isDisableableDefaultNetwork } from '../../../../helpers/utils/network-sections';
import {
  removeNetwork,
  setEditedNetwork,
  showModal,
} from '../../../../store/actions';
import {
  getMultichainNetworkConfigurationsByChainId,
  getSelectedMultichainNetworkChainId,
} from '../../../../selectors';
import { getCompletedOnboarding } from '../../../../ducks/metamask/metamask';
import { getIsUnlocked } from '../../../../ducks/metamask/base-selectors';
import { useAccountNetworkAvailability } from '../../../../hooks/accounts/useAccountNetworkAvailability';
import { useDispatch } from '../../../../store/hooks';

export type NetworkItemCallbacks = {
  onDelete?: () => void;
  onDeleteMenuLabel?: 'disable' | 'delete';
  onEdit?: () => void;
  onRpcConfigEdit?: () => void;
  onRpcSelect?: () => void;
};

export const useNetworkItemCallbacks = () => {
  const dispatch = useDispatch();
  const [, setSearchParams] = useSearchParams();
  const isUnlocked = useSelector(getIsUnlocked);
  const currentChainId = useSelector(getSelectedMultichainNetworkChainId);
  const [, evmNetworks] = useSelector(
    getMultichainNetworkConfigurationsByChainId,
  );
  const completedOnboarding = useSelector(getCompletedOnboarding);

  const { hasAnyAccountsInNetwork } = useAccountNetworkAvailability();

  const hasMultiRpcOptions = useCallback(
    (network: MultichainNetworkConfiguration): boolean =>
      network.isEvm &&
      getRpcDataByChainId(network.chainId, evmNetworks).rpcEndpoints.length > 1,
    [evmNetworks],
  );

  const isNetworkEnabled = useCallback(
    (network: MultichainNetworkConfiguration): boolean => {
      return (
        network.isEvm ||
        completedOnboarding ||
        hasAnyAccountsInNetwork(network.chainId)
      );
    },
    [hasAnyAccountsInNetwork, completedOnboarding],
  );

  const getItemCallbacks = useCallback(
    (network: MultichainNetworkConfiguration): NetworkItemCallbacks => {
      const { chainId, isEvm } = network;
      const hexChainId = isEvm ? convertCaipToHexChainId(chainId) : undefined;
      const isDisableableDefault = isDisableableDefaultNetwork(chainId);
      const isEthereumMainnet =
        chainId === EthScope.Mainnet ||
        (isEvm && hexChainId === CHAIN_IDS.MAINNET);
      const isSelectedNetwork =
        chainId === currentChainId ||
        (Boolean(hexChainId) && hexChainId === currentChainId);

      const canRemoveOrDisable =
        isUnlocked &&
        !isSelectedNetwork &&
        (isDisableableDefault
          ? !isEthereumMainnet
          : isEvm &&
            chainId !== currentChainId &&
            chainId !== EthScope.Mainnet);

      let onDeleteMenuLabel: 'disable' | 'delete' | undefined;
      if (canRemoveOrDisable) {
        onDeleteMenuLabel = isDisableableDefault ? 'disable' : 'delete';
      }

      const modalProps = {
        onConfirm: () => undefined,
        onHide: () => undefined,
      };

      const onDelete = canRemoveOrDisable
        ? () => {
            if (isDisableableDefault) {
              dispatch(removeNetwork(chainId as CaipChainId));
              return;
            }
            dispatch(
              showModal({
                name: 'CONFIRM_DELETE_NETWORK',
                target: hexChainId,
                ...modalProps,
              }),
            );
          }
        : undefined;

      if (!isEvm) {
        return {
          onDelete,
          onDeleteMenuLabel,
        };
      }

      const evmHexChainId = convertCaipToHexChainId(chainId);

      return {
        onDelete,
        onDeleteMenuLabel,
        onEdit: () => {
          dispatch(
            setEditedNetwork({
              chainId: evmHexChainId,
              nickname: network.name,
            }),
          );
          setSearchParams({ view: 'edit' });
        },
        onRpcConfigEdit: hasMultiRpcOptions(network)
          ? () => {
              setSearchParams({ view: 'add-rpc' });
              dispatch(
                setEditedNetwork({
                  chainId: evmHexChainId,
                }),
              );
            }
          : undefined,
        onRpcSelect: () => {
          dispatch(
            setEditedNetwork({
              chainId: evmHexChainId,
            }),
          );
          setSearchParams({ view: 'select-rpc' });
        },
      };
    },
    [currentChainId, dispatch, hasMultiRpcOptions, isUnlocked, setSearchParams],
  );

  return {
    getItemCallbacks,
    hasMultiRpcOptions,
    isNetworkEnabled,
  };
};
