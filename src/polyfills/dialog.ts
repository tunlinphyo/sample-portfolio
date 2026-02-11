
function dialogPolyfill() {
  const elems = document.querySelectorAll('[dialogtarget]')
  const dialodElems = document.querySelectorAll('dialog') as NodeListOf<HTMLDialogElement>

  for (const elem of Array.from(elems)) {
    elem.addEventListener('click', handleClick)
  }

  for (const elem of Array.from(dialodElems)) {
    elem.addEventListener('click', (event) => handleClose(event, elem))
  }

  function handleClick(event: Event) {
    const targetEl = event.target as HTMLElement
    const dataEl = targetEl.closest('[dialogtarget]') as HTMLElement
    if (dataEl) {
      const id = dataEl.getAttribute('dialogtarget')
      const dialog = id ? document.getElementById(id) as HTMLDialogElement : null
      dialog?.showModal()
    }
  }

  function handleClose(event: Event, dialogEl: HTMLDialogElement) {
    const targetEl = event.target as HTMLElement
    if (targetEl.hasAttribute('dialogclose')) {
      dialogEl.close()
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  dialogPolyfill()
})
