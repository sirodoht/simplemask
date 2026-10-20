import { isObject } from '@metamask/utils';
import type { Migrate } from './types';

export const version = 244;

/**
 * Retire non-EVM service state without changing encrypted keys or EVM history.
 *
 * @param versionedData - Persisted wallet state.
 * @param changedKeys - Controllers requiring persistence.
 */
export const migrate = (async (versionedData, changedKeys) => {
  versionedData.meta.version = version;
  const state = versionedData.data;
  for (const key of [
    'MultichainAssetsController',
    'MultichainBalancesController',
    'MultichainAssetsRatesController',
    'MultichainTransactionsController',
  ]) {
    if (Object.hasOwn(state, key)) {
      delete state[key];
      changedKeys.add(key);
    }
  }
  const network = state.MultichainNetworkController;
  if (isObject(network)) {
    network.isEvmSelected = true;
    network.multichainNetworkConfigurationsByChainId = {};
    delete network.selectedMultichainNetworkChainId;
    changedKeys.add('MultichainNetworkController');
  }
  const enablement = state.NetworkEnablementController;
  if (isObject(enablement) && isObject(enablement.enabledNetworkMap)) {
    const evm = isObject(enablement.enabledNetworkMap.eip155)
      ? enablement.enabledNetworkMap.eip155
      : {};
    if (!Object.values(evm).some(Boolean)) {
      evm['0x1'] = true;
    }
    enablement.enabledNetworkMap = { eip155: evm };
    if (isObject(enablement.nativeAssetIdentifiers)) {
      enablement.nativeAssetIdentifiers = Object.fromEntries(
        Object.entries(enablement.nativeAssetIdentifiers).filter(([id]) =>
          id.startsWith('eip155:'),
        ),
      );
    }
    changedKeys.add('NetworkEnablementController');
  }
  const accounts = state.AccountsController;
  if (isObject(accounts) && isObject(accounts.internalAccounts)) {
    const internal = accounts.internalAccounts;
    if (isObject(internal.accounts)) {
      const evm = Object.entries(internal.accounts).filter(
        ([, account]) =>
          isObject(account) &&
          (account.type === 'eip155:eoa' || account.type === 'eip155:erc4337'),
      );
      if (!evm.some(([id]) => id === internal.selectedAccount)) {
        internal.selectedAccount = evm[0]?.[0] ?? '';
        changedKeys.add('AccountsController');
      }
    }
  }
  // The tree is rebuilt from the EVM account list after unlock. Preserve names
  // and other account metadata in AccountsController and the encrypted keyrings.
  const tree = state.AccountTreeController;
  if (isObject(tree)) {
    tree.accountTree = { wallets: {} };
    tree.selectedAccountGroup = '';
    changedKeys.add('AccountTreeController');
  }
  const assets = state.AssetsController;
  if (isObject(assets)) {
    for (const key of ['assetsInfo', 'assetsPrice', 'assetPreferences']) {
      if (isObject(assets[key])) {
        assets[key] = Object.fromEntries(
          Object.entries(assets[key]).filter(([id]) =>
            id.startsWith('eip155:'),
          ),
        );
      }
    }
    for (const key of ['assetsBalance', 'customAssets']) {
      if (isObject(assets[key])) {
        for (const [accountId, values] of Object.entries(assets[key])) {
          if (Array.isArray(values)) {
            assets[key][accountId] = values.filter(
              (id) => typeof id === 'string' && id.startsWith('eip155:'),
            );
          } else if (isObject(values)) {
            assets[key][accountId] = Object.fromEntries(
              Object.entries(values).filter(([id]) => id.startsWith('eip155:')),
            );
          }
        }
      }
    }
    changedKeys.add('AssetsController');
  }
  const permissions = state.PermissionController;
  if (isObject(permissions) && isObject(permissions.subjects)) {
    for (const subject of Object.values(permissions.subjects)) {
      if (!isObject(subject) || !isObject(subject.permissions)) {
        continue;
      }
      const permission = subject.permissions['endowment:caip25'];
      if (!isObject(permission) || !Array.isArray(permission.caveats)) {
        continue;
      }
      for (const caveat of permission.caveats) {
        if (!isObject(caveat) || !isObject(caveat.value)) {
          continue;
        }
        for (const key of ['requiredScopes', 'optionalScopes']) {
          const scopes = caveat.value[key];
          if (isObject(scopes)) {
            caveat.value[key] = Object.fromEntries(
              Object.entries(scopes).filter(
                ([scope]) =>
                  scope.startsWith('eip155:') ||
                  scope === 'wallet' ||
                  scope === 'wallet:eip155',
              ),
            );
          }
        }
      }
    }
    changedKeys.add('PermissionController');
  }
}) satisfies Migrate;
