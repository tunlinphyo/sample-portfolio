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

  const themeSurface = document.querySelector('main') ?? document.body ?? document.documentElement
  const themeColor = getComputedStyle(themeSurface)
    .backgroundColor
    .trim()

  if (!themeColor) return

  let themeColorMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')

  if (!themeColorMeta) {
    themeColorMeta = document.createElement('meta')
    themeColorMeta.name = 'theme-color'
    document.head.append(themeColorMeta)
  }

  document.documentElement.style.backgroundColor = themeColor
  document.body?.style.setProperty('background-color', themeColor)
  themeColorMeta.content = themeColor
}
