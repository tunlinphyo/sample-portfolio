const FULL_WIDTH_CHAR_REGEX = /[\u3000\uFF01-\uFF5E]/g

const manualReplace = [
  {
    from: "。",
    to: "."
  }
]

const MANUAL_REPLACE_MAP = Object.create(null)
const MANUAL_REPLACE_PATTERN = manualReplace.map(({ from, to }) => {
  MANUAL_REPLACE_MAP[from] = to
  return from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}).join('|')
const MANUAL_REPLACE_REGEX = MANUAL_REPLACE_PATTERN ? new RegExp(MANUAL_REPLACE_PATTERN, 'g') : null
const HAS_FULL_WIDTH_CHAR_REGEX = MANUAL_REPLACE_PATTERN
  ? new RegExp(`[\\u3000\\uFF01-\\uFF5E]|${MANUAL_REPLACE_PATTERN}`)
  : /[\u3000\uFF01-\uFF5E]/

export function normalizeFullWidth(value = '') {
  if (!HAS_FULL_WIDTH_CHAR_REGEX.test(value)) return value
  if (MANUAL_REPLACE_REGEX) {
    value = value.replace(MANUAL_REPLACE_REGEX, (char) => MANUAL_REPLACE_MAP[char])
  }
  return value.replace(FULL_WIDTH_CHAR_REGEX, (char) => {
    const code = char.charCodeAt(0)
    if (code === 0x3000) return ' '
    return String.fromCharCode(code - 0xFEE0)
  })
}


export const emailPattern =
  /^[^ \t\n\r\f\v\u3000@\uFF20]+[@\uFF20][^ \t\n\r\f\v\u3000@\uFF20]+[.\uFF0E\u3002][^ \t\n\r\f\v\u3000@\uFF20]+$/

export const realEmailPattern =
  /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/;
