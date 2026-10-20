import { getText } from '../../../../helpers/utils/text';
import { QrErrorType, QrErrorFlowContext } from './qr-error-content.types';

/**
 * Translate function returned by `getText`.
 */
type TranslateFn = typeof getText;

/**
 * Resolves the English title and body for the given error and flow combination.
 *
 * `UrDecodeError` ignores `flowContext` because its copy is universal.
 *
 * @param errorType - Which scan error occurred.
 * @param flowContext - Pairing or signing flow.
 * @param t - i18n translate function.
 * @returns Localized `title` and `body`.
 */
export function resolveErrorCopy(
  errorType: QrErrorType,
  flowContext: QrErrorFlowContext,
  t: TranslateFn,
): { title: string; body: string } {
  const isPairing = flowContext === QrErrorFlowContext.Pairing;

  switch (errorType) {
    case QrErrorType.NonUrQrCode:
      return {
        title: isPairing
          ? t('qrErrorNonUrPairingTitle')
          : t('qrErrorNonUrSigningTitle'),
        body: isPairing
          ? t('qrErrorNonUrPairingBody')
          : t('qrErrorNonUrSigningBody'),
      };
    case QrErrorType.WrongUrType:
      return {
        title: isPairing
          ? t('qrErrorWrongUrTypePairingTitle')
          : t('qrErrorWrongUrTypeSigningTitle'),
        body: isPairing
          ? t('qrErrorWrongUrTypePairingBody')
          : t('qrErrorWrongUrTypeSigningBody'),
      };
    case QrErrorType.MismatchedTransaction:
      return {
        title: t('qrErrorMismatchedTransactionTitle'),
        body: t('qrErrorMismatchedTransactionBody'),
      };
    case QrErrorType.UrDecodeError:
    default:
      return {
        title: t('qrErrorUrDecodeTitle'),
        body: t('qrErrorUrDecodeBody'),
      };
  }
}

/**
 * Returns the `data-testid` for the root wrapper.
 *
 * @param errorType - Which scan error occurred.
 * @param flowContext - Pairing vs signing flow.
 * @returns A stable test-id string.
 */
export function rootTestId(
  errorType: QrErrorType,
  flowContext: QrErrorFlowContext,
): string {
  return `qr-error-${errorType}-${flowContext}`;
}
