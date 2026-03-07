import './polyfills/dialog'
import './polyfills/hover'
import './style.css'

document.addEventListener('DOMContentLoaded', inertFadeButton)

function inertFadeButton() {
  const hasCursorPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches

  if (hasCursorPointer) {
    const fadeButton = document.getElementById('fadeButton') as HTMLButtonElement
    if (fadeButton) fadeButton.inert = true
  }
}