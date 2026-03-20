import { THEME_HUE_EVENT, THEME_HUE_STORAGE_KEY } from './theme'

class ColorPicker {
  private readonly rootStyle = document.documentElement.style
  private readonly opener: HTMLButtonElement | null
  private readonly wheel: HTMLElement | null
  private readonly knob: HTMLButtonElement | null
  private isDragging = false

  constructor(private readonly container: HTMLElement) {
    this.opener = container.parentElement?.querySelector('.ring-opener') ?? null
    this.wheel = container.querySelector('.color-picker')
    this.knob = container.querySelector('.nob')
  }

  init() {
    if (!this.opener || !this.wheel || !this.knob) return

    const savedHue = window.localStorage.getItem(THEME_HUE_STORAGE_KEY)
    const fallbackHue = this.rootStyle.getPropertyValue('--palette-hue').trim()
    const initialHue = this.normalizeHue(Number((savedHue ?? fallbackHue) || 200))

    this.opener.type = 'button'
    this.opener.setAttribute('aria-label', 'Open color picker')
    this.opener.setAttribute('aria-controls', this.container.id)

    this.knob.type = 'button'
    this.knob.setAttribute('role', 'slider')
    this.knob.setAttribute('aria-label', 'Color picker')
    this.knob.setAttribute('aria-orientation', 'horizontal')
    this.knob.setAttribute('aria-valuemin', '0')
    this.knob.setAttribute('aria-valuemax', '360')
    this.knob.setAttribute('aria-controls', 'themepicker')

    this.applyHue(initialHue)

    this.container.addEventListener('toggle', this.handleToggle as EventListener)
    this.knob.addEventListener('keydown', this.handleKeydown)
    this.knob.addEventListener('pointerdown', this.handlePointerDown)
    this.knob.addEventListener('touchstart', this.handleTouchStart, { passive: false })
    window.addEventListener('pointermove', this.handlePointerMove)
    window.addEventListener('pointerup', this.handlePointerUp)
    window.addEventListener('touchmove', this.handleTouchMove, { passive: false })
    window.addEventListener('touchend', this.handleTouchEnd)
    window.addEventListener('touchcancel', this.handleTouchEnd)
    window.addEventListener(THEME_HUE_EVENT, this.handleExternalHue as EventListener)
  }

  private readonly handleToggle = (event: ToggleEvent) => {
    if (event.newState !== 'open') return

    this.knob?.focus()
  }

  private readonly handleKeydown = (event: KeyboardEvent) => {
    const deltaByKey: Record<string, number> = {
      ArrowUp: 5,
      ArrowRight: 5,
      ArrowDown: -5,
      ArrowLeft: -5,
      PageUp: 20,
      PageDown: -20,
    }

    if (event.key === 'Home') {
      event.preventDefault()
      this.commitHue(0)
      return
    }

    if (event.key === 'End') {
      event.preventDefault()
      this.commitHue(360)
      return
    }

    const delta = deltaByKey[event.key]

    if (!delta) return

    event.preventDefault()
    this.commitHue(this.currentHue + delta)
  }

  private readonly handlePointerDown = (event: PointerEvent) => {
    if (event.button !== 0) return

    event.preventDefault()
    this.isDragging = true
    this.knob?.setPointerCapture?.(event.pointerId)
    this.knob?.focus()
    this.commitHue(this.getHueFromPointer(event))
  }

  private readonly handlePointerMove = (event: PointerEvent) => {
    if (!this.isDragging) return

    event.preventDefault()
    this.commitHue(this.getHueFromPointer(event))
  }

  private readonly handlePointerUp = (event: PointerEvent) => {
    if (!this.isDragging) return

    this.isDragging = false
    this.knob?.releasePointerCapture?.(event.pointerId)
  }

  private readonly handleTouchStart = (event: TouchEvent) => {
    if (event.touches.length === 0) return

    event.preventDefault()
    this.isDragging = true
    this.knob?.focus()
    this.commitHue(this.getHueFromClientPoint(event.touches[0].clientX, event.touches[0].clientY))
  }

  private readonly handleTouchMove = (event: TouchEvent) => {
    if (!this.isDragging || event.touches.length === 0) return

    event.preventDefault()
    this.commitHue(this.getHueFromClientPoint(event.touches[0].clientX, event.touches[0].clientY))
  }

  private readonly handleTouchEnd = () => {
    if (!this.isDragging) return

    this.isDragging = false
  }

  private readonly handleExternalHue = (event: Event) => {
    const hue = (event as CustomEvent<number>).detail
    if (typeof hue !== 'number' || Number.isNaN(hue)) return

    this.applyHue(hue)
  }

  private get currentHue() {
    return Number(this.container.dataset.hue ?? 0)
  }

  private commitHue(hue: number) {
    const normalizedHue = this.normalizeHue(hue)

    this.applyHue(normalizedHue)
    window.localStorage.setItem(THEME_HUE_STORAGE_KEY, String(normalizedHue))
    window.dispatchEvent(new CustomEvent<number>(THEME_HUE_EVENT, { detail: normalizedHue }))
  }

  private applyHue(hue: number) {
    const normalizedHue = this.normalizeHue(hue)
    const degrees = normalizedHue === 360 ? 360 : normalizedHue

    this.container.dataset.hue = String(degrees)
    this.knob?.setAttribute('aria-valuenow', String(degrees))
    this.knob?.setAttribute('aria-valuetext', `${Math.round(degrees)} degrees`)
    this.rootStyle.setProperty('--palette-hue', String(degrees))

    if (this.knob) {
      this.knob.style.offsetDistance = `${(degrees / 360) * 100}%`
    }
  }

  private getHueFromPointer(event: PointerEvent) {
    return this.getHueFromClientPoint(event.clientX, event.clientY)
  }

  private getHueFromClientPoint(clientX: number, clientY: number) {
    const bounds = this.container.getBoundingClientRect()
    const centerX = bounds.left + bounds.width / 2
    const centerY = bounds.top + bounds.height / 2
    const angle = Math.atan2(clientY - centerY, clientX - centerX)

    return this.normalizeHue((angle * 180) / Math.PI + 90)
  }

  private normalizeHue(hue: number) {
    if (!Number.isFinite(hue)) return 0

    const normalizedHue = ((Math.round(hue) % 360) + 360) % 360
    return normalizedHue === 0 && hue > 0 ? 360 : normalizedHue
  }
}

export function bindColorPicker() {
  const colorPicker = document.querySelector('#colorpicker') as HTMLElement | null
  if (!colorPicker) return

  new ColorPicker(colorPicker).init()
}
