const RANGE_PATTERN = /^\s*([^\s,]+)[\s,]+([^\s,]+)\s*$/
const VALUE_PATTERN = /^(-?(?:\d+\.?\d*|\.\d+))(.*)$/
const DEFAULT_RANDOM_VAR = '--random'
const TARGET_VAR_ATTR = 'data-random-var'
// const HAS_NATIVE_RANDOM_CSS_SUPPORT =
//   typeof CSS !== 'undefined' &&
//   typeof CSS.supports === 'function' &&
//   CSS.supports('rotate: random(0deg, 10deg)')

function parseCssValue(value: string) {
  const match = VALUE_PATTERN.exec(value)
  if (!match) return null

  const number = Number.parseFloat(match[1])
  if (!Number.isFinite(number)) return null

  return { number, unit: match[2] }
}

function randomCssPolyfill() {
  const elements = document.querySelectorAll<HTMLElement>('[data-random]')

  for (let i = 0; i < elements.length; i += 1) {
    const element = elements[i]
    const randomRange = element.getAttribute('data-random')
    if (!randomRange) continue

    const range = RANGE_PATTERN.exec(randomRange)
    if (!range) continue

    const min = parseCssValue(range[1])
    const max = parseCssValue(range[2])
    if (!min || !max) continue

    const low = min.number < max.number ? min.number : max.number
    const high = min.number < max.number ? max.number : min.number
    const unit = max.unit || min.unit
    const value = low + Math.random() * (high - low)
    const variableName = element.getAttribute(TARGET_VAR_ATTR) || DEFAULT_RANDOM_VAR

    element.style.setProperty(variableName, `${value}${unit}`)
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', randomCssPolyfill, { once: true })
} else {
  randomCssPolyfill()
}

// if (!HAS_NATIVE_RANDOM_CSS_SUPPORT) {
//   console.log('random() CSS do not support in this browser.')
//   if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', randomCssPolyfill, { once: true })
//   } else {
//     randomCssPolyfill()
//   }
// }
