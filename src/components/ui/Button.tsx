import type { ButtonHTMLAttributes, CSSProperties, PropsWithChildren } from 'react';
import { useTheme } from '../../theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    style?: CSSProperties;
  }
>;

export const Button = ({ children, variant = 'primary', style, disabled, ...rest }: ButtonProps) => {
  const theme = useTheme();

  const variantStyles: Record<ButtonVariant, CSSProperties> = {
    primary: {
      background: theme.colors.accent.primary,
      color: theme.colors.accent.onAccent,
      border: `1px solid ${theme.colors.accent.primary}`,
      boxShadow: theme.shadows.glow,
    },
    secondary: {
      background: theme.colors.surface.interactive,
      color: theme.colors.text.primary,
      border: `1px solid ${theme.colors.border.default}`,
    },
    ghost: {
      background: 'transparent',
      color: theme.colors.text.secondary,
      border: `1px solid ${theme.colors.border.subtle}`,
    },
  };

  return (
    <button
      type="button"
      disabled={disabled}
      style={{
        height: 42,
        padding: `0 ${theme.spacing.md}px`,
        borderRadius: theme.radius.md,
        fontWeight: 600,
        fontSize: 14,
        lineHeight: '20px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        transition: 'transform 0.12s ease, filter 0.12s ease, background 0.15s ease',
        ...variantStyles[variant],
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
};
