import type { CSSProperties, PropsWithChildren } from 'react';
import { useTheme } from '../../theme';

type BadgeTone = 'neutral' | 'success' | 'warning' | 'error' | 'accent';

type BadgeProps = PropsWithChildren<{
  tone?: BadgeTone;
  style?: CSSProperties;
}>;

export const Badge = ({ children, tone = 'neutral', style }: BadgeProps) => {
  const theme = useTheme();

  const toneStyle: Record<BadgeTone, CSSProperties> = {
    neutral: {
      background: theme.colors.surface.interactive,
      color: theme.colors.text.secondary,
      border: `1px solid ${theme.colors.border.subtle}`,
    },
    success: {
      background: theme.colors.state.successBg,
      color: theme.colors.state.success,
      border: `1px solid ${theme.colors.state.success}`,
    },
    warning: {
      background: theme.colors.state.warningBg,
      color: theme.colors.state.warning,
      border: `1px solid ${theme.colors.state.warning}`,
    },
    error: {
      background: theme.colors.state.errorBg,
      color: theme.colors.state.error,
      border: `1px solid ${theme.colors.state.error}`,
    },
    accent: {
      background: theme.colors.accent.subtle,
      color: theme.colors.accent.primary,
      border: `1px solid ${theme.colors.accent.primary}`,
    },
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        minHeight: 24,
        borderRadius: theme.radius.pill,
        padding: `0 ${theme.spacing.sm}px`,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: 0.2,
        ...toneStyle[tone],
        ...style,
      }}
    >
      {children}
    </span>
  );
};
