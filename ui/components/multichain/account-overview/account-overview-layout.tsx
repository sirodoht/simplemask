import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { TraceName, TraceOperation } from '#shared/lib/trace';
import { TraceCoordinator } from '#ui/hooks/useTraceCoordinator';
import { getSelectedAccountGroupNetworkGenerationKey } from '#ui/selectors/assets';
import { NetworkConnectionBanner } from '../../app/network-connection-banner';
import {
  AccountOverviewTabsProps,
  AccountOverviewTabs,
} from './account-overview-tabs';

const homepageRequiredSignals = ['balance', 'tokens'];

export type AccountOverviewLayoutProps = AccountOverviewTabsProps & {
  children: React.ReactElement;
  'data-testid'?: string;
};

export const AccountOverviewLayout = ({
  children,
  'data-testid': dataTestId,
  ...tabsProps
}: AccountOverviewLayoutProps) => {
  const homepageTraceId = useSelector(
    getSelectedAccountGroupNetworkGenerationKey,
  );
  const heroRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      node.setAttribute('elementtiming', 'hero');
      requestAnimationFrame(() => {
        performance.mark('mm-hero-painted');
      });
    }
  }, []);

  return (
    <TraceCoordinator
      name={TraceName.HomepageReady}
      op={TraceOperation.HomepagePerformance}
      parentId={tabsProps.showTokens === false ? undefined : homepageTraceId}
      requiredSignals={homepageRequiredSignals}
    >
      <div
        ref={heroRef}
        className="account-overview__balance-wrapper flex flex-col p-4 pb-2 gap-4"
        data-testid={dataTestId}
      >
        <NetworkConnectionBanner />

        {children}
      </div>

      <AccountOverviewTabs {...tabsProps} />
    </TraceCoordinator>
  );
};
