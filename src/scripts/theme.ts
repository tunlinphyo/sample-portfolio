
type Theme = 'twilight' | 'day' | 'dusk' | 'night';

const getThemeByHour = (hour: number): Theme => {
  if (hour < 4 || hour >= 20) {
    return 'night';
  }
  if (hour < 8) {
    return 'twilight';
  }
  if (hour < 16) {
    return 'day';
  }
  return 'dusk';
};

export const setAttribute = (hour = new Date().getHours()): Theme => {
  const theme = getThemeByHour(hour);
  document.documentElement.setAttribute('data-theme', theme);
  return theme;
};
