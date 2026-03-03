import type { CSSProperties } from 'react';
import { useTheme } from '../../theme';

type StatTileProps = {
  label: string;
  value: string | number;
  trend?: string;
  style?: CSSProperties;
};

export const StatTile = ({ label, value, trend, style }: StatTileProps) => {
  const theme = useTheme();

  return (
    <article
      style={{
        background: theme.colors.surface.raised,
        border: `1px solid ${theme.colors.border.subtle}`,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.md,
        boxShadow: theme.shadows.sm,
        display: 'grid',
        gap: theme.spacing.xs,
        ...style,
      }}
    >
      <span style={{ color: theme.colors.text.tertiary, fontSize: 13 }}>{label}</span>
      <strong style={{ color: theme.colors.text.primary, fontSize: 24, lineHeight: 1.2 }}>{value}</strong>
      {trend ? <span style={{ color: theme.colors.accent.primary, fontWeight: 600, fontSize: 13 }}>{trend}</span> : null}
    </article>
  );
};
