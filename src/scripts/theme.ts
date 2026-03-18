const THEME_HUE_STORAGE_KEY = 'theme-hue'

class Theme {
  private readonly rootStyle = document.documentElement.style

  constructor(private readonly themePicker: HTMLInputElement) {}

  init() {
    const savedHue = window.localStorage.getItem(THEME_HUE_STORAGE_KEY)
    const hue = savedHue ?? this.themePicker.value

    this.applyHue(hue)
    this.themePicker.addEventListener('input', this.handleInput)
    this.themePicker.addEventListener('change', this.handleChange)
  }

  private readonly handleInput = () => {
    this.applyHue(this.themePicker.value)
  }

  private readonly handleChange = () => {
    window.localStorage.setItem(THEME_HUE_STORAGE_KEY, this.themePicker.value)
  }

  private applyHue(hue: string) {
    this.themePicker.value = hue
    this.rootStyle.setProperty('--palette-hue', hue)
  }
}

export function bindThemePicker() {
  const themePicker = document.querySelector('#themepicker input[type="range"]') as HTMLInputElement
  if (!themePicker) return

  new Theme(themePicker).init()
}
