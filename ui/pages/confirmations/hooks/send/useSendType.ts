import { isAddress as isEvmAddress } from 'ethers/lib/utils';
import { useMemo } from 'react';
import { useSendContext } from '../../context/send';

export const useSendType = () => {
  const { asset } = useSendContext();
  const address = asset?.address ?? asset?.assetId;
  const chainId = asset?.chainId?.toString();
  const isEvmSendType = Boolean(
    address &&
    isEvmAddress(address) &&
    chainId &&
    /^(?:0x[0-9a-f]+|[0-9]+|eip155:[0-9]+)$/iu.test(chainId),
  );
  return useMemo(
    () => ({
      isEvmSendType,
      isEvmNativeSendType: isEvmSendType && asset?.isNative === true,
      isBitcoinSendType: false,
      isSolanaSendType: false,
      isTronSendType: false,
      isStellarSendType: false,
      isNonEvmSendType: false,
      isNonEvmNativeSendType: false,
    }),
    [isEvmSendType, asset?.isNative],
  );
};
