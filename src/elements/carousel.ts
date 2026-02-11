class CarouselList extends HTMLElement {
  private static template = (() => {
    const template = document.createElement('template')
    template.innerHTML = `
      <style>
        :host {
          position: relative;
          display: block;
        }
        ul, button {
          all: unset;
        }
        div[part="carousle"] {
          display: none;
        }
        ul[part="list"] {
          scrollbar-width: none;
        }
        ul[part="list"]::-webkit-scrollbar {
          width: 0;
          height: 0;
        }
      </style>
      <ul part="list" role="list">
        <slot></slot>
      </ul>
      <div part="carousle" role="list"></div>
      <button class="prev" part="control prev" type="button" aria-label="Previous"></button>
      <button class="next" part="control next" type="button" aria-label="Next"></button>
    `
    return template
  })()

  private hasSetup = false
  private cleanup: Array<() => void> = []
  private currentIndex = 0
  private items: HTMLElement[] = []
  private intersectionObserver: IntersectionObserver | null = null
  private intersectionRatios = new WeakMap<HTMLElement, number>()
  private slotEl: HTMLSlotElement | null = null
  private listEl: HTMLUListElement | null = null
  private navListEl: HTMLDivElement | null = null
  private prevButton: HTMLButtonElement | null = null
  private nextButton: HTMLButtonElement | null = null
  private scrollAnimationFrame: number | null = null

  constructor() {
    super()
    const root = this.attachShadow({ mode: 'open' })
    root.appendChild(CarouselList.template.content.cloneNode(true))
  }

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
    this.slotEl = this.shadowRoot?.querySelector('slot') ?? null
    this.listEl = this.shadowRoot?.querySelector('ul[part="list"]') ?? null
    this.navListEl = this.shadowRoot?.querySelector('div[part="carousle"]') ?? null
    this.prevButton = this.shadowRoot?.querySelector('button.prev') ?? null
    this.nextButton = this.shadowRoot?.querySelector('button.next') ?? null

    const syncItems = () => {
      if (!this.slotEl) return
      this.items = this.slotEl.assignedElements({ flatten: true }).filter(
        (node): node is HTMLElement => node instanceof HTMLElement && node.tagName === 'LI'
      )
      if (this.currentIndex >= this.items.length) {
        this.currentIndex = Math.max(0, this.items.length - 1)
      }
      this.renderDottedNavigation()
      this.setupIntersectionObserver()
      this.setCurrentIndex(this.currentIndex, false)
    }

    const updateItems = () => syncItems()

    const handlePrev = () => {
      if (!this.items.length) return
      const index = Math.max(0, this.currentIndex - 1)
      this.setCurrentIndex(index, true)
    }

    const handleNext = () => {
      if (!this.items.length) return
      const index = Math.min(this.items.length - 1, this.currentIndex + 1)
      this.setCurrentIndex(index, true)
    }

    this.setAttribute('role', 'list')
    updateItems()

    this.slotEl?.addEventListener('slotchange', updateItems)
    this.prevButton?.addEventListener('click', handlePrev)
    this.nextButton?.addEventListener('click', handleNext)

    this.cleanup.push(() => {
      this.slotEl?.removeEventListener('slotchange', updateItems)
    })
    this.cleanup.push(() => {
      this.intersectionObserver?.disconnect()
      this.intersectionObserver = null
      this.intersectionRatios = new WeakMap<HTMLElement, number>()
    })
    this.cleanup.push(() => {
      if (this.scrollAnimationFrame !== null) {
        cancelAnimationFrame(this.scrollAnimationFrame)
        this.scrollAnimationFrame = null
      }
    })
    if (this.prevButton) this.cleanup.push(() => this.prevButton?.removeEventListener('click', handlePrev))
    if (this.nextButton) this.cleanup.push(() => this.nextButton?.removeEventListener('click', handleNext))
  }

  private smoothScrollToItem(target: HTMLElement) {
    const container = this.listEl
    if (!container) {
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      return
    }

    const startLeft = container.scrollLeft
    const startTop = container.scrollTop
    const maxLeft = Math.max(0, container.scrollWidth - container.clientWidth)
    const maxTop = Math.max(0, container.scrollHeight - container.clientHeight)
    const targetLeft = Math.min(maxLeft, Math.max(0, target.offsetLeft - (container.clientWidth - target.clientWidth) / 2))
    const targetTop = Math.min(maxTop, Math.max(0, target.offsetTop - (container.clientHeight - target.clientHeight) / 2))
    const deltaLeft = targetLeft - startLeft
    const deltaTop = targetTop - startTop

    if (deltaLeft === 0 && deltaTop === 0) return
    if (this.scrollAnimationFrame !== null) {
      cancelAnimationFrame(this.scrollAnimationFrame)
      this.scrollAnimationFrame = null
    }

    const distance = Math.hypot(deltaLeft, deltaTop)
    const duration = Math.max(450, Math.min(950, distance * 0.1))
    const startTime = performance.now()
    const easeOutCubic = (t: number) => 1 - (1 - t) ** 3

    const step = (time: number) => {
      const progress = Math.min(1, (time - startTime) / duration)
      const easedProgress = easeOutCubic(progress)
      container.scrollTo(startLeft + deltaLeft * easedProgress, startTop + deltaTop * easedProgress)
      if (progress < 1) {
        this.scrollAnimationFrame = requestAnimationFrame(step)
      } else {
        this.scrollAnimationFrame = null
      }
    }

    this.scrollAnimationFrame = requestAnimationFrame(step)
  }

  private setupIntersectionObserver() {
    this.intersectionObserver?.disconnect()
    this.intersectionObserver = null
    this.intersectionRatios = new WeakMap<HTMLElement, number>()

    if (!this.items.length || typeof IntersectionObserver === 'undefined') return

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!(entry.target instanceof HTMLElement)) continue
          this.intersectionRatios.set(entry.target, entry.intersectionRatio)
        }

        let nextIndex = this.currentIndex
        let maxRatio = -1
        for (let index = 0; index < this.items.length; index += 1) {
          const ratio = this.intersectionRatios.get(this.items[index]) ?? 0
          if (ratio > maxRatio) {
            maxRatio = ratio
            nextIndex = index
          }
        }

        if (maxRatio > 0 && nextIndex !== this.currentIndex) {
          this.setCurrentIndex(nextIndex, false)
        }
      },
      {
        root: this,
        threshold: [0.25, 0.5, 0.75, 1],
      }
    )

    for (const item of this.items) {
      this.intersectionRatios.set(item, 0)
      this.intersectionObserver.observe(item)
    }
  }

  private updateControlStates() {
    const maxIndex = this.items.length - 1
    const isPrevDisabled = this.currentIndex <= 0
    const isNextDisabled = this.currentIndex >= maxIndex

    if (this.prevButton) {
      this.prevButton.disabled = isPrevDisabled
    }

    if (this.nextButton) {
      this.nextButton.disabled = isNextDisabled
    }
  }

  private setCurrentIndex(index: number, scroll: boolean) {
    if (!this.items.length) {
      this.currentIndex = 0
      this.updateControlStates()
      this.updateDottedNavigationState()
      this.updateActiveItemState()
      return
    }
    this.currentIndex = index
    this.updateControlStates()
    this.updateDottedNavigationState()
    this.updateActiveItemState()
    const current = this.items[this.currentIndex]
    if (!current) return
    if (scroll) {
      this.smoothScrollToItem(current)
    }
  }

  private updateActiveItemState() {
    this.items.forEach((item, index) => {
      if (index === this.currentIndex) {
        item.setAttribute('active', '')
      } else {
        item.removeAttribute('active')
      }
    })
  }

  private renderDottedNavigation() {
    if (!this.navListEl) return
    this.navListEl.innerHTML = ''
    const fragment = document.createDocumentFragment()

    for (let index = 0; index < this.items.length; index += 1) {
      const button = document.createElement('button')
      button.type = 'button'
      button.setAttribute('part', 'dot')
      button.setAttribute('aria-label', `Go to slide ${index + 1}`)
      button.dataset.index = String(index)
      button.addEventListener('click', () => this.setCurrentIndex(index, true))
      fragment.appendChild(button)
    }

    this.navListEl.appendChild(fragment)
    this.updateDottedNavigationState()
  }

  private updateDottedNavigationState() {
    if (!this.navListEl) return
    const buttons = this.navListEl.querySelectorAll('button')
    buttons.forEach((button, index) => {
      const isCurrent = index === this.currentIndex
      button.setAttribute('aria-current', isCurrent ? 'true' : 'false')
      button.setAttribute('part', isCurrent ? 'dot dot-current' : 'dot')
    })
  }
}

if (!customElements.get('carousel-list')) {
  customElements.define('carousel-list', CarouselList)
}
