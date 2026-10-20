import React, { useCallback } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@metamask/design-system-react';
import { getText } from '../../../helpers/utils/text';
import { useBlockExplorerUrl } from './shared';

type Props = {
  chainId: string | undefined;
  txHash: string | undefined;
};

export function BlockExplorerButton({ chainId, txHash }: Props) {
  const t = getText;
  const explorerTxUrl = useBlockExplorerUrl(chainId ?? '', txHash);

  const handleClick = useCallback(() => {
    if (explorerTxUrl) {
      global.platform.openTab({ url: explorerTxUrl });
    }
  }, [explorerTxUrl]);

  if (!explorerTxUrl) {
    return null;
  }

  return (
    <Button
      className="w-full"
      data-explorer-url={explorerTxUrl}
      data-testid="transaction-details-block-explorer"
      size={ButtonSize.Lg}
      variant={ButtonVariant.Secondary}
      onClick={handleClick}
    >
      {t('viewOnBlockExplorer')}
    </Button>
  );
}
