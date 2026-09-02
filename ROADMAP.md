# Roadmap

Draft for discussion, started 2026-09-02. Nothing here is settled until it is marked decided.
The point of this document is to build the editing side of the portfolio on purpose, after the
migration and the first copy round were built fast.

## What this is optimizing for

The content stays presentation-agnostic. A 3D version of the portfolio is a later phase and
reads the same files, so nothing in `content/` may describe 2D page geometry.

The repo is the source of truth and `git push` is the publish button. No hosting, no accounts,
no database beyond files in the repo. Deploy runs on every push to main.

Every change to copy, images, or layout is proposed, then approved, then applied. Alex approves.
Tools do the writing.

The tooling is scoped to this portfolio. It does not need to work for anyone else's site, and
it should not grow into a product.

Pages read alike. Same sections, same voice, and a comparable amount of copy for comparable
projects.

## Where things stand

Content is 43 project files and one page in `content/`, Markdown with front matter and
remark-style directives for figures, galleries, embeds, columns. Images are referenced by UUID
through `assets/manifest.json`; originals live in LFS, web-sized derivatives are committed under
`site/public/media`. The site is Vite and React, prerendered to static HTML, deployed to GitHub
Pages by `.github/workflows/deploy.yml`.

Copy round 1 is applied. All 89 suggestions were accepted, which settled lowercase titles with
acronyms kept, the concept / process / results section labels, sentence-case sub-headings, and
first person past tense throughout. The record is `review/decisions/2026-09-02.json`.

`unlisted: true` in a project's front matter keeps the page built at its URL with a noindex tag
but off the home and category grids. `photogrammetry-tests` uses it.

Rough edges, in the order they hurt:

- Adding a page is manual. Generate UUIDs, write manifest entries, run the image build, edit
  `taxonomy.json` in two places, then write the Markdown.
- Category membership lives twice, in each file's front matter and in `taxonomy.json`. The site
  reads `taxonomy.json`. The front matter is decoration.
- The review desk is a Claude artifact. The artifact sandbox blocks images from other hosts, so
  it cannot show a page's photos or the real rendering, and only a Claude session can read the
  decisions back. It was the fastest way to run one round. It is not a foundation.
- The word-level diff is unreadable when most of a paragraph changed.
- `tools/extract.py` regenerates `content/` from the Adobe export. Run again, it would overwrite
  the copy edits and the unlisted flags. Its job is done.

## What "a CMS" means here

Four options, from least to most built.

**The repo is the CMS.** Scripts make adding a page one command. Claude sessions do the copy and
layout passes through the existing proposal and decision files. There is no UI beyond the dev
server. This costs almost nothing and is worth doing regardless of what follows.

**A local desk.** A small app in this repo, run next to the dev server, that reads and writes the
content files on disk and renders previews with the site's own components. A pages list with
hidden toggles and ordering, media import, a review view, and a publish button that commits and
pushes. It runs on localhost, so there is no hosting and no login. This is the recommended build.

**A hosted git-backed CMS** such as Decap, Keystatic, or Pages CMS. Editing from any device, but
their content models expect plain Markdown or their own block formats. The directive syntax, the
UUID manifest, and the derivative pipeline would all have to bend to fit, and GitHub login needs
a server or a vendor. It is the Squarespace rebuild arriving by another road. Revisit only if
editing from a phone becomes a real need rather than a nice idea.

**Grow the artifact desk into an editor.** Works from anywhere, but it cannot show images or the
real page, and every write goes through a Claude conversation. Keep it at most as an optional
text-only review channel for when Alex is away from a computer.

Recommendation: do the first now and build the second deliberately. Retire the artifact desk
once the local desk has a review view.

## Adding a page

The two pages waiting, OS26 Viewer and LED Panel studio, are the test of this workflow. They are
new writing rather than edits, so they also test whether the house style holds for fresh copy.

Proposed flow:

1. Alex drops a folder in `drafts/<slug>/` with a `notes.md` brain dump, photos, video, links.
2. One command imports the folder. It assigns UUIDs, writes manifest entries, generates
   derivatives, creates alt-text placeholders, and writes a front-matter stub with the section
   headings for the page's shape.
3. Claude drafts the page from the notes in the house style, and proposes the cover, image order,
   and any gallery culls. This goes through review like any other change.
4. Alex previews in the dev server and publishes with a push.

What a new page needs from Alex: the notes, the media, the year, the category, and whether it
is a project or a feature (see shapes below).

Content-model cleanup that should land before the new pages, all small:

- Front matter becomes the only place categories live. The build derives the category lists.
  To decide.
- `project_order` stays in `taxonomy.json` for now. A 3D layout may replace it with something
  spatial, so it is not worth redesigning yet. To decide.
- A separate `draft` flag is probably unnecessary. `unlisted` already means "built but not shown",
  which is what a draft needs. To decide.
- Whether a page's shape is an explicit front-matter field or implied by its structure. Explicit
  lets the desk show a copy budget per page. To decide.

## Pages that read alike

