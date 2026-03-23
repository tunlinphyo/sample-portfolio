export const THEME_HUE_STORAGE_KEY = 'theme-hue'
export const THEME_HUE_EVENT = 'theme-hue-change'

export function bindThemePicker() {
  const defaultHue = '200'
  const savedHue = window.localStorage.getItem(THEME_HUE_STORAGE_KEY)
  const hue = savedHue ?? defaultHue
  updateTheme(hue)
}

export function updateTheme(hue: string) {
  const rootStyle = document.documentElement.style
  rootStyle.setProperty('--palette-hue', hue)

  const colorPicker = document.getElementById('pickermessage') as HTMLElement
  if (colorPicker) colorPicker.dataset.hue = hue

  // const themeColor = getComputedStyle(themeSurface)
  //   .backgroundColor
  //   .trim()

  // if (!themeColor) return

  // document.documentElement.style.backgroundColor = themeColor
  // document.body?.style.setProperty('background-color', themeColor)
}
