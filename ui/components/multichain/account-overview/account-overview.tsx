import React from 'react';
import { useSelector } from 'react-redux';
import { EthAccountType } from '@metamask/keyring-api';
import { getSelectedInternalAccount } from '../../../../shared/lib/selectors/accounts';
import { AccountOverviewEth } from './account-overview-eth';
import { AccountOverviewUnknown } from './account-overview-unknown';
import { AccountOverviewCommonProps } from './common';

export type AccountOverviewProps = AccountOverviewCommonProps & {
  useExternalServices: boolean;
};

export function AccountOverview(props: AccountOverviewProps) {
  const account = useSelector(getSelectedInternalAccount);

  const renderAccountOverviewOption = () => {
    switch (account.type) {
      case EthAccountType.Eoa:
      case EthAccountType.Erc4337:
        return <AccountOverviewEth {...props}></AccountOverviewEth>;
      default:
        return <AccountOverviewUnknown {...props}></AccountOverviewUnknown>;
    }
  };

  return <>{renderAccountOverviewOption()}</>;
}
