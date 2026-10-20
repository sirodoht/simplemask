import React from 'react';

import type { ActivityListItem } from '../../../../shared/lib/activity/types';
import { getText } from '../../../helpers/utils/text';
import { FeesRows, TotalAmountRow } from '../components/amounts-section';
import { Footer, Section } from '../components/shared';
import { BlockExplorerButton } from '../components/block-explorer-button';
import { MetadataSection, TokensSection } from '../components/sections';

export function SwapDetails({
  item,
}: {
  item: Extract<
    ActivityListItem,
    {
      type:
        | 'swap'
        | 'bridge'
        | 'convert'
        | 'lendingDeposit'
        | 'lendingWithdrawal'
        | 'wrap'
        | 'unwrap';
    }
  >;
}) {
  const t = getText;

  return (
    <div className="flex grow flex-col">
      <div className="divide-y divide-border-muted">
        <TokensSection
          tokens={[
            { label: t('youSent'), token: item.data.sourceToken },
            { label: t('youReceived'), token: item.data.destinationToken },
          ]}
        />
        <MetadataSection item={item} />
        <Section>
          <FeesRows item={item} />
          <TotalAmountRow token={item.data.sourceToken} />
        </Section>
      </div>
      <Footer>
        <BlockExplorerButton chainId={item.chainId} txHash={item.hash} />
      </Footer>
    </div>
  );
}
