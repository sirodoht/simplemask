import { getText, getTextParts, englishText } from './text';

describe('English product text', () => {
  it('renders English without browser APIs or saved preferences', () => {
    expect(getText('cancel')).toBe('Cancel');
    expect(getText('activity')).toBe('Activity');
  });

  it('inserts values in numbered placeholders without interpreting their contents', () => {
    const value = '<script>alert(1)</script> $2';
    expect(getText('notificationTransactionSuccessMessage', [value])).toBe(
      englishText.notificationTransactionSuccessMessage.replace('$1', value),
    );
  });

  it('preserves objects as separate parts for safe React rendering', () => {
    const child = { element: 'example' };
    const parts = getTextParts('criticalErrorFooterContactSupport', [child]);
    expect(parts).toContain(child);
    expect(parts.filter((part) => typeof part === 'string').join('')).toBe(
      englishText.criticalErrorFooterContactSupport.replace('$1', ''),
    );
  });

  it('keeps placeholders when callers are preparing a template', () => {
    expect(getText('criticalErrorFooterContactSupport')).toBe(
      englishText.criticalErrorFooterContactSupport,
    );
  });
});