Word counts today run from 15 (css-zen-garden) to 2,636 (fishcity-devlog). Twelve pages are
under 100 words and six are over 500. The two newest pages, openai-case at 73 words and
bww-goggles at 91, are among the short ones, so this is not only about old work.

Proposed shapes, with budgets to tune:

- **project.** 150 to 400 words in concept / process / results, five to fifteen images, one
  cover. Most pages.
- **feature.** Up to about 1,000 words, sub-headings allowed. atlas-virtual-graduation,
  severance-vr, glowforge-3d-demo, fishcityco.
- **collection.** Several small things on one page, each with a sub-heading, two to four
  sentences, and one to three images. For experiments and school work. photogrammetry-tests is
  nearly this already.
- **journal.** fishcity-devlog is the only one. Keep it, link it from fishcityco, and consider
  unlisting it from the grid so the devlog is something you find from the project rather than
  next to it.

Consolidation, proposed groupings. Group by medium rather than by era, because the nav is by
medium and a collection page should sit in exactly one category.

- web experiments, 2017 to 2019: css-zen-garden, page-crunch, sand-clock.
- design studies: ui-ux-for-openly, expressive-booklet.
- 3D printing experiments: msla-printed-wax-stamps, camera-viewfinder, possibly mavic-pro-leg.
  photogrammetry-tests stays its own collection or joins this one.
- music-video-wout-music-lematires-closer stands alone, joins design studies, or stays unlisted.

Retired URLs get redirect pages through `taxonomy.redirects`, which already exists. The old files
are deleted once merged; history keeps them.

Sequence: unlist the candidates now, one line each and reversible. Combine later, through
review, because choosing which images survive a merge is exactly the kind of decision the
review view should show properly.

Still open from round 1: whether the about page (23 words) gets a fuller bio, and a captions
pass (about 30 percent of images have one, unevenly).

## The desk

Version 1 is a place to see the whole site at once and change the things that are annoying to
change by hand.

- A pages list showing order, shape, word count against budget, whether a cover is set, and the
  hidden toggle.
- Page preview rendered with the site's own components, so what the desk shows is what ships.
- Media import for the drafts flow above, plus alt text and a list of unused assets.
- Publish. Git status, a commit message, push, and a link to the deploy run.

Version 2 is the review view, replacing the artifact desk.

- Three ways to show a text suggestion, picked by how much changed. Under roughly a third of the
  words, inline word diff. Above that, the paragraph before and after, stacked on narrow screens
  and side by side on wide ones, with the inline diff one click away.
- A whole-page split. Current page on one side, proposed page on the other, scrolled together,
  real rendering with real images.
- Suggestion kinds beyond text. Cull a gallery, reorder blocks, set a cover, write a caption,
  merge two pages, split one. Each with a one-line reason.
- The style guide first, and a way to reject a rule instead of fifty cards.

Non-goals: hosting, accounts, more than one user, a theme editor, drag-and-drop layout, comment
threads.

Tech sketch: a `desk/` package in this repo. Either Vite dev-server middleware or a small Node
server for reads and writes. All writes go through one content library that parses blocks,
transforms them, and serializes them back, shared with `build-content.mjs` and `apply.mjs` so
there is one parser. Preview imports the site's components. The production build never includes
any of it.

The contract that stays constant across all of this: Claude writes proposals, Alex writes
decisions, a tool applies them to `content/`. The screen that shows the proposals is what
changes.

## Same repo or separate, public or private

Recommendation: same repo, in `desk/`, public.

Same repo because the desk imports the site's components for previews and is coupled to this
schema on purpose. Keeping it here is what stops it becoming a product.

Public because the desk runs on localhost, holds no secrets, and edits content that is already
public. Its code being visible costs nothing. GitHub Pages on a private repo also needs a paid
plan, so public is the cheap option as well.

What would change the answer: the desk needing hosted login or API keys (then a private repo or
a separate one), or it growing into something for other people (then split it out with history).
Neither is planned.

## Sequence

- Phase 0, now. Decide the items below. Unlist the five candidates.
- Phase 1, page workflow. Content library, categories from front matter, the import command, the
  drafts intake. Then OS26 Viewer and LED Panel studio through it.
- Phase 2, desk v1.
- Phase 3, review v2 inside the desk. Retire the artifact desk.
- Phase 4, consolidation round with redirects, the captions pass, the about page.
- Phase 5, the 3D portfolio, reading the same content.

## Decisions needed

1. Same repo, public, `desk/` package. Recommended yes.
2. Categories move to front matter only. Recommended yes.
3. Shape as an explicit front-matter field. Recommended yes, so budgets are visible.
4. Unlist the five candidates now. Recommended yes.
5. The groupings for collections, and whether fishcity-devlog leaves the grid.
6. Budgets per shape. The numbers above are starting points.
7. Whether the artifact desk stays as a text-only channel or is retired outright.
8. The about page and the captions pass, when.

## Not doing

Rebuilding Squarespace or Adobe Portfolio. Hosting an editor. Login of any kind. Making the
desk work for anyone else's site.
