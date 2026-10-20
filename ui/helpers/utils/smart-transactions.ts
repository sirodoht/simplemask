export const parseSmartTransactionsError = (errorMessage: string): string => {
  const errorJson = errorMessage.slice(12);
  return JSON.parse(errorJson.trim());
};
