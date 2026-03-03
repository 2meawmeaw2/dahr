import type { CSSProperties, PropsWithChildren } from 'react';
import { useTheme } from '../../theme';

type CardProps = PropsWithChildren<{
  style?: CSSProperties;
  interactive?: boolean;
}>;

export const Card = ({ children, style, interactive = false }: CardProps) => {
  const theme = useTheme();

  return (
    <section
      style={{
        background: theme.colors.surface.base,
        border: `1px solid ${theme.colors.border.subtle}`,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        boxShadow: interactive ? theme.shadows.md : theme.shadows.sm,
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        ...style,
      }}
      aria-live="polite"
    >
      {children}
    </section>
  );
};
