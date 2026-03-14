import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const indexHtml = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8')
let html = ''

function readContactActions() {
  return Array.from(
    html.matchAll(
      /<button class="contact-action"[^>]*popovertarget="([^"]+)"[^>]*aria-label="([^"]+)"[^>]*>[\s\S]*?<div id="([^"]+)"[^>]*aria-labelledby="([^"]+)"[\s\S]*?<h2 id="([^"]+)">([^<]+)<\/h2>/g,
    ),
    ([, popoverTarget, actionLabel, popoverId, ariaLabelledBy, headingId, headingText]) => ({
      popoverTarget,
      actionLabel,
      popoverId,
      ariaLabelledBy,
      headingId,
      headingText,
    }),
  )
}

function readExternalHttpsLinks() {
  return Array.from(
    html.matchAll(/<a ([^>]*href="https:\/\/[^"]+"[^>]*)>/g),
    ([, attributes]) => ({
      href: attributes.match(/href="([^"]+)"/)?.[1] ?? '',
      target: attributes.match(/target="([^"]+)"/)?.[1] ?? '',
      rel: attributes.match(/rel="([^"]+)"/)?.[1] ?? '',
    }),
  )
}

describe('portfolio contact actions markup', () => {
  beforeEach(() => {
    html = indexHtml
  })

  afterEach(() => {
    html = ''
    vi.restoreAllMocks()
  })

  it('uses matching accessible labels for contact actions and popovers', () => {
    const contactActions = readContactActions()

    expect(contactActions).toEqual([
      {
        popoverTarget: 'github-popover',
        actionLabel: 'GitHub',
        popoverId: 'github-popover',
        ariaLabelledBy: 'github-popover-title',
        headingId: 'github-popover-title',
        headingText: 'GitHub',
      },
      {
        popoverTarget: 'linkedin-popover',
        actionLabel: 'LinkedIn',
        popoverId: 'linkedin-popover',
        ariaLabelledBy: 'linkedin-popover-title',
        headingId: 'linkedin-popover-title',
        headingText: 'LinkedIn',
      },
      {
        popoverTarget: 'email-popover',
        actionLabel: 'Email',
        popoverId: 'email-popover',
        ariaLabelledBy: 'email-popover-title',
        headingId: 'email-popover-title',
        headingText: 'Email',
      },
    ])
  })

  it('uses safe external link attributes for every https anchor', () => {
    const externalLinks = readExternalHttpsLinks()

    expect(externalLinks.length).toBeGreaterThan(0)

    for (const { href, target, rel } of externalLinks) {
      expect(target, `Expected ${href} to open in a new tab`).toBe('_blank')
      expect(rel, `Expected ${href} to use noopener noreferrer`).toBe('noopener noreferrer')
    }
  })
})
