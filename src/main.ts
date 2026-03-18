import './polyfills/dialog'
import './polyfills/hover'
import './polyfills/random-css'
import { bindThemePicker } from './scripts/theme'
import './style.css'

document.addEventListener('DOMContentLoaded', () => {
  void import('./styles/lazy.css')
  inertFadeButton()
  bindThemePicker()
})

function inertFadeButton() {
  const hasCursorPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches

  if (hasCursorPointer) {
    const fadeButton = document.getElementById('fadeButton') as HTMLButtonElement
    if (fadeButton) fadeButton.inert = true
  }
}
