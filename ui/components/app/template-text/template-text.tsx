import React, { useContext } from 'react';
import { getText } from '../../../helpers/utils/text';
import { TemplateRendererContext } from '../metamask-template-renderer/context';

/**
 * Render English template text with restricted React children in placeholders.
 * Child templates retain a maximum depth of two and at most two leaves.
 *
 * @param options
 * @param options.textKey
 * @param options.variables
 */
type TextVariable =
  | string
  | number
  | {
      element: string;
      key?: string;
      children?: { children?: unknown }[];
    };

export default function TemplateText({
  textKey,
  variables,
}: {
  textKey: string;
  variables?: TextVariable[];
}) {
  const t = getText;
  const MetaMaskTemplateRenderer = useContext(TemplateRendererContext);
  if (!MetaMaskTemplateRenderer) {
    throw new Error(
      'TemplateText must be rendered inside a MetaMaskTemplateRenderer subtree',
    );
  }

  return t(
    textKey,
    variables?.map((variable) => {
      if (
        typeof variable === 'object' &&
        !Array.isArray(variable) &&
        variable.element
      ) {
        if (!variable.key) {
          throw new Error(
            `When using MetaMask Template Language in a TemplateText variable, you must provide a key for the section regardless of syntax.
            Section with element '${variable.element}' for textKey: '${textKey}' has no key property`,
          );
        }
        if (
          variable.children &&
          Array.isArray(variable.children) &&
          variable.children.length > 2
        ) {
          throw new Error(
            'TemplateText only renders templates with a single section and maximum two children',
          );
        } else if (
          (variable.children?.[0]?.children !== undefined &&
            typeof variable.children[0].children !== 'string') ||
          (variable.children?.[1]?.children !== undefined &&
            typeof variable.children[1].children !== 'string')
        ) {
          throw new Error(
            'TemplateText does not allow for component trees of non trivial depth',
          );
        }
        return (
          <MetaMaskTemplateRenderer
            key={`${textKey}-${variable.key}`}
            sections={variable}
          />
        );
      }
      return variable;
    }),
  );
}
