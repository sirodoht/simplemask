import ZENDESK_URLS from './zendesk-url';

export const PRIMARY = 'PRIMARY';
export const SECONDARY = 'SECONDARY';

const _contractAddressLink = ZENDESK_URLS.CONTRACT_ADDRESS_WARNING;

export const TRANSACTION_SHIELD_SUPPORT_LINK = ZENDESK_URLS.TRANSACTION_SHIELD;

export const TRANSACTION_SHIELD_LINK = 'https://metamask.io/transaction-shield';

export const FIND_TRANSACTION_HASH_LINK = ZENDESK_URLS.FIND_TRANSACTION_HASH;
export const METAMETRICS_SETTINGS_LINK = ZENDESK_URLS.METAMETRICS_SETTINGS;
// eslint-disable-next-line prefer-destructuring
export const SUPPORT_LINK = process.env.SUPPORT_LINK;
export const CONTRACT_ADDRESS_LINK = _contractAddressLink;
export const PASSWORD_MIN_LENGTH = 8;
