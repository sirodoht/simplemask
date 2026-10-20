import React from 'react';

import {
  Box,
  BoxBackgroundColor,
  TextColor,
} from '@metamask/design-system-react';
import Disclosure from '../../../../../components/ui/disclosure';
import { DisclosureVariant } from '../../../../../components/ui/disclosure/disclosure.constants';
import { getText } from '../../../../../helpers/utils/text';
import { DiffHighlightedAddress } from '../diff-highlighted-address/diff-highlighted-address';

type AddressPoisoningAlertContentProps = Readonly<{
  address: string;
  knownAddress: string;
  diffIndices: readonly number[];
}>;

export function AddressPoisoningAlertContent({
  address,
  knownAddress,
  diffIndices,
}: AddressPoisoningAlertContentProps) {
  const t = getText;

  return (
    <Disclosure title={t('compareAddresses')} variant={DisclosureVariant.Arrow}>
      <Box className="mt-2 space-y-2">
        <DiffHighlightedAddress
          address={address}
          diffIndices={diffIndices}
          label={t('enteredMalicious')}
          dotBackgroundColor={BoxBackgroundColor.ErrorDefault}
        />
        <DiffHighlightedAddress
          address={knownAddress}
          diffIndices={diffIndices}
          label={t('knownSafeAddress')}
          dotBackgroundColor={BoxBackgroundColor.SuccessDefault}
          highlightBackgroundColor={BoxBackgroundColor.SuccessMuted}
          diffTextColor={TextColor.SuccessDefault}
        />
      </Box>
    </Disclosure>
  );
}
