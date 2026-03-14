import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const indexHtml = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8')
let html = ''

function readWheelMarkup() {
  const declaredCount = Number.parseInt(
    html.match(/class="wheel"\s+style="--count:\s*(\d+)"/)?.[1] ?? '',
    10,
  )
  const indexes = Array.from(
    html.matchAll(/class="wheel-item"\s+style="--index:\s*(\d+)"/g),
    ([, index]) => Number.parseInt(index, 10),
  )

  return { declaredCount, indexes }
}

function readProjectLogoPairs() {
  const pairs = Array.from(
    html.matchAll(
      /<div class="logo"(?:[^>]*?)>[\s\S]*?<div class="tech-logo">\s*<img[^>]*src="([^"]+)"[^>]*>[\s\S]*?<div class="logo-avatar">\s*<img[^>]*src="([^"]+)"[^>]*>/g,
    ),
    ([, techLogoSrc, avatarLogoSrc]) => ({ techLogoSrc, avatarLogoSrc }),
  )

  return pairs
}

function readRecentWorksMarkup() {
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1] ?? ''
  const launchButton = html.match(
    /<button id="hintButton"[^>]*dialogtarget="([^"]+)"[^>]*aria-controls="([^"]+)"[^>]*aria-label="([^"]+)"/,
  )
  const projectIds = Array.from(
    html.matchAll(/<div class="project" id="([^"]+)" popover/g),
    ([, projectId]) => projectId,
  )
  const projectTriggers = Array.from(
    html.matchAll(
      /<div class="wheel-item"[\s\S]*?<button[^>]*popovertarget="([^"]+)"[^>]*aria-controls="([^"]+)"[^>]*aria-label="([^"]+)"/g,
    ),
    ([, popoverTarget, ariaControls, ariaLabel]) => ({
      popoverTarget,
      ariaControls,
      ariaLabel,
    }),
  )

  return {
    title,
    launchButton: launchButton
      ? {
          dialogTarget: launchButton[1],
          ariaControls: launchButton[2],
          ariaLabel: launchButton[3],
        }
      : null,
    projectIds,
    projectTriggers,
  }
}

function readProjectResponsiveImages() {
  return Array.from(
    html.matchAll(
      /<div class="project" id="([^"]+)"[\s\S]*?<div class="content">\s*<picture>([\s\S]*?)<\/picture>/g,
    ),
    ([, projectId, pictureHtml]) => {
      const sanitizedPictureHtml = pictureHtml.replace(/<!--[\s\S]*?-->/g, '')
      const sources = Array.from(
        sanitizedPictureHtml.matchAll(/<source srcset="([^"]+)" media="([^"]+)" \/>/g),
        ([, srcset, media]) => ({ media, srcset }),
      )
      const imgMatch = sanitizedPictureHtml.match(/<img src="([^"]+)" alt="([^"]+)"[^>]*>/)

      return {
        projectId,
        alt: imgMatch?.[2] ?? '',
        imgSrc: imgMatch?.[1] ?? '',
        sources,
      }
    },
  )
}

function readProjectRandomAttributes() {
  return Array.from(
    html.matchAll(/<div class="project" id="([^"]+)"[^>]*data-random="([^"]+)"[^>]*>/g),
    ([, projectId, dataRandom]) => ({
      projectId,
      dataRandom,
    }),
  )
}

describe('recent works markup', () => {
  beforeEach(() => {
    html = indexHtml
  })

  afterEach(() => {
    html = ''
    vi.restoreAllMocks()
  })

  it('defines the Recent Works entry point in static markup', () => {
    const { title, launchButton } = readRecentWorksMarkup()

    expect(title).toBe('Tun Lin Phyo')
    expect(launchButton).toEqual({
      dialogTarget: 'navigation',
      ariaControls: 'navigation',
      ariaLabel: 'Open recent works dialog',
    })
  })

  it('uses sequential wheel item indexes that match the declared count', () => {
    const { declaredCount, indexes } = readWheelMarkup()

    expect(Number.isInteger(declaredCount) && declaredCount > 0).toBe(true)
    expect(indexes).toHaveLength(declaredCount)
    expect(indexes).toEqual(Array.from({ length: declaredCount }, (_, index) => index + 1))
  })

  it('uses matching tech logo and popover logo images', () => {
    const pairs = readProjectLogoPairs()

    expect(pairs.length).toBeGreaterThan(0)

    for (const { techLogoSrc, avatarLogoSrc } of pairs) {
      expect(techLogoSrc).toBeTruthy()
      expect(avatarLogoSrc).toBe(techLogoSrc)
    }
  })

  it('keeps Recent Works project triggers aligned with project popovers', () => {
    const { projectIds, projectTriggers } = readRecentWorksMarkup()

    expect(projectIds.length).toBeGreaterThan(0)
    expect(projectTriggers).toHaveLength(projectIds.length)
    expect(projectTriggers.map(({ popoverTarget }) => popoverTarget)).toEqual(projectIds)
    expect(projectTriggers.map(({ ariaControls }) => ariaControls)).toEqual(projectIds)

    for (const { ariaLabel } of projectTriggers) {
      expect(ariaLabel).toMatch(/^Open .+ project(?: details)?$/)
    }
  })

  it('defines responsive picture sources for every project image', () => {
    const responsiveImages = readProjectResponsiveImages()
    const expectedMediaQueries = ['(min-width: 48rem)', '(max-width: 48rem)']
    const { projectIds } = readRecentWorksMarkup()

    expect(responsiveImages).toHaveLength(projectIds.length)

    for (const { projectId, alt, imgSrc, sources } of responsiveImages) {
      expect(alt).toBeTruthy()
      expect(sources).toHaveLength(2)
      expect(sources.map(({ media }) => media), `Unexpected media queries for ${projectId}`).toEqual(expectedMediaQueries)
      expect(sources.map(({ srcset }) => srcset)).toEqual(
        expect.arrayContaining([expect.stringMatching(/^\/projects\/.+/), expect.stringMatching(/^\/projects\/.+-sm\./)]),
      )
      expect(imgSrc, `Unexpected fallback image for ${projectId}`).toBe(sources[0].srcset)
    }
  })

  it('adds a data-random attribute to every project popover', () => {
    const projectRandomAttributes = readProjectRandomAttributes()
    const { projectIds } = readRecentWorksMarkup()

    expect(projectRandomAttributes).toHaveLength(projectIds.length)
    expect(projectRandomAttributes.map(({ projectId }) => projectId)).toEqual(projectIds)

    for (const { projectId, dataRandom } of projectRandomAttributes) {
      expect(dataRandom, `Missing data-random value for ${projectId}`).toBeTruthy()
    }
  })
})
