import { useMemo } from 'react';
import {
  isValidSIWEOrigin,
  WrappedSIWERequest,
} from '@metamask/controller-utils';

import { Alert } from '../../../../../ducks/confirm-alerts/confirm-alerts';
import { RowAlertKey } from '../../../../../components/app/confirm/info/row/constants';
import { Severity } from '../../../../../helpers/constants/design-system';
import { getText } from '../../../../../helpers/utils/text';

import { SignatureRequestType } from '../../../types/confirm';
import { isSIWESignatureRequest } from '../../../utils';
import { useConfirmContext } from '../../../context/confirm';

export default function useDomainMismatchAlerts(): Alert[] {
  const t = getText;
  const { currentConfirmation } = useConfirmContext<SignatureRequestType>();

  const { msgParams } = currentConfirmation || {};
  const isSIWE = isSIWESignatureRequest(currentConfirmation);
  const isInvalidSIWEDomain =
    isSIWE && !isValidSIWEOrigin(msgParams as WrappedSIWERequest);

  const alerts = useMemo(() => {
    if (!isInvalidSIWEDomain) {
      return [];
    }

    return [
      {
        field: RowAlertKey.RequestFrom,
        key: 'requestFrom',
        message: t('alertMessageSignInDomainMismatch'),
        reason: t('alertReasonSignIn'),
        severity: Severity.Danger,
      },
    ] as Alert[];
  }, [isInvalidSIWEDomain, t]);

  return alerts;
}
