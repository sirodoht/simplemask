const RETIRED_WALLET_SNAPS = new Set([
  'npm:@metamask/bitcoin-wallet-snap',
  'npm:@metamask/solana-wallet-snap',
  'npm:@metamask/tron-wallet-snap',
  'npm:@metamask/stellar-wallet-snap',
]);

/**
 * Identify wallet integrations that this EVM-only extension no longer supports.
 *
 * @param snapId - Canonical Snap identifier.
 * @returns Whether the Snap belongs to a retired wallet integration.
 */
export function isRetiredWalletSnap(snapId: string): boolean {
  return RETIRED_WALLET_SNAPS.has(snapId);
}
