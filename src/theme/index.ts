import { createContext, useContext } from 'react';
import { darkTheme, lightTheme, type ThemeMode, type ThemeTokens, themeTokens } from './tokens';

export { darkTheme, lightTheme, themeTokens };
export type { ThemeMode, ThemeTokens };

export const defaultTheme: ThemeTokens = darkTheme;

export const ThemeContext = createContext<ThemeTokens>(defaultTheme);

export const resolveTheme = (mode?: ThemeMode): ThemeTokens => {
  if (!mode) {
    return defaultTheme;
  }

  return themeTokens[mode] ?? defaultTheme;
};

export const useTheme = (): ThemeTokens => useContext(ThemeContext);
