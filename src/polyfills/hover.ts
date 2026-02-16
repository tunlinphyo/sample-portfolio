function hoverPolyfill() {
  const elems = document.querySelectorAll('[hoverclick]')
  const hasCursorPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches

  if (!hasCursorPointer) return

  for (const elem of elems) {
    elem.addEventListener('mouseenter', handleEnter)
    elem.addEventListener('mouseleave', handleLeave)
    elem.addEventListener('focus', handleFocus)
    elem.addEventListener('blur', handleBlur)
  }

  function handleEnter(event: Event) {
    const elem = event.currentTarget as HTMLElement | null
    if (!elem) return
    elem.click()
  }

  function handleLeave(event: Event) {
    const elem = event.currentTarget as HTMLElement | null
    if (!elem) return
    const attr = elem.getAttribute('hoverclick')
    if (attr !== 'manual') {
      elem.click()
    }
  }

  function handleFocus(event: Event) {
    const elem = event.currentTarget as HTMLElement | null
    if (!elem || !elem.matches(':focus-visible')) return
    elem.click()
  }

  function handleBlur(event: Event) {
    const elem = event.currentTarget as HTMLElement | null
    if (!elem) return
    const attr = elem.getAttribute('hoverclick')
    if (attr !== 'manual') {
      elem.click()
    }
  }
}

document.addEventListener('DOMContentLoaded', hoverPolyfill)
