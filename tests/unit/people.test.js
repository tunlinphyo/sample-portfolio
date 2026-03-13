import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const indexHtml = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8')
let html = ''

function readTestimonialsMarkup() {
  const declaredCount = Number.parseInt(
    html.match(/<div class="peoples"\s+style="--count:\s*(\d+)"/)?.[1] ?? '',
    10,
  )
  const triggers = Array.from(
    html.matchAll(
      /<button[^>]*popovertarget="([^"]+)"[^>]*class="people"[^>]*style="--index:\s*(\d+);\s*--border:\s*([^"]+)"[^>]*>\s*<img[^>]*src="([^"]+)"/g,
    ),
    ([, popoverTarget, index, border, imageSrc]) => ({
      popoverTarget,
      index: Number.parseInt(index, 10),
      border: border.trim(),
      imageSrc,
    }),
  )
  const messages = Array.from(
    html.matchAll(
      /<div class="message" id="([^"]+)"[^>]*>[\s\S]*?<div class="avatar" style="--border:\s*([^"]+)">\s*<img src="([^"]+)"/g,
    ),
    ([, id, border, imageSrc]) => ({
      id,
      border: border.trim(),
      imageSrc,
    }),
  )

  return { declaredCount, triggers, messages }
}

describe('people testimonials markup', () => {
  beforeEach(() => {
    html = indexHtml
  })

  afterEach(() => {
    html = ''
    vi.restoreAllMocks()
  })

  it('uses sequential testimonial indexes that match the declared count', () => {
    const { declaredCount, triggers } = readTestimonialsMarkup()

    expect(Number.isInteger(declaredCount) && declaredCount > 0).toBe(true)
    expect(triggers).toHaveLength(declaredCount)
    expect(
      triggers.map(({ index }) => index),
    ).toEqual(Array.from({ length: declaredCount }, (_, index) => index + 1))
  })

  it('keeps testimonial triggers aligned with testimonial message avatars', () => {
    const { triggers, messages } = readTestimonialsMarkup()

    expect(triggers).toHaveLength(messages.length)
    expect(
      triggers.map(({ popoverTarget, border, imageSrc }) => ({
        id: popoverTarget,
        border,
        imageSrc,
      })),
    ).toEqual(messages)
  })
})
