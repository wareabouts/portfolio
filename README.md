# alexfiel.com — content archive

Everything from the Adobe Portfolio site at alexfiel.com, extracted into a
presentation-agnostic form so it can drive a React rebuild now and an interactive 3D
portfolio later, from the same source of truth.

**Nothing here points at Adobe.** Once you've confirmed the archive looks right, the
subscription can lapse without losing anything.

## What's here

| | |
|---|---|
| `content/projects/*.md` | 42 project pages |
| `content/pages/*.md` | the `about` page |
| `content/taxonomy.json` | nav order, project order, category membership |
| `assets/originals/` | 494 images, 693 MB — best resolution Adobe holds |
| `assets/video/` | 6 videos rescued off Adobe's player, 39 MB |
| `assets/manifest.json` | every asset: dimensions, sha256, provenance, where it's used |
| `raw/` | the 52 original HTML pages, kept so extraction can be re-run |
| `tools/` | the extraction pipeline |

## The content format

Prose is plain Markdown. Anything that isn't prose is a
[remark directive](https://github.com/remarkjs/remark-directive) — readable as text,
parseable without MDX, and free of any 2D page geometry.

```markdown
---
title: "measuring time"
slug: measuring-time
year: 2019
categories: [microcontrollers, instalation]
cover: 5d26ef59-993b-4374-8145-5551a0202bde
source: adobe-portfolio
---

::figure{asset="325362b2-..." caption="optional"}

## concept

Normal Markdown prose, **bold**, [links](https://example.com), lists.

:::gallery
  ::item{asset="2c47571d-..." caption="MDF prototype."}
  ::item{asset="867d730b-..."}
:::

::embed{provider="youtube" id="AUg_AEI5vwU"}
::video{src="atlas-virtual-graduation.mp4" source="adobe-ccv:TdnBcMxRy6B"}
::button{href="https://..." label="VISIT THE MAP"}
::form{fields="Name *, Email Address *, Message *"}

::::columns
:::column
...
:::
:::column
...
:::
::::
```

Block types: `figure`, `gallery`/`item`, `embed`, `video`, `button`, `form`, `columns`.

### Two rules worth keeping

**Images are referenced by UUID, never by path or URL.** Resolve them through
`assets/manifest.json`. That indirection is what lets you re-encode to WebP/AVIF, generate
thumbnails, or swap in higher-resolution scans later without touching a single content file.

**Blocks say what something *is*, not where it goes.** A `:::columns` block records that two
things belong side by side, not that the left one is 31% wide with 51px of top padding. The
renderer decides layout. This is what makes the same Markdown usable by a 3D portfolio that
has no concept of a column.

## Regenerating

```bash
python tools/extract.py && python tools/validate.py
```

Safe to re-run. `extract.py` rewrites content from `raw/` and preserves download metadata in
the manifest; `download_assets.py` skips files already on disk.

## What was normalized away

Adobe's editor changed markup over the years, so the pages drifted. These differences were
dropped rather than preserved, so one global stylesheet can serve every page:

- Per-module `padding-top`/`padding-bottom`, percentage widths, and `float` directions.
- Injected `<span style="font-family:dvkf;...">` wrappers around body copy.
- Non-breaking and zero-width spaces scattered through the text.
- **Two different body markups.** 23 of 52 pages wrapped body copy in `.main-text`; the rest
  used a bare `<div>`, and some used `.main-text` *followed by* more content divs. All three
  now extract identically.

Image captions (`h6` in the original) are preserved — they're content, not formatting.

## Fidelity notes

- **74 images are true originals** (up to 8333×8333), pulled from the lightbox URLs, which
  Adobe serves uncropped. The other 420 come down at the largest size Adobe published —
  usually 3840px.
- Adobe signs every size variant with a `?h=` hash, so arbitrary sizes can't be requested.
  Verified: no asset on disk is smaller than the size the page declared for it.
- 157 assets are under 600px because the originals genuinely are (mostly animated GIF covers
  and small PNG props). Adobe doesn't upscale.
- **The 6 rescued videos are the one real quality compromise.** Adobe's best stored rendition
  was all that was available: two are 1280×720, the rest are full-res vertical (1080×1920).
  If you still have the source files, drop them in `assets/video/` — the filenames match.
  The other 17 videos on the site are YouTube/Vimeo embeds and were never at risk.

## Known content issues (not extraction bugs)

- The installation category page is at `/instalation` — missing an `l`. Worth fixing with a
  redirect in the rebuild.
- Site footer reads © 2024; the newest project is 2026.
- Three projects aren't in any category and so never appear on a category page:
  `openai-case`, `borzoi-vacuum`, `office-sign`. Add them to `content/taxonomy.json` if
  that's not intentional. (Every project does have a year and a cover.)

## Rebuild notes

Node isn't installed on this machine yet — you'll need it for the React/TypeScript site.

`content/taxonomy.json` holds the nav labels (with emoji), the home-page project order, and
category membership, so listing pages can be generated rather than hand-maintained. Project
covers carry their original crop in the manifest as `cover_crop` (e.g. `rwc:0x0x500x500x500`
= x, y, w, h, output width) if you want to reproduce Adobe's framing.
