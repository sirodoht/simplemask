import { englishText } from '../constants/english-text';
import {
  CriticalErrorRepairAction,
  CriticalErrorType,
} from '../constants/critical-error';
import {
  INACCESSIBLE_DATABASE_ERROR,
  MISSING_VAULT_ERROR,
} from '../constants/errors';
import {
  REINSTALL_METAMASK_RECOVERY_LINK,
  SUPPORT_LINK,
  VAULT_RECOVERY_LINK,
} from './ui-utils';
import { getErrorHtml, getErrorHtmlBase } from './error-utils';

jest.mock('webextension-polyfill', () => {
  return {
    runtime: {
      reload: jest.fn(),
    },
  };
});

function getStateCorruptionResetSalvagePrefix(): string {
  const [prefix] =
    englishText.stateCorruptionCopyAndRestoreBeforeReset.split('$1');
  return prefix ?? '';
}

describe('Error utils Tests', function () {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();

    (global as Record<string, unknown>).platform = {
      openTab: jest.fn(),
    };
  });

  afterAll(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    delete (global as Record<string, unknown>).platform;
  });

  describe('getErrorHtmlBase', () => {
    it('wraps content in the critical-error container markup', () => {
      const html = getErrorHtmlBase('<p>test body</p>');
      expect(html).toContain('critical-error__container');
      expect(html).toContain('critical-error__inner');
      expect(html).toContain('critical-error');
      expect(html).toContain('<p>test body</p>');
    });
  });

  describe('getErrorHtml', () => {
    it('renders the troubleStarting error with support link and error details', async () => {
      const error = new Error('Test error');
      const html = getErrorHtml('troubleStarting', error, SUPPORT_LINK);

      expect(html).toContain(englishText.troubleStartingTitle);
      expect(html).toContain(englishText.troubleStartingMessage);
      expect(html).toContain('critical-error__body');
      expect(html).toContain('critical-error__footer-actions');
      expect(html).toContain('width="20"');
      expect(html).toContain('height="20"');
      expect(html).toContain(englishText.restartMetamask);
      expect(html).toContain('If none of the above works,');
      expect(html).toContain(englishText.errorPageContactSupport.toLowerCase());
      expect(html).toContain('Test error');
    });

    it('renders the somethingIsWrong error message when errorKey is "somethingIsWrong"', async () => {
      const html = getErrorHtml('somethingIsWrong', undefined);

      expect(html).toContain(englishText.somethingIsWrong);
    });

    it('omits the support link footer when supportLink is not provided', async () => {
      const html = getErrorHtml('troubleStarting', undefined);

      expect(html).not.toContain('class="critical-error__footer"');
      expect(html).not.toContain('If none of the above works,');
    });

    it('omits the error details section when error has no message', async () => {
      const html = getErrorHtml('troubleStarting', undefined);

      expect(html).not.toContain('critical-error__details');
    });

    it('includes the error details section when the error has a message', async () => {
      const error = new Error('Something broke');
      const html = getErrorHtml('troubleStarting', error);

      expect(html).toContain('critical-error__details');
      expect(html).toContain('Something broke');
    });

    it('includes repair button when repairAction is recover', async () => {
      const error = new Error('Test error');
      const html = getErrorHtml(
        'troubleStarting',
        error,
        SUPPORT_LINK,
        CriticalErrorRepairAction.Recover,
      );

      expect(html).toContain('critical-error-repair-button');
      expect(html).toContain(englishText.criticalErrorAttemptRecovery);
      expect(html).not.toContain(englishText.criticalErrorRecoverAccounts);
      expect(html).toContain('critical-error__button-secondary');

      const container = document.createElement('div');
      container.innerHTML = html;
      const repairButton = container.querySelector<HTMLButtonElement>(
        '#critical-error-repair-button',
      );
      expect(repairButton?.disabled).toBe(true);
      expect(repairButton?.classList).toContain(
        'critical-error__button-secondary',
      );
      expect(repairButton?.classList).not.toContain('btn-primary');
    });

    it('uses recover accounts button copy for state corruption recover action', async () => {
      const html = getErrorHtml(
        'troubleStarting',
        { message: MISSING_VAULT_ERROR },
        SUPPORT_LINK,
        CriticalErrorRepairAction.Recover,
        CriticalErrorType.MissingVaultInDatabase,
      );

      expect(html).toContain('critical-error-repair-button');
      expect(html).toContain(englishText.criticalErrorRecoverAccounts);
      expect(html).not.toContain(englishText.criticalErrorAttemptRecovery);
    });

    it('uses attempt recovery button copy for inaccessible database recover action', async () => {
      const html = getErrorHtml(
        'troubleStarting',
        { message: INACCESSIBLE_DATABASE_ERROR },
        SUPPORT_LINK,
        CriticalErrorRepairAction.Recover,
        CriticalErrorType.InaccessibleDatabase,
      );

      expect(html).toContain('critical-error-repair-button');
      expect(html).toContain(englishText.criticalErrorAttemptRecovery);
      expect(html).not.toContain(englishText.criticalErrorRecoverAccounts);
    });

    it('uses state corruption intro copy for state corruption errors', async () => {
      const html = getErrorHtml(
        'troubleStarting',
        undefined,
        SUPPORT_LINK,
        CriticalErrorRepairAction.Recover,
        CriticalErrorType.MissingVaultInDatabase,
      );

      expect(html).toContain(
        englishText.criticalErrorStateCorruptionRecoverMessage,
      );
      expect(html).not.toContain(
        englishText.criticalErrorStateCorruptionResetMessage,
      );
      expect(html).not.toContain(englishText.troubleStartingMessage);
      expect(html).toContain(getStateCorruptionResetSalvagePrefix());
      expect(html).toContain(VAULT_RECOVERY_LINK);
      expect(html).toContain(englishText.stateCorruptionTheseInstructions);
      expect(html).toContain(
        englishText.stateCorruptionTheseInstructionsLinkTitle,
      );
    });

    it('includes reset state button when repairAction is reset', async () => {
      const html = getErrorHtml(
        'troubleStarting',
        undefined,
        SUPPORT_LINK,
        CriticalErrorRepairAction.Reset,
        CriticalErrorType.MissingVaultInDatabase,
      );

      expect(html).toContain('critical-error-repair-button');
      expect(html).toContain(englishText.criticalErrorResetMetaMaskState);
      expect(html).toContain(
        englishText.criticalErrorStateCorruptionResetMessage,
      );
      expect(html).not.toContain(
        englishText.criticalErrorStateCorruptionRecoverMessage,
      );
      expect(html).not.toContain(englishText.criticalErrorAttemptRecovery);
      expect(html).toContain(VAULT_RECOVERY_LINK);
      expect(html).toContain(englishText.stateCorruptionTheseInstructions);
      expect(html).toContain(
        englishText.stateCorruptionTheseInstructionsLinkTitle,
      );
      expect(html).toContain(getStateCorruptionResetSalvagePrefix());

      const container = document.createElement('div');
      container.innerHTML = html;
      const repairButton = container.querySelector<HTMLButtonElement>(
        '#critical-error-repair-button',
      );
      expect(repairButton?.disabled).toBe(true);
      const salvageLink = container.querySelector<HTMLAnchorElement>(
        `a[href="${VAULT_RECOVERY_LINK}"]`,
      );
      expect(salvageLink?.textContent).toBe(
        englishText.stateCorruptionTheseInstructions,
      );
      expect(salvageLink?.title).toBe(
        englishText.stateCorruptionTheseInstructionsLinkTitle,
      );
    });

    it('omits the restart button and divider for state corruption errors', async () => {
      const html = getErrorHtml(
        'troubleStarting',
        undefined,
        SUPPORT_LINK,
        CriticalErrorRepairAction.Recover,
        CriticalErrorType.MissingVaultInDatabase,
      );

      const container = document.createElement('div');
      container.innerHTML = html;

      expect(container.querySelector('#critical-error-button')).toBeNull();
      expect(container.querySelector('.critical-error__divider')).toBeNull();
      expect(
        container.querySelector('#critical-error-checkbox'),
      ).not.toBeNull();
      expect(
        container.querySelector('#critical-error-repair-button')?.classList,
      ).toContain('btn-primary');
      expect(html).not.toContain(englishText.restartMetamask);
      expect(html).not.toContain(englishText.criticalErrorStillHavingIssues);
    });

    it('omits the report checkbox and legal text when reporting consent is known', async () => {
      const html = getErrorHtml(
        'troubleStarting',
        undefined,
        SUPPORT_LINK,
        CriticalErrorRepairAction.Recover,
        CriticalErrorType.MissingVaultInDatabase,
        false,
      );

      const container = document.createElement('div');
      container.innerHTML = html;

      expect(container.querySelector('#critical-error-checkbox')).toBeNull();
      expect(container.querySelector('#critical-error-tip-anchor')).toBeNull();
      expect(container.querySelector('#critical-error-legal-text')).toBeNull();
    });

    it('omits the repair button when repairAction is none', async () => {
      const html = getErrorHtml(
        'troubleStarting',
        undefined,
        SUPPORT_LINK,
        CriticalErrorRepairAction.None,
      );

      expect(html).not.toContain('critical-error-repair-button');
      expect(html).not.toContain(englishText.criticalErrorAttemptRecovery);
    });

    it('omits the state corruption intro copy when repairAction is none', async () => {
      const html = getErrorHtml(
        'troubleStarting',
        undefined,
        SUPPORT_LINK,
        CriticalErrorRepairAction.None,
        CriticalErrorType.MissingVaultInDatabase,
      );

      expect(html).not.toContain(
        englishText.criticalErrorStateCorruptionRecoverMessage,
      );
      expect(html).not.toContain(
        englishText.criticalErrorStateCorruptionResetMessage,
      );
      expect(html).not.toContain(getStateCorruptionResetSalvagePrefix());
      expect(html).not.toContain(englishText.troubleStartingMessage);
    });

    it('always renders the reinstall MetaMask button with the SRP recovery link', async () => {
      const html = getErrorHtml(
        'troubleStarting',
        undefined,
        SUPPORT_LINK,
        CriticalErrorRepairAction.None,
      );

      expect(html).toContain('critical-error-reinstall-link');
      expect(html).toContain(englishText.criticalErrorReinstallMetamask);
      expect(html).toContain(REINSTALL_METAMASK_RECOVERY_LINK);
      expect(html).toContain('target="_blank"');
      expect(html).toContain('rel="noopener noreferrer"');
      expect(html).toContain('critical-error__external-icon');
    });

    it('renders the "Still having issues?" divider above the secondary actions', async () => {
      const html = getErrorHtml(
        'troubleStarting',
        undefined,
        SUPPORT_LINK,
        CriticalErrorRepairAction.None,
      );

      expect(html).toContain('critical-error__divider');
      expect(html).toContain(englishText.criticalErrorStillHavingIssues);
    });
  });
});
