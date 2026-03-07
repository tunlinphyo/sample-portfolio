function hoverPolyfill() {
  const elems = document.querySelectorAll('[hoverclick]')
  const hasCursorPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  const keyboardFocusedElems = new WeakSet<HTMLElement>()
  let keyboardFocusArmed = false
  let mouseUsedAfterKeyboardFocus = false

  if (!hasCursorPointer) return

  document.addEventListener('mousemove', handleMouseIntent, { passive: true, capture: true })
  document.addEventListener('pointerdown', handleMouseIntent, { passive: true, capture: true })

  for (const elem of elems) {
    if (elem.getAttribute('hoverclick') !== 'focusonly') {
      elem.addEventListener('mouseenter', handleEnter)
      elem.addEventListener('mouseleave', handleLeave)
      elem.addEventListener('blur', handleBlur)
    }
    elem.addEventListener('focus', handleFocus)
  }

  function handleEnter(event: Event) {
    const elem = event.currentTarget as HTMLElement | null
    if (!elem) return
    if (keyboardFocusedElems.has(elem)) return
    elem.click()
  }

  function handleLeave(event: Event) {
    const elem = event.currentTarget as HTMLElement | null
    if (!elem) return
    if (keyboardFocusedElems.has(elem)) return
    const attr = elem.getAttribute('hoverclick')
    if (attr !== 'manual') {
      elem.click()
    }
  }

  function handleFocus(event: Event) {
    const elem = event.currentTarget as HTMLElement | null
    if (!elem || !elem.matches(':focus-visible')) return
    keyboardFocusedElems.add(elem)
    keyboardFocusArmed = true
    mouseUsedAfterKeyboardFocus = false
    elem.click()
  }

  function handleBlur(event: Event) {
    const elem = event.currentTarget as HTMLElement | null
    if (!elem) return
    if (keyboardFocusedElems.delete(elem)) {
      if (!mouseUsedAfterKeyboardFocus) {
        keyboardFocusArmed = false
        return
      }
      keyboardFocusArmed = false
      mouseUsedAfterKeyboardFocus = false
    }
    const attr = elem.getAttribute('hoverclick')
    if (attr !== 'manual') {
      elem.click()
    }
  }

  function handleMouseIntent() {
    if (!keyboardFocusArmed) return
    mouseUsedAfterKeyboardFocus = true
  }
}

document.addEventListener('DOMContentLoaded', hoverPolyfill)
