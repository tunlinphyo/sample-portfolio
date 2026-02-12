
function togglePolyfill() {
  const elems = document.querySelectorAll('[toggletarget]')
  const toggles = document.querySelectorAll('[toggle]') as NodeListOf<HTMLElement>
  const hasCursorPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches

  for (const elem of Array.from(elems)) {
    elem.addEventListener('click', handleClick)
  }

  for (const elem of Array.from(toggles)) {
    elem.addEventListener('click', handleClose)
  }

  function handleClick(event: Event) {
    const targetEl = event.target as HTMLElement
    const dataEl = targetEl.closest('[toggletarget]') as HTMLElement
    if (dataEl) {
      const id = dataEl.getAttribute('toggletarget')
      const idEl = id ? document.getElementById(id) as HTMLElement : null
      if (idEl && idEl.hasAttribute('toggle')) {
        idEl?.toggleAttribute('open')
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
      toggleEl?.toggleAttribute('open')
      targetEl?.toggleAttribute('active')
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  togglePolyfill()
})
