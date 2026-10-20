import { ApprovalRequest } from '@metamask/approval-controller';
import { ApprovalType } from '@metamask/controller-utils';
import { Json } from '@metamask/utils';

import { createSelector } from 'reselect';
import { getPendingApprovals } from '../../../selectors/approvals';

const ConfirmationApprovalTypes = [
  ApprovalType.PersonalSign,
  ApprovalType.EthSignTypedData,
  ApprovalType.Transaction,
];
export const pendingConfirmationsSortedSelector = createSelector(
  getPendingApprovals,
  (approvals) =>
    approvals
      .filter(({ type }) =>
        ConfirmationApprovalTypes.includes(type as ApprovalType),
      )
      .sort((a1, a2) => a1.time - a2.time),
);

export const firstPendingConfirmationSelector = createSelector(
  pendingConfirmationsSortedSelector,
  (pendingConfirmations): ApprovalRequest<Record<string, Json>> | undefined =>
    pendingConfirmations[0],
);
