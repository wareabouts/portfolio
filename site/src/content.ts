import raw from './generated/content.json'
import mediaRaw from './generated/media.json'
import type { Content, Doc, Media, Asset } from './types'

const content = raw as unknown as Content
const media = mediaRaw as unknown as Record<string, Media>

export const { projects, pages, taxonomy, assets } = content

/** What the public grids show. `projects` keeps unlisted work so direct links still resolve. */
export const listedProjects = projects.filter((p) => !p.unlisted)

export const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')

export const projectBySlug = new Map(projects.map((p) => [p.slug, p]))
export const pageBySlug = new Map(pages.map((p) => [p.slug, p]))

export function categoryProjects(slug: string): Doc[] {
  const members = new Set(taxonomy.categories[slug] ?? [])
  return listedProjects.filter((p) => members.has(p.slug))
}

export function categoryLabel(slug: string): string | undefined {
  return taxonomy.nav.find((n) => n.slug === slug)?.label
}

export function asset(id: string): Asset | undefined {
  return assets[id]
}

/** Absolute URL for a derivative, respecting the deploy base path. */
function url(file: string) {
  return `${BASE}/media/${file}`
}

export interface ImgSrc {
  src: string
  srcSet?: string
  width?: number
  height?: number
}

/**
 * Build a srcset from the widths that were actually generated. Animated assets have a
 * single rendition (or a copied-through original when WebP conversion failed).
 */
export function imageSrc(id: string, sizesHint?: string): ImgSrc & { sizes?: string } {
  const m = media[id]
  const a = assets[id]
  if (!m) return { src: url(`${id}.${a?.ext ?? 'jpg'}`) }

  if (m.animated) {
    return { src: url(m.fallback ?? `${id}.webp`), width: m.w, height: m.h }
  }
  const widths = m.widths ?? []
  if (!widths.length) return { src: url(`${id}-800.webp`), width: m.w, height: m.h }

  const largest = widths[widths.length - 1]
  return {
    src: url(`${id}-${largest}.webp`),
    srcSet: widths.map((w) => `${url(`${id}-${w}.webp`)} ${Math.min(w, m.w)}w`).join(', '),
    sizes: sizesHint,
    width: m.w,
    height: m.h,
  }
}

/**
 * Square cover crop for the project grid.
 *
 * Always a static poster: 43 animated covers on one page cost several megabytes.
 * `animSrc` is the animated rendition the grid swaps in on hover.
 */
export function coverSrc(id: string): ImgSrc & { animSrc?: string } {
  const m = media[id]
  if (m?.fallback) return { src: url(m.fallback) }
  return {
    src: url(`${id}-cover.webp`),
    width: 600,
    height: 600,
    ...(m?.hasAnimCover ? { animSrc: url(`${id}-cover-anim.webp`) } : {}),
  }
}

export function aspect(id: string): number {
  const m = media[id]
  if (m?.w && m?.h) return m.w / m.h
  const a = assets[id]
  if (a?.w && a?.h) return a.w / a.h
  return 1
}

export function videoSrc(file: string) {
  return `${BASE}/video/${file}`
}
