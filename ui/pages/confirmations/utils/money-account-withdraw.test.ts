import { TransactionType } from '@metamask/transaction-controller';
import { getMoneyAccountWithdrawTransferDetails } from './money-account-withdraw';

const recipient = '0x2222222222222222222222222222222222222222';
const transferData = `0xa9059cbb${recipient.slice(2).padStart(64, '0')}${(50000).toString(16).padStart(64, '0')}`;

describe('getMoneyAccountWithdrawTransferDetails', () => {
  it('decodes a saved withdrawal without a product controller', () => {
    expect(
      getMoneyAccountWithdrawTransferDetails({
        nestedTransactions: [
          { type: TransactionType.tokenMethodTransfer, data: transferData },
        ],
      }),
    ).toStrictEqual({ recipient, amountRaw: '50000' });
  });

  it('does not interpret unrelated calls as transfers', () => {
    expect(
      getMoneyAccountWithdrawTransferDetails({
        nestedTransactions: [
          { type: TransactionType.tokenMethodApprove, data: transferData },
        ],
      }),
    ).toStrictEqual({});
  });

  it('handles transactions without nested transfers', () => {
    expect(getMoneyAccountWithdrawTransferDetails(undefined)).toStrictEqual({});
    expect(
      getMoneyAccountWithdrawTransferDetails({ nestedTransactions: [] }),
    ).toStrictEqual({});
  });
});
