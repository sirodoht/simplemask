import {
  IconName,
  InvisibleCharacter,
} from '../../components/component-library';
import {
  GOERLI_DISPLAY_NAME,
  LINEA_GOERLI_DISPLAY_NAME,
  LINEA_SEPOLIA_DISPLAY_NAME,
  SEPOLIA_DISPLAY_NAME,
} from '../../../shared/constants/network';
import { BackgroundColor } from '../constants/design-system';
import { KeyringType } from '../../../shared/constants/keyring';
import { HardwareKeyringNames } from '../../../shared/constants/hardware-wallets';
import { getText as t } from '../../../shared/lib/text';
import { isSnapPreinstalled } from '../../../shared/lib/snaps/snaps';

export function getAccountNameErrorMessage(
  accounts,
  newAccountName,
  defaultAccountName,
) {
  const isDuplicateAccountName = accounts.some(
    (item) =>
      item.metadata?.name?.toLowerCase() === newAccountName?.toLowerCase(),
  );

  const isEmptyAccountName = !newAccountName || newAccountName === '';

  const accountLabel = t('newAccountNumberName').replace(' $1', '');

  // Reserve the English account label followed by a number, case insensitive
  // Trim spaces before and after
  const reservedRegEx = new RegExp(`^\\s*${accountLabel} \\d+\\s*$`, 'iu');
  const isReservedAccountName = reservedRegEx.test(newAccountName || '');

  const isValidAccountName =
    newAccountName?.toLowerCase() === defaultAccountName?.toLowerCase() || // What is written in the text
    // field is the same as the
    // placeholder
    (!isDuplicateAccountName && !isReservedAccountName && !isEmptyAccountName);

  let errorMessage;
  if (isValidAccountName) {
    errorMessage = InvisibleCharacter; // Using an invisible character, so the spacing stays
    // constant
  } else if (isDuplicateAccountName) {
    errorMessage = t('accountNameDuplicate');
  } else if (isReservedAccountName) {
    errorMessage = t('accountNameReserved');
  } else if (isEmptyAccountName) {
    errorMessage = t('required');
  }

  return { isValidAccountName, errorMessage };
}

export function getAvatarNetworkColor(name) {
  switch (name) {
    case GOERLI_DISPLAY_NAME:
      return BackgroundColor.goerli;
    case LINEA_GOERLI_DISPLAY_NAME:
      return BackgroundColor.lineaGoerli;
    case LINEA_SEPOLIA_DISPLAY_NAME:
      return BackgroundColor.lineaSepolia;
    case SEPOLIA_DISPLAY_NAME:
      return BackgroundColor.sepolia;
    default:
      return undefined;
  }
}

const TESTNET_BACKGROUND_CSS_VARS = {
  [BackgroundColor.goerli]: 'var(--color-network-goerli-default)',
  [BackgroundColor.sepolia]: 'var(--color-network-sepolia-default)',
  [BackgroundColor.lineaGoerli]: 'var(--color-network-linea-goerli-default)',
  [BackgroundColor.lineaSepolia]: 'var(--color-network-linea-sepolia-default)',
};

/**
 * Maps a testnet BackgroundColor token to an inline style for MMDS AvatarNetwork.
 *
 * @param {BackgroundColor | undefined} backgroundColor - Testnet background color token.
 * @returns {import('react').CSSProperties} Inline style object for AvatarNetwork.
 */
export function getAvatarNetworkStyleFromBackgroundColor(backgroundColor) {
  if (!backgroundColor) {
    return {};
  }

  const cssVar = TESTNET_BACKGROUND_CSS_VARS[backgroundColor];
  return cssVar ? { backgroundColor: cssVar } : {};
}

/**
 * Returns testnet-specific AvatarNetwork inline styles from a network display name.
 *
 * @param {string | undefined} name - Network display name.
 * @returns {import('react').CSSProperties} Inline style object for AvatarNetwork.
 */
export function getAvatarNetworkStyle(name) {
  return getAvatarNetworkStyleFromBackgroundColor(getAvatarNetworkColor(name));
}

const toSrpLabel = (index) =>
  // Index starts at 1, for SRPs.
  `SRP #${index + 1}`;

export function getAccountLabels(type, account, keyrings, snapName) {
  if (!account) {
    return [];
  }

  const labels = [];

  const hdKeyrings = keyrings.filter(
    (keyring) => keyring.type === KeyringType.hdKeyTree,
  );

  switch (type) {
    case KeyringType.hdKeyTree: {
      if (hdKeyrings.length > 1) {
        const hdKeyringIndex = hdKeyrings.findIndex((kr) =>
          kr.accounts.includes(account.address),
        );
        labels.push({
          label: toSrpLabel(hdKeyringIndex),
          icon: null,
        });
      }
      break;
    }
    case KeyringType.imported:
      labels.push({
        label: t('imported'),
        icon: null,
      });
      break;
    case KeyringType.qr:
      labels.push({
        label: HardwareKeyringNames.qr,
        icon: null,
      });
      break;
    case KeyringType.trezor:
      labels.push({
        label: HardwareKeyringNames.trezor,
        icon: null,
      });
      break;
    case KeyringType.ledger:
      labels.push({
        label: HardwareKeyringNames.ledger,
        icon: null,
      });
      break;
    case KeyringType.oneKey:
      labels.push({
        label: HardwareKeyringNames.oneKey,
        icon: null,
      });
      break;
    case KeyringType.lattice:
      labels.push({
        label: HardwareKeyringNames.lattice,
        icon: null,
      });
      break;
    case KeyringType.snap: {
      const { entropySource } = account.options;
      if (entropySource && hdKeyrings.length > 1) {
        const hdKeyringIndex = hdKeyrings.findIndex(
          (kr) => kr.metadata.id === entropySource,
        );
        labels.push({
          label: toSrpLabel(hdKeyringIndex),
          icon: null,
        });
      }

      const isPreinstalled = isSnapPreinstalled(account.metadata.snap.id);

      if (isPreinstalled) {
        break;
      }

      if (snapName) {
        labels.push({
          label: `${snapName} (${t('beta')})`,
          icon: IconName.Snaps,
        });
        break;
      }
      labels.push({
        label: `${t('snaps')} (${t('beta')})`,
        icon: IconName.Snaps,
      });
      break;
    }
    default: {
      break;
    }
  }

  return labels;
}
