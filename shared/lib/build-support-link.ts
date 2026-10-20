export type SupportLinkUserData = {
  version: string;
  customerServiceToken?: string;
};

/**
 * Builds a MetaMask support URL with support metadata.
 *
 * @param supportLink - Base support URL from environment configuration.
 * @param userData - Support metadata to append as query parameters. `version` is required;
 * other fields are included only when provided.
 * @param userData.version
 * @param userData.customerServiceToken
 * @returns Support URL with appended query parameters.
 */
export function buildSupportLinkWithUserData(
  supportLink: string,
  { version, customerServiceToken }: SupportLinkUserData,
): string {
  const url = new URL(supportLink);
  url.searchParams.append('metamask_version', version);
  if (customerServiceToken) {
    url.searchParams.append('customer_service_token', customerServiceToken);
  }
  return url.toString();
}
