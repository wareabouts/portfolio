# Drafts

The pile for a page that does not exist yet. One folder per page, named by the slug the page
will have.

    drafts/open-sauce-intros/
      notes.md      your answers to the questions in _template/notes.md
      media/        photos, video, screenshots, exports, in any state

Copy `_template` to start one. Only Markdown under `drafts/` is committed; git ignores every
other file here, so drop anything into `media/` without thinking about size. The import step
turns what the page uses into web-sized derivatives, and those are what get committed. Keep
the sources wherever you keep sources.

What happens after the pile is filled is in ROADMAP.md under "Adding a page". The short
version: the import command turns the media into assets, Claude drafts the page as unlisted,
you look at it rendered and say what to move, then the unlisted line comes off and it ships.

## Waiting now

    drafts/open-sauce-intros/     category decided: animations
    drafts/os26-viewer/
    drafts/led-panel-studio/

Each has a `notes.md` started and an empty `media/`.

## The synced folder

Photos live in Google Drive, not in the repo:

    G:\My Drive\Projects\1 - Portfolio\Live Site Assets\Live Pages\<slug>\media\

The import finds it through `drafts/.media-root`, a one-line file holding that path. The
file is per machine and ignored by git, so write it once on each computer (the drive letter
may differ). `drafts/<slug>/media/` still works and wins when it holds any image.

A file whose name starts with `_` is skipped. That is how an untouched source sits next to
an edited copy, for example a screenshot with a name blurred out.

## Pull before you import

If the same folder was already imported on another machine and pushed, pull first. The second
import then reuses those ids and does nothing twice. Importing first and merging later can
leave git holding two versions of the same derivative with no way to choose, which is how a
screenshot briefly went live unblurred on 2026-09-03.

## Working from the laptop

Clone without the archive originals. git-lfs is optional for this; without it the pointers
just stay pointers, and nothing here needs the originals.

    GIT_LFS_SKIP_SMUDGE=1 git clone https://github.com/wareabouts/portfolio.git

Fill in `notes.md`, drop files into `media/`, commit, push. The notes travel with git. The
media stays on the machine you put it on, so the import runs there too. Once per machine:

    npm --prefix site ci

Then, per page:

    npm --prefix site run import -- <slug>
    npm --prefix site run import -- <slug> --cover IMG_0042.jpg

The second form picks the cover; otherwise it is a file named `cover.*`, or the first image
by name. The import gives every photo an id, builds the web-sized WebP set, writes `media.md`
next to the notes (file name to id, this one travels with git), and sets the page's cover if
the page exists and has none. It ends by printing the `git add` line for what it produced;
commit that and push. Re-running is safe, photos are matched by content. Files it cannot
read, HEIC straight from a phone and video, are listed at the bottom of `media.md`; export
those as JPG first.
