import React from 'react';

import PropTypes from 'prop-types';
import { BannerAlert, IconName, Text } from '../../../component-library';
import { TextColor } from '../../../../helpers/constants/design-system';
import { getText } from '../../../../helpers/utils/text';

const SnapUpdateAlert = ({ snapName, onUpdateClick, bannerAlertProps }) => {
  const t = getText;
  return (
    <BannerAlert
      title={t('snapUpdateAvailable')}
      actionButtonLabel={t('update')}
      actionButtonOnClick={onUpdateClick}
      actionButtonProps={{
        endIconName: IconName.Download,
        color: TextColor.primaryDefault,
      }}
      {...bannerAlertProps}
    >
      <Text>{t('snapUpdateAlertDescription', [snapName])}</Text>
    </BannerAlert>
  );
};

SnapUpdateAlert.propTypes = {
  /**
   * snapName Name of a Snap.
   */
  snapName: PropTypes.string.isRequired,
  /**
   * onUpdateClick Update handler callback.
   */
  onUpdateClick: PropTypes.func.isRequired,
  /**
   * bannerAlertProps additional properties for BannerAlert.
   */
  bannerAlertProps: PropTypes.object,
};

export default SnapUpdateAlert;
