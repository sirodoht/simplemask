import React from 'react';

import { Link } from 'react-router-dom';
import { DEFAULT_ROUTE } from '../../../helpers/constants/routes';
import { getText } from '../../../helpers/utils/text';
import { useTheme } from '../../../hooks/useTheme';
import Logo from '../../ui/metafox-logo';

export const MultichainMetaFoxLogo = () => {
  const theme = useTheme();
  const t = getText;

  return (
    <Link to={DEFAULT_ROUTE} className="py-4" aria-label={t('home')}>
      <Logo unsetIconHeight theme={theme} />
    </Link>
  );
};
