
function togglePolyfill() {
  const elems = document.querySelectorAll('[toggletarget]')

  for (const elem of Array.from(elems)) {
    elem.addEventListener('click', handleClick)
  }

  function handleClick(event: Event) {
    const targetEl = event.target as HTMLElement
    const dataEl = targetEl.closest('[toggletarget]') as HTMLElement
    if (dataEl) {
      const id = dataEl.getAttribute('toggletarget')
      const idEl = id ? document.getElementById(id) as HTMLElement : null
      idEl?.toggleAttribute('open')
      dataEl?.toggleAttribute('active')
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  togglePolyfill()
})
