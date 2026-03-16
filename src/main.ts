import './polyfills/dialog'
import './polyfills/hover'
import './polyfills/random-css'
import './style.css'

document.addEventListener('DOMContentLoaded', inertFadeButton)

function inertFadeButton() {
  void import('./styles/lazy.css')
  const hasCursorPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches

  if (hasCursorPointer) {
    const fadeButton = document.getElementById('fadeButton') as HTMLButtonElement
    if (fadeButton) fadeButton.inert = true
  }
}
