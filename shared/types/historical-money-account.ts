/**
 * Account ownership needed to display saved product transactions.
 * This record cannot create accounts, request quotes, or start services.
 */
export type HistoricalMoneyAccount = {
  address: string;
  options: { entropy: { id: string } };
};
