import './style.css'
import { bindThemePicker } from './scripts/theme'
import './polyfills/dialog'
import './polyfills/hover'
import './polyfills/toggle'
import './polyfills/random-css'

document.addEventListener('DOMContentLoaded', () => {
  bindThemePicker()
  inertFadeButton()

  void import('./styles/lazy.css')
  void import('./scripts/color-picker').then(({ bindColorPicker }) => {
    bindColorPicker()
  })
})

function inertFadeButton() {
  const hasCursorPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches

  if (hasCursorPointer) {
    const fadeButton = document.getElementById('fadeButton') as HTMLButtonElement
    if (fadeButton) fadeButton.inert = true
  }
}
