export type Block =
  | { type: 'heading'; text: string }
  | { type: 'prose'; html: string }
  /** `invert: 'dark'` marks line art drawn for a light ground — flipped in dark mode. */
  | { type: 'figure'; asset: string; caption?: string; invert?: string }
  | { type: 'gallery'; items: { asset: string; caption?: string; invert?: string }[] }
  | { type: 'embed'; provider: 'youtube' | 'vimeo'; id: string }
  | { type: 'embed'; provider: 'iframe'; src: string }
  | { type: 'video'; src: string }
  | { type: 'button'; href: string; label: string }
  | { type: 'form'; fields: string[] }
  | { type: 'columns'; columns: Block[][] }

export interface Doc {
  slug: string
  title: string
  year?: number
  categories?: string[]
  cover?: string
  blocks: Block[]
}

export interface Asset {
  ext: string
  w: number | null
  h: number | null
  animated: boolean
  alt?: string
}

/** What build-images.mjs actually emitted, so srcsets never point at a missing file. */
export interface Media {
  uuid: string
  animated: boolean
  w: number
  h: number
  widths?: number[]
  fallback?: string
  /** An animated square cover exists alongside the static poster. */
  hasAnimCover?: boolean
}

export interface Taxonomy {
  nav: { slug: string; label: string }[]
  project_order: string[]
  categories: Record<string, string[]>
  redirects: Record<string, string>
}

export interface Content {
  projects: Doc[]
  pages: Doc[]
  taxonomy: Taxonomy
  assets: Record<string, Asset>
}
