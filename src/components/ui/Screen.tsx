import type { CSSProperties, PropsWithChildren } from 'react';
import { useTheme } from '../../theme';

type ScreenProps = PropsWithChildren<{
  style?: CSSProperties;
  padded?: boolean;
  as?: keyof JSX.IntrinsicElements;
}>;

export const Screen = ({ children, style, padded = true, as = 'main' }: ScreenProps) => {
  const theme = useTheme();
  const Tag = as;

  return (
    <Tag
      style={{
        minHeight: '100vh',
        background: theme.colors.background.base,
        color: theme.colors.text.primary,
        padding: padded ? theme.spacing.lg : 0,
        transition: 'background 0.2s ease, color 0.2s ease',
        ...style,
      }}
    >
      {children}
    </Tag>
  );
};
