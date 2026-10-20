import React from 'react';

import PropTypes from 'prop-types';
import { Button, ButtonVariant } from '@metamask/design-system-react';
import { getText } from '../../../helpers/utils/text';

export default function CancelButton({ cancelTransaction, ...props }) {
  const t = getText;

  return (
    <Button
      onClick={cancelTransaction}
      variant={ButtonVariant.Secondary}
      data-testid="cancel-button"
      {...props}
    >
      {t('cancel')}
    </Button>
  );
}

CancelButton.propTypes = {
  cancelTransaction: PropTypes.func,
};
