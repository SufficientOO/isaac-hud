
export interface Theme {

  screenBg: string;

  dockBg: string;

  dockDivider: string;

  mapBorder: string;
}

export const THEME: Theme = {
  screenBg: '#1a1a2e',

  dockBg: 'rgba(105, 105, 105, 0.5)',
  dockDivider: 'transparent',
  mapBorder: '#000000',
};

export const DEFAULT_THEME = 'normal' as const;
export type ThemeName = 'normal';
export const THEMES: Record<ThemeName, Theme> = { normal: THEME };
