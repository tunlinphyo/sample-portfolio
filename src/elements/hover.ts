class HoverView extends HTMLElement {
  static observedAttributes = ['open']

  private static template = (() => {
    const template = document.createElement('template')
    template.innerHTML = `
      <style>
        :host { display: none; }
        :host([open]) { display: block; }
      </style>
      <slot></slot>
    `
    return template
  })()

  constructor() {
    super()
    const root = this.attachShadow({ mode: 'open' })
    root.appendChild(HoverView.template.content.cloneNode(true))
  }
}

class HoverItem extends HTMLElement {
  get targetId(): string | null {
    return this.getAttribute('hovertarget')
  }
}

class HoverGroup extends HTMLElement {
  private hasSetup = false
  private cleanup: Array<() => void> = []

  connectedCallback() {
    if (this.hasSetup) return
    this.hasSetup = true
    this.setup()
  }

  disconnectedCallback() {
    for (const dispose of this.cleanup) dispose()
    this.cleanup = []
    this.hasSetup = false
  }

  private setup() {
    const triggers = Array.from(this.querySelectorAll('hover-item')) as HoverItem[]
    const pairs: Array<{ trigger: HoverItem; view: HoverView }> = []

    for (const trigger of triggers) {
      const id = trigger.targetId
      if (!id) continue

      const view = document.getElementById(id)
      if (!view || !(view instanceof HoverView)) continue

      pairs.push({ trigger, view })
    }

    const defaultCandidate = this.querySelector('hover-view[default]')
    const defaultView = defaultCandidate instanceof HoverView ? defaultCandidate : null
    const allViews = defaultView
      ? [...pairs.map(({ view }) => view), defaultView]
      : pairs.map(({ view }) => view)

    const closeAll = () => {
      for (const view of allViews) view.removeAttribute('open')
    }

    const clearActiveTriggers = () => {
      for (const { trigger } of pairs) trigger.removeAttribute('active')
    }

    const showDefaultIfIdle = () => {
      if (!defaultView) return
      for (const { view } of pairs) {
        if (view.hasAttribute('open')) return
      }
      defaultView.setAttribute('open', '')
    }

    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as Node | null
      if (!target) return
      for (const { trigger, view } of pairs) {
        if (trigger.contains(target) || view.contains(target)) return
      }
      closeAll()
      clearActiveTriggers()
      showDefaultIfIdle()
    }

    for (const { trigger, view } of pairs) {
      view.removeAttribute('open')
      trigger.removeAttribute('active')

      const handleEnter = () => {
        if (defaultView && defaultView !== view) defaultView.removeAttribute('open')
        view.setAttribute('open', '')
      }
      const handleLeave = () => {
        view.removeAttribute('open')
        showDefaultIfIdle()
      }
      const handleClick = (event: MouseEvent) => {
        event.preventDefault()
        event.stopPropagation()
        closeAll()
        clearActiveTriggers()
        trigger.setAttribute('active', '')
        view.setAttribute('open', '')
      }

      trigger.addEventListener('mouseenter', handleEnter)
      trigger.addEventListener('mouseleave', handleLeave)
      trigger.addEventListener('click', handleClick)

      this.cleanup.push(() => {
        trigger.removeEventListener('mouseenter', handleEnter)
        trigger.removeEventListener('mouseleave', handleLeave)
        trigger.removeEventListener('click', handleClick)
      })
    }

    document.addEventListener('click', handleDocumentClick)
    this.cleanup.push(() => {
      document.removeEventListener('click', handleDocumentClick)
    })

    showDefaultIfIdle()
  }
}

if (!customElements.get('hover-view')) {
  customElements.define('hover-view', HoverView)
}
if (!customElements.get('hover-item')) {
  customElements.define('hover-item', HoverItem)
}
if (!customElements.get('hover-group')) {
  customElements.define('hover-group', HoverGroup)
}
