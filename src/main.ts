import './polyfills/dialog'
import './polyfills/hover'
import './style.css'

document.addEventListener('DOMContentLoaded', inertFadeButton)
document.addEventListener('DOMContentLoaded', themeToggle)


function inertFadeButton() {
  const hasCursorPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches

  if (hasCursorPointer) {
    const fadeButton = document.getElementById('fadeButton') as HTMLButtonElement
    const hintButton = document.getElementById('hintButton') as HTMLButtonElement
    fadeButton.inert = true
    showHint(hintButton)
  }
}

function showHint(hintButton: HTMLButtonElement) {
  const onMouseMove = (event: MouseEvent) => {
    if (event.clientY < window.innerHeight * 0.25) return

    hintButton.classList.add('hint-hover')
    setTimeout(() => {
      hintButton.classList.remove('hint-hover')
    }, 1000)
    document.removeEventListener('mousemove', onMouseMove)
  }

  document.addEventListener('mousemove', onMouseMove, { passive: true })
}

function themeToggle() {
  const theme: Record<string, string> = {
    1: 'dawn',
    2: 'sunrise',
    3: 'morning',
    4: 'forenoon',
    5: 'noon',
    6: 'afternoon',
    7: 'evening',
    8: 'sunset',
    9: 'twilight',
    10: 'night',
    11: 'midnight',
    12: 'gloaming'
  }
  const themeRange = document.getElementById('themeRange') as HTMLInputElement | null
  if (!themeRange) return

  const updateLightValue = () => {
    const themeName = theme[themeRange.value]
    document.documentElement.setAttribute('data-theme', themeName)
  }

  themeRange.addEventListener('input', updateLightValue, { passive: true })
  themeRange.addEventListener('change', updateLightValue, { passive: true })
  updateLightValue()
}
