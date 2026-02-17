import './polyfills/dialog'
import './polyfills/hover'
import './style.css'

document.addEventListener('DOMContentLoaded', inertFadeButton)
document.addEventListener('DOMContentLoaded', enablePopoverScreenReaderSupport)


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

function enablePopoverScreenReaderSupport() {
  const popovers = document.querySelectorAll<HTMLElement>('.popovers .popover-content[popover]')

  for (const popover of popovers) {
    if (!popover.hasAttribute('tabindex')) {
      popover.setAttribute('tabindex', '-1')
    }

    popover.addEventListener('toggle', (event: Event) => {
      const toggleEvent = event as Event & { newState?: string }
      const isOpen = toggleEvent.newState === 'open' || popover.matches(':popover-open')
      const controls = document.querySelectorAll<HTMLElement>(`[popovertarget="${popover.id}"]`)

      for (const control of controls) {
        control.setAttribute('aria-expanded', String(isOpen))
      }

      if (!isOpen) return

      const target = popover.querySelector<HTMLElement>('h1, h2, h3, p, a, button') ?? popover
      target.focus({ preventScroll: true })
    })
  }
}
