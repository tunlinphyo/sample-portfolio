import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const indexHtml = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8')
let html = ''

function readColorPickerMarkup() {
  const match = html.match(
    /<div class="range-color-picker">[\s\S]*?<button class="ring-opener"[^>]*popovertarget="([^"]+)"[\s\S]*?<div id="([^"]+)" popover class="color-picker-container">[\s\S]*?<div class="color-picker">[\s\S]*?<div id="pickermessage" class="picker-message">[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<div class="nob-container">[\s\S]*?<button class="nob"><\/button>/,
  )

  return match
    ? {
        popoverTarget: match[1],
        popoverId: match[2],
      }
    : null
}

describe('color picker markup', () => {
  beforeEach(() => {
    html = indexHtml
  })

  afterEach(() => {
    html = ''
    vi.restoreAllMocks()
  })

  it('defines the color picker trigger and popover structure in static markup', () => {
    expect(readColorPickerMarkup()).toEqual({
      popoverTarget: 'colorpicker',
      popoverId: 'colorpicker',
    })
  })
})
