import type { Hex } from '@metamask/utils';
import { useTransactionMetadataRequestOptional } from './useTransactionMetadataRequest';
/** Returns the account that signs the current transaction. */
export function useTransactionPayingAccount(): Hex | undefined {
  return useTransactionMetadataRequestOptional()?.txParams?.from as
    | Hex
    | undefined;
}
