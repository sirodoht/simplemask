import { AvatarAccountVariant } from '@metamask/design-system-react';

// Avatar variants with their corresponding text keys.
export const AVATAR_OPTIONS: {
  value: AvatarAccountVariant;
  labelKey: string;
}[] = [
  { value: AvatarAccountVariant.Maskicon, labelKey: 'maskicons' },
  { value: AvatarAccountVariant.Jazzicon, labelKey: 'jazzicons' },
  { value: AvatarAccountVariant.Blockies, labelKey: 'blockies' },
];

// Map of avatar variants to their text keys.
export const AVATAR_LABEL_MAP: Record<AvatarAccountVariant, string> =
  Object.fromEntries(
    AVATAR_OPTIONS.map(({ value, labelKey }) => [value, labelKey]),
  ) as Record<AvatarAccountVariant, string>;
