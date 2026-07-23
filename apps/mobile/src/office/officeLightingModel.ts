import type { TimeOfDayPeriod } from './officeScheduleModel';

export type OfficeLightingTheme = Readonly<{
  ambientOpacity: number;
  overlayColor: string;
  period: TimeOfDayPeriod;
}>;

/**
 * Ambient overlay per time-of-day period. `overlayColor` is drawn as a
 * translucent tint above the office art; `ambientOpacity` controls how
 * strong that tint is. Night is the darkest state; a desk lamp punches
 * through it for employees who are working late.
 */
export const OFFICE_LIGHTING_THEMES: Record<
  TimeOfDayPeriod,
  OfficeLightingTheme
> = {
  morning: { ambientOpacity: 0.06, overlayColor: '#FFE9C2', period: 'morning' },
  midday: { ambientOpacity: 0, overlayColor: '#FFFFFF', period: 'midday' },
  afternoon: {
    ambientOpacity: 0.08,
    overlayColor: '#FFD9A0',
    period: 'afternoon',
  },
  evening: {
    ambientOpacity: 0.22,
    overlayColor: '#7B5A8C',
    period: 'evening',
  },
  night: { ambientOpacity: 0.62, overlayColor: '#0B1230', period: 'night' },
};

export function getOfficeLightingTheme(
  period: TimeOfDayPeriod,
): OfficeLightingTheme {
  return OFFICE_LIGHTING_THEMES[period];
}

export const DESK_LAMP_GLOW_COLOR = '#FFD066';
export const DESK_LAMP_GLOW_RADIUS = 0.12;

export function isNightPeriod(period: TimeOfDayPeriod): boolean {
  return period === 'night' || period === 'evening';
}
