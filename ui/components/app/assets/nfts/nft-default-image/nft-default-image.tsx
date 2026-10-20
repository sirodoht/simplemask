import React from 'react';
import classnames from 'clsx';
import {
  Box,
  BoxAlignItems,
  BoxFlexDirection,
  BoxJustifyContent,
} from '@metamask/design-system-react';

type NftDefaultImageProps = {
  className: string;
};

export default function NftDefaultImage({ className }: NftDefaultImageProps) {
  return (
    <Box
      tabIndex={0}
      data-testid="nft-default-image"
      className={classnames('flex', className, 'nft-default', 'rounded-lg', {})}
      flexDirection={BoxFlexDirection.Row}
      alignItems={BoxAlignItems.Center}
      justifyContent={BoxJustifyContent.Center}
    ></Box>
  );
}
