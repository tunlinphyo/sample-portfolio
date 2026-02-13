
function togglePolyfill() {
  const elems = document.querySelectorAll('[toggletarget]')
  const toggles = document.querySelectorAll('[toggle]') as NodeListOf<HTMLElement>
  const hasCursorPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  const bodyInertState = new Map<HTMLElement, boolean>()

  for (const elem of Array.from(elems)) {
    elem.addEventListener('click', handleClick)
  }

  for (const elem of Array.from(toggles)) {
    elem.setAttribute('inert', '')
    elem.addEventListener('click', handleClose)
  }

  function handleClick(event: Event) {
    const targetEl = event.target as HTMLElement
    const dataEl = targetEl.closest('[toggletarget]') as HTMLElement
    if (dataEl) {
      const id = dataEl.getAttribute('toggletarget')
      const idEl = id ? document.getElementById(id) as HTMLElement : null
      if (idEl && idEl.hasAttribute('toggle')) {
        idEl.toggleAttribute('open')
        idEl.toggleAttribute('inert', !idEl.hasAttribute('open'))
        if (idEl.hasAttribute('open')) {
          setBodyInertExcept(idEl)
          idEl.focus({ preventScroll: true })
        } else {
          restoreBodyInert()
        }
        dataEl?.toggleAttribute('active')
      }
    }
  }

  function handleClose(event: Event) {
    if (!hasCursorPointer) return

    const toggleEl = event.target as HTMLElement
    const toggle = toggleEl.getAttribute('toggle')

    if (toggle === 'close') {
      const targetEl = document.querySelector(`[toggletarget="${toggleEl.id}"]`)
      toggleEl.toggleAttribute('open')
      toggleEl.toggleAttribute('inert', !toggleEl.hasAttribute('open'))
      if (toggleEl.hasAttribute('open')) {
        setBodyInertExcept(toggleEl)
        toggleEl.focus({ preventScroll: true })
      } else {
        restoreBodyInert()
      }
      targetEl?.toggleAttribute('active')
    }
  }

  function setBodyInertExcept(activeEl: HTMLElement) {
    restoreBodyInert()

    const bodyChildren = document.body.children
    for (let i = 0; i < bodyChildren.length; i++) {
      const child = bodyChildren[i] as HTMLElement
      const shouldKeepActive = child === activeEl || child.contains(activeEl)
      if (shouldKeepActive) continue

      bodyInertState.set(child, child.hasAttribute('inert'))
      child.setAttribute('inert', '')
    }
  }

  function restoreBodyInert() {
    for (const [el, wasInert] of bodyInertState) {
      if (wasInert) {
        el.setAttribute('inert', '')
      } else {
        el.removeAttribute('inert')
      }
    }
    bodyInertState.clear()
  }
}

document.addEventListener('DOMContentLoaded', () => {
  togglePolyfill()
})
