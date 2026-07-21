export type AppPalette = {
  accent: string;
  accentSoft: string;
  background: string;
  card: string;
  navigation: string;
  officeCard: string;
  officeFloor: string;
  officeRoom: string;
  primaryText: string;
  secondaryText: string;
  secretary: string;
  secretarySoft: string;
  separator: string;
  success: string;
  successSoft: string;
};

const lightPalette: AppPalette = {
  accent: '#2F6B59',
  accentSoft: '#E4F0EB',
  background: '#F2F2F7',
  card: '#FFFFFF',
  navigation: 'rgba(249, 249, 249, 0.98)',
  officeCard: '#F8FAF8',
  officeFloor: '#E8DED0',
  officeRoom: '#FFFDF9',
  primaryText: '#171719',
  secondaryText: '#69696F',
  secretary: '#536FA3',
  secretarySoft: '#E7ECF7',
  separator: '#D8D8DC',
  success: '#247A47',
  successSoft: '#E1F3E7',
};

const darkPalette: AppPalette = {
  accent: '#76BCA4',
  accentSoft: '#19392F',
  background: '#000000',
  card: '#1C1C1E',
  navigation: 'rgba(28, 28, 30, 0.98)',
  officeCard: '#161C19',
  officeFloor: '#3B332B',
  officeRoom: '#242321',
  primaryText: '#F4F4F5',
  secondaryText: '#A7A7AD',
  secretary: '#9DB4E3',
  secretarySoft: '#27344D',
  separator: '#3A3A3C',
  success: '#75C993',
  successSoft: '#183623',
};

export function getPalette(isDarkMode: boolean) {
  return isDarkMode ? darkPalette : lightPalette;
}
