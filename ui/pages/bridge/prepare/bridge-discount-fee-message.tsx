import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { Text, TextColor, TextVariant } from '@metamask/design-system-react';
import {
  getBridgeQuotes,
  BridgeAppState,
  getValidationErrors,
} from '../../../ducks/bridge/selectors';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { JustifyContent } from '../../../helpers/constants/design-system';
import { Row } from '../layout';
import { readMmFee } from '../utils/quote';

export const BridgeDiscountFeeMessage = () => {
  const t = useI18nContext();

  const { activeQuote } = useSelector(getBridgeQuotes);

  const { isQuoteExpired } = useSelector(
    (state: BridgeAppState) => getValidationErrors(state, Date.now()),
    shallowEqual,
  );

  if (!activeQuote) {
    return null;
  }

  if (isQuoteExpired) {
    return null;
  }

  const { isDiscounted, baseFeePercentage, quoteFeePercentage, discountType } =
    readMmFee(activeQuote);

  if (!isDiscounted) {
    return null;
  }

  return (
    <Row gap={1} justifyContent={JustifyContent.center}>
      <Text
        variant={TextVariant.BodyXs}
        color={TextColor.TextAlternative}
        style={{ textDecoration: 'line-through' }}
      >
        {t('percent', [baseFeePercentage])}
      </Text>
      <Text variant={TextVariant.BodyXs} color={TextColor.TextAlternative}>
        {t('mmFee', [quoteFeePercentage])}
      </Text>
    </Row>
  );
};
