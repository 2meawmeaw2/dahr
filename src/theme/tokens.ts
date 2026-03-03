export type ThemeMode = 'dark' | 'light';

export type ThemeTokens = {
  mode: ThemeMode;
  colors: {
    background: {
      base: string;
      muted: string;
      elevated: string;
      overlay: string;
    };
    surface: {
      base: string;
      raised: string;
      sunken: string;
      interactive: string;
    };
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
      inverse: string;
      disabled: string;
    };
    border: {
      subtle: string;
      default: string;
      strong: string;
      focus: string;
    };
    state: {
      success: string;
      warning: string;
      error: string;
      successBg: string;
      warningBg: string;
      errorBg: string;
    };
    accent: {
      primary: string;
      pressed: string;
      subtle: string;
      glow: string;
      onAccent: string;
    };
  };
  spacing: {
    xxs: number;
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    pill: number;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    glow: string;
  };
};

const sharedScale = {
  spacing: {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 18,
    pill: 999,
  },
};

export const darkTheme: ThemeTokens = {
  mode: 'dark',
  colors: {
    background: {
      base: '#0B1020',
      muted: '#121A2F',
      elevated: '#161F36',
      overlay: 'rgba(8, 12, 24, 0.82)',
    },
    surface: {
      base: '#131D34',
      raised: '#192645',
      sunken: '#0F1629',
      interactive: '#223256',
    },
    text: {
      primary: '#F4F7FF',
      secondary: '#C2CEEB',
      tertiary: '#95A5CB',
      inverse: '#0B1020',
      disabled: '#6D7FA8',
    },
    border: {
      subtle: '#28385F',
      default: '#364978',
      strong: '#4B619A',
      focus: '#41A1FF',
    },
    state: {
      success: '#3ED187',
      warning: '#F0BE4A',
      error: '#FF6B7E',
      successBg: '#102A20',
      warningBg: '#2A2210',
      errorBg: '#2E151D',
    },
    accent: {
      primary: '#2D8CFF',
      pressed: '#1B6ED1',
      subtle: '#173157',
      glow: 'rgba(45, 140, 255, 0.45)',
      onAccent: '#F7FAFF',
    },
  },
  ...sharedScale,
  shadows: {
    sm: '0 2px 10px rgba(0, 0, 0, 0.3)',
    md: '0 8px 20px rgba(0, 0, 0, 0.35)',
    lg: '0 14px 34px rgba(0, 0, 0, 0.4)',
    glow: '0 0 0 1px rgba(45, 140, 255, 0.35), 0 0 28px rgba(45, 140, 255, 0.3)',
  },
};

export const lightTheme: ThemeTokens = {
  mode: 'light',
  colors: {
    background: {
      base: '#F5F8FF',
      muted: '#EAF0FF',
      elevated: '#FFFFFF',
      overlay: 'rgba(15, 22, 41, 0.18)',
    },
    surface: {
      base: '#FFFFFF',
      raised: '#F8FAFF',
      sunken: '#E6EEFF',
      interactive: '#EAF2FF',
    },
    text: {
      primary: '#101A33',
      secondary: '#2C3E67',
      tertiary: '#51638E',
      inverse: '#F5F8FF',
      disabled: '#8A99BC',
    },
    border: {
      subtle: '#CFD9F1',
      default: '#B5C3E6',
      strong: '#8EA2D0',
      focus: '#2D8CFF',
    },
    state: {
      success: '#0A9B58',
      warning: '#A46B00',
      error: '#C4253C',
      successBg: '#DCF9E9',
      warningBg: '#FFF2D5',
      errorBg: '#FFE2E8',
    },
    accent: {
      primary: '#1E73E6',
      pressed: '#1159B8',
      subtle: '#DCEAFF',
      glow: 'rgba(30, 115, 230, 0.26)',
      onAccent: '#FFFFFF',
    },
  },
  ...sharedScale,
  shadows: {
    sm: '0 1px 4px rgba(16, 26, 51, 0.08)',
    md: '0 6px 16px rgba(16, 26, 51, 0.12)',
    lg: '0 10px 24px rgba(16, 26, 51, 0.14)',
    glow: '0 0 0 1px rgba(30, 115, 230, 0.2), 0 0 20px rgba(30, 115, 230, 0.18)',
  },
};

export const themeTokens: Record<ThemeMode, ThemeTokens> = {
  dark: darkTheme,
  light: lightTheme,
};
