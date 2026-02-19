import './polyfills/dialog'
import './polyfills/hover'
import './style.css'

document.addEventListener('DOMContentLoaded', inertFadeButton)
// document.addEventListener('DOMContentLoaded', handleTheme)

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

// async function handleTheme() {
//   const { setAttribute } = await import('./scripts/theme')
//   setAttribute()

//   const handleVisibilityChange = () => {
//     if (document.visibilityState === 'visible') {
//       setAttribute()
//     }
//   }
//   document.addEventListener('visibilitychange', handleVisibilityChange)
// }
