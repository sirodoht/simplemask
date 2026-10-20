import React from 'react';
import {
  IconName,
  IconSize,
  Modal,
  ModalOverlay,
  ModalHeader,
  ModalContent,
} from '@metamask/design-system-react';
import { Text } from '../../component-library';
import {
  TextVariant,
  TextAlign,
} from '../../../helpers/constants/design-system';
import { getText } from '../../../helpers/utils/text';
import FundingMethodItem from './funding-method-item';

type FundingMethodModalProps = Omit<
  React.ComponentPropsWithoutRef<typeof Modal>,
  'children'
> & {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onClickReceive: () => void;
};

export const FundingMethodModal = ({
  isOpen,
  onClose,
  title,
  onClickReceive,
  ...props
}: FundingMethodModalProps) => {
  const t = getText;

  return (
    <Modal isOpen={isOpen} onClose={onClose} {...props}>
      <ModalOverlay />
      <ModalContent modalDialogProps={{ padding: 0 }}>
        <ModalHeader
          className="pb-2"
          onClose={onClose}
          closeButtonProps={{ ariaLabel: t('close') }}
        >
          <Text variant={TextVariant.headingSm} textAlign={TextAlign.Center}>
            {title}
          </Text>
        </ModalHeader>

        <FundingMethodItem
          icon={IconName.Received}
          iconSize={IconSize.Lg}
          title={t('receiveCrypto')}
          description={t('depositCrypto')}
          onClick={onClickReceive}
        />
      </ModalContent>
    </Modal>
  );
};
