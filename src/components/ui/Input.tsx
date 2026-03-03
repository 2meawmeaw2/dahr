import type { CSSProperties, InputHTMLAttributes } from 'react';
import { useTheme } from '../../theme';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  style?: CSSProperties;
  invalid?: boolean;
};

export const Input = ({ style, invalid = false, ...rest }: InputProps) => {
  const theme = useTheme();

  return (
    <input
      {...rest}
      style={{
        width: '100%',
        height: 42,
        borderRadius: theme.radius.md,
        border: `1px solid ${invalid ? theme.colors.state.error : theme.colors.border.default}`,
        background: theme.colors.surface.sunken,
        color: theme.colors.text.primary,
        padding: `0 ${theme.spacing.sm}px`,
        outlineColor: theme.colors.border.focus,
        boxSizing: 'border-box',
        ...style,
      }}
      aria-invalid={invalid}
    />
  );
};
