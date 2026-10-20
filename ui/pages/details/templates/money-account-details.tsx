import React from 'react';

import {
  applyDisplaySign,
  getDisplaySignPrefix,
} from '../../../../shared/lib/activity/fiat';
import type { MoneyAccountActivityItem } from '../../../../shared/lib/activity/types';
import { MONEY_ACCOUNT_FIAT_CURRENCY } from '../../../../shared/lib/money/constants';
import { useLocalTransactionMeta } from '../../../hooks/activity/useLocalTransactionMeta';
import { useFormatters } from '../../../hooks/useFormatters';
import { getText } from '../../../helpers/utils/text';
import { BlockExplorerButton } from '../components/block-explorer-button';
import { MmPayDetailsLayout } from './mm-pay-details-layout';

type Props = {
  item: MoneyAccountActivityItem;
};

const MoneyAccountDetailsContent = ({ item }: Readonly<Props>) => {
  const t = getText;
  const { formatCurrencyWithMinThreshold } = useFormatters();
  const transactionMeta = useLocalTransactionMeta(item.hash);
  const { metamaskPay } = transactionMeta ?? {};
  const { bridgeFeeFiat, networkFeeFiat, totalFiat } = metamaskPay || {};

  const isDeposit = item.type === 'moneyAccountDeposit';

  const formatFiat = (value?: string) =>
    value
      ? formatCurrencyWithMinThreshold(
          Number(value),
          MONEY_ACCOUNT_FIAT_CURRENCY,
        )
      : null;

  const isIncoming = item.data.token?.direction === 'in';
  const formattedAmount = formatFiat(item.data.fiat?.amount);
  const signedAmount =
    formattedAmount && item.data.token
      ? applyDisplaySign(
          formattedAmount,
          getDisplaySignPrefix(item.data.token.direction, { showPlus: true }),
        )
      : formattedAmount;

  return (
    <MmPayDetailsLayout
      avatarTokens={[item.data.token?.assetId]}
      footer={<BlockExplorerButton chainId={item.chainId} txHash={item.hash} />}
      formatFiat={formatFiat}
      heroAmount={signedAmount}
      heroTextColor={isIncoming ? 'text-success-default' : 'text-default'}
      item={item}
      metamaskPay={{ bridgeFeeFiat, networkFeeFiat, totalFiat }}
      transactionMeta={transactionMeta}
    />
  );
};
export function MoneyAccountDetails(props: Readonly<Props>) {
  return <MoneyAccountDetailsContent {...props} />;
}
