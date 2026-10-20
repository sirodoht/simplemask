import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { EthMethod } from '@metamask/keyring-api';
import { getCurrentChainId } from '../../../../shared/lib/selectors/networks';
import {
  isBalanceCached,
  getSelectedAccountCachedBalance,
} from '../../../selectors';
import { getSelectedInternalAccount } from '../../../../shared/lib/selectors/accounts';
import { CoinOverview } from './coin-overview';

const EthOverview = ({ className }) => {
  const balanceIsCached = useSelector(isBalanceCached);
  const chainId = useSelector(getCurrentChainId);
  const balance = useSelector(getSelectedAccountCachedBalance);

  const account = useSelector(getSelectedInternalAccount);
  const isSigningEnabled =
    account.methods.includes(EthMethod.SignTransaction) ||
    account.methods.includes(EthMethod.SignUserOperation);

  return (
    <CoinOverview
      account={account}
      balance={balance}
      balanceIsCached={balanceIsCached}
      className={className}
      classPrefix="eth"
      chainId={chainId}
      isSigningEnabled={isSigningEnabled}
    />
  );
};

EthOverview.propTypes = {
  className: PropTypes.string,
};

export default EthOverview;
