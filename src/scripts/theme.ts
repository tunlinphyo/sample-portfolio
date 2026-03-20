export const THEME_HUE_STORAGE_KEY = 'theme-hue'
export const THEME_HUE_EVENT = 'theme-hue-change'

export function bindThemePicker() {
  const defaultHue = '200'
  const rootStyle = document.documentElement.style
  const savedHue = window.localStorage.getItem(THEME_HUE_STORAGE_KEY)
  const hue = savedHue ?? defaultHue
  rootStyle.setProperty('--palette-hue', hue)
}
