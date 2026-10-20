# Getting Started with Tailwind CSS in MetaMask Extension

This guide will help you get started with Tailwind CSS in the MetaMask extension project. Tailwind CSS is a utility-first CSS framework that allows you to rapidly build modern interfaces by composing classes directly in your HTML/JSX.

## Understanding Tailwind in MetaMask

### Current Implementation

The MetaMask extension has Tailwind CSS installed alongside the MetaMask Design System React components. The design system components work seamlessly with Tailwind classes:

```tsx
import { Box, Text } from '@metamask/design-system-react';

<Box className="relative">
  <Text className="absolute top-4 left-0">Hello World</Text>
</Box>;
```

### Migration Strategy: SASS → Tailwind CSS

We are currently in a transitional period migrating from SASS to Tailwind CSS throughout the MetaMask extension codebase.

Tailwind CSS classes have **the lowest CSS specificity** compared to our existing SASS classes. This means any custom sass classname will override tailwind css classnames

**Best Practice**: Work from **atomic components outward** to avoid specificity conflicts:

1. **Start with new components** using Tailwind + `@metamask/design-system-react`
2. **Refactor leaf components first** (buttons, text, icons)
3. **Move up to container components** once children are migrated
4. **Avoid mixing SASS and Tailwind** in the same component when possible

## ESLint Configuration

### Directory-Based Linting

Because we have **legacy SASS classes** throughout the codebase, Tailwind CSS linting is **opt-in by directory** to prevent conflicts with the `no-custom-classname` rule.

```javascript
// .eslintrc.js - Strict Tailwind enforcement areas
{
  files: [
    'ui/pages/design-system/**/*.{ts,tsx}', // ✅ Fully migrated
    // Add your workspace when ready for strict Tailwind:
    // 'ui/pages/your-new-page/**/*.{ts,tsx}',
    // 'ui/components/your-component/**/*.{ts,tsx}',
  ],
  plugins: ['tailwindcss'],
  rules: {
    'tailwindcss/no-custom-classname': 'error', // 🚫 No SASS classes allowed
  },
}

```

### Enabling Strict Tailwind for Your Directory

When you're ready to use **strict Tailwind** in your workspace:

1. **Ensure your component uses only**:
   - `@metamask/design-system-react` components
   - Tailwind utility classes
   - No custom SASS classes

2. **Add your directory to the strict enforcement list**:

```javascript
// .eslintrc.js
{
  files: [
    'ui/pages/design-system/**/*.{ts,tsx}',
    'ui/pages/bridge/**/*.{ts,tsx}', // ✅ Add your directory
    'ui/components/your-component/**/*.{ts,tsx}', // ✅ Or component
  ],
  // ... strict Tailwind rules
}
```

## Best Practices

Read the MetaMask Contributor Docs [Tailwind CSS Guidelines](https://github.com/MetaMask/contributor-docs/blob/main/docs/tailwind-css.md) to ensure you're using Tailwind CSS effectively and consistently across the mobile codebase. You can also look for examples of design system component and tailwind classname usage in [design-system.stories.tsx](../app/component-library/components/design-system.stories.tsx)

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [MetaMask Design System](https://github.com/MetaMask/metamask-design-system)
- [Design System Storybook](https://metamask.github.io/metamask-design-system)

### Getting Help
