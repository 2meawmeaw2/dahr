import { useMemo } from 'react';
import { useTheme } from '../../theme';

type ProgressRingProps = {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
};

export const ProgressRing = ({ value, size = 80, strokeWidth = 8, label }: ProgressRingProps) => {
  const theme = useTheme();

  const safeValue = Math.min(100, Math.max(0, value));
  const radius = useMemo(() => (size - strokeWidth) / 2, [size, strokeWidth]);
  const circumference = useMemo(() => 2 * Math.PI * radius, [radius]);
  const offset = useMemo(() => circumference - (safeValue / 100) * circumference, [circumference, safeValue]);

  return (
    <figure style={{ margin: 0, display: 'grid', placeItems: 'center', gap: 8 }} aria-label={label ?? `Progress ${safeValue}%`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.colors.surface.interactive}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.colors.accent.primary}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ filter: `drop-shadow(0 0 6px ${theme.colors.accent.glow})`, transition: 'stroke-dashoffset 0.3s ease' }}
        />
      </svg>
      <figcaption style={{ color: theme.colors.text.secondary, fontSize: 13, fontWeight: 600 }}>{safeValue}%</figcaption>
    </figure>
  );
};
