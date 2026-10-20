import React from 'react';
import { Content, Page } from '../../../components/multichain/pages/page';
import HardwareWalletSignatures from './hardware-wallet-signatures';

/**
 * Route entry for the hardware-wallet signing screen.
 *
 * Registered from the router registry (`ui/pages/routes/`) under the
 * standalone hardware-signing path.
 *
 * @returns Page shell wrapping {@link HardwareWalletSignatures}.
 */
export default function HardwareWalletSignaturesPage() {
  return (
    <Page
      className="hardware-wallet-signatures-page"
      data-testid="parent-selector-hardware-wallet-signatures-page"
    >
      <Content padding={0}>
        <HardwareWalletSignatures />
      </Content>
    </Page>
  );
}
