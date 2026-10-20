import React from 'react';
import { render, screen } from '@testing-library/react';
import { getText } from './text';

describe('English UI text', () => {
  it('renders copy without a context provider', () => {
    render(<button>{getText('cancel')}</button>);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('preserves links inserted into copy', () => {
    render(
      <div>
        {getText('criticalErrorFooterContactSupport', [
          <a key="help" href="https://example.com">
            contact support
          </a>,
        ])}
      </div>,
    );
    expect(
      screen.getByRole('link', { name: 'contact support' }),
    ).toHaveAttribute('href', 'https://example.com');
  });

  it('renders inserted HTML as text', () => {
    const { container } = render(
      <div>
        {getText('criticalErrorFooterContactSupport', [
          '<img src=x onerror=alert(1)>',
        ])}
      </div>,
    );
    expect(container.querySelector('img')).toBeNull();
    expect(container).toHaveTextContent('<img src=x onerror=alert(1)>');
  });
});
