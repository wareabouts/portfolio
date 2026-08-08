# alexfiel.com

The portfolio site, migrated off Adobe Portfolio: a version-controlled archive of
everything the old site held, plus a static React/TypeScript rebuild that renders from it.

**Nothing points at Adobe.** Once the rebuild looks right, the subscription can lapse
without losing anything.

## Layout

| | |
|---|---|
| `content/projects/*.md` | 43 project pages — the authoring surface |
| `content/pages/*.md` | the `about` page |
| `content/taxonomy.json` | nav order, project order, category membership, redirects |
| `assets/originals/` | 527 images, 754 MB, best resolution Adobe held (Git LFS) |
| `assets/video/` | 6 videos rescued off Adobe's player, 39 MB |
| `assets/manifest.json` | every asset: dimensions, sha256, provenance, where it's used |
| `raw/` | the 53 original HTML pages, so extraction can be re-run |
| `tools/` | extraction, validation, parity checking |
| `site/` | the Vite + React + TypeScript site |

## Editing the site

Edit a Markdown file in `content/`, then:

```bash
npm --prefix site run build
```

Push to `main` and GitHub Actions deploys to Pages.

For a live preview while editing:

```bash
npm --prefix site run dev
```

### The content format

Prose is plain Markdown — the best format for writing prose. Everything else is a
[remark-style directive](https://github.com/remarkjs/remark-directive): readable as text,
parseable without MDX, and carrying no 2D page geometry.

```markdown
---
title: "measuring time"
slug: measuring-time
year: 2019
categories: [microcontrollers, installation]
cover: 5d26ef59-993b-4374-8145-5551a0202bde
---

::figure{asset="325362b2-..." caption="optional"}

## concept

Normal Markdown prose, **bold**, [links](https://example.com), lists.

:::gallery
  ::item{asset="2c47571d-..." caption="MDF prototype."}
:::

::embed{provider="youtube" id="AUg_AEI5vwU"}
::video{src="atlas-virtual-graduation.mp4"}
::button{href="https://..." label="VISIT THE MAP"}

::::columns
:::column
...
:::
::::
```

Block types: `figure`, `gallery`/`item`, `embed`, `video`, `button`, `form`, `columns`,
`## heading` (section), `### heading` (sub-section).

The build compiles this to typed JSON (`site/src/generated/content.json`) — **the app
never parses Markdown at runtime.** You get comfortable authoring and type safety.

### Two rules worth keeping

**Images are referenced by UUID, never by path.** Resolved through `assets/manifest.json`.
That indirection is what lets the build re-encode to WebP, generate thumbnails, and swap
in higher-resolution scans later without touching a content file.

**Blocks say what something *is*, not where it goes.** `:::columns` records that two
things belong together, not that the left one is 31% wide with 51px of padding. That's
what makes the same Markdown usable by a 3D portfolio that has no concept of a column.

## How the build works

```
content/*.md ──> build-content.mjs ──> content.json (typed)
assets/originals ──> build-images.mjs ──> public/media (WebP, 3 widths + covers)
                                   └───> vite build ──> vite build --ssr ──> prerender
```

`prerender.mjs` renders all 52 routes to static HTML, so every page ships real markup for
search engines and link previews; the client hydrates it. Each route is written as both
`slug/index.html` and `slug.html` — static hosts disagree about which one an extensionless
URL resolves to.

Image derivatives are cached on disk, so repeat builds skip straight past them. Use
`node scripts/build-images.mjs --force` to regenerate.

### Deploying

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on push to `main`.

It checks out with `lfs: false` — the 754 MB archive isn't needed to build, because
`site/public/media/` (95 MB of web-sized WebP) is committed. That keeps LFS bandwidth at
zero for deploys. If the originals aren't present, `build-images.mjs` detects the LFS
pointers and rebuilds its manifest from the committed derivatives instead.

**Base path** is resolved automatically: `/<repo>/` for a project site, `/` once a
`site/public/CNAME` exists. So pointing alexfiel.com at Pages needs no code change — add
the CNAME file and redeploy.

## Verifying against the original

```bash
node tools/parity.mjs
```

Compares every rebuilt page against the original HTML in `raw/`: copy coverage, image
count, embed count. Currently **99.64% average copy coverage, with images and embeds
matching on all 44 pages**. The one gap is the `about` page's contact form (see below).

```bash
python tools/validate.py
```

Checks the extracted Markdown: balanced directives, no dangling asset references, no
dropped copy versus source.

## Deliberate differences from the original

- **Fonts.** The original set type in Gibson, licensed through Adobe Fonts — unusable once
  the subscription lapses. Source Sans 3 stands in: same humanist-sans family, self-hosted,
  OFL licensed. (The site also loaded Adelle, Proxima Nova and Acier BAT, none of which
  were actually used.)
- **Contact form.** The original posted to Adobe. The rebuild shows a mailto link instead.
  Set `VITE_CONTACT_ENDPOINT` to a form backend (Formspree, Basin, a Worker — anything
  that accepts a POST) and a real form renders in its place.
- **Animated covers.** 43 animated covers on the home page cost 5.3 MB. The grid now ships
  static posters and swaps in the animation on hover — 1.2 MB, same effect.
- **`/instalation` → `/installation`.** The original URL was missing an `l`. The old path
  redirects.
- **Footer year** tracks the current year instead of being frozen at 2024.
- **Categories added** for `openai-case`, `borzoi-vacuum` and `office-sign`, which were in
  none and so appeared on no category page.
- **`photogrammetry-tests` recovered** — it was reachable only from the 3d-design page,
  never linked from the home grid.

## Fidelity notes

- **76 images are true originals** (up to 8333×8333), pulled from lightbox URLs, which
  Adobe served uncropped. The other 451 come down at the largest size Adobe published,
  usually 3840px. Verified: no asset on disk is smaller than the size its page declared.
- 157 assets are under 600px because the originals genuinely are — mostly animated GIF
  covers and small PNG props. Adobe never upscales.
- **The 6 rescued videos are the one real quality compromise.** Adobe's best stored
  rendition was all that was available: two are 1280×720, the rest full-res vertical
  (1080×1920). If you find the source files, drop them into `assets/video/` — the
  filenames match the project slugs.
- The site serves images at up to 1600px (the content column is 806px, so that covers a 2x
  display). The originals stay in the archive.
