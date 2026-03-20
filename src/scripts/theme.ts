export const THEME_HUE_STORAGE_KEY = 'theme-hue'
export const THEME_HUE_EVENT = 'theme-hue-change'

export function bindThemePicker() {
  const themePicker = document.querySelector('#themepicker input[type="range"]') as HTMLInputElement
  if (!themePicker) return

  const rootStyle = document.documentElement.style
  const defaultHue = themePicker.value
  const savedHue = window.localStorage.getItem(THEME_HUE_STORAGE_KEY)
  const hue = savedHue ?? defaultHue

  if (savedHue === null) {
    window.localStorage.setItem(THEME_HUE_STORAGE_KEY, defaultHue)
  }

  themePicker.value = hue
  rootStyle.setProperty('--palette-hue', hue)
}
