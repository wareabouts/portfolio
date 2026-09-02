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

## Working from the laptop

Clone without the archive originals. git-lfs is optional for this; without it the pointers
just stay pointers, and nothing here needs the originals.

    GIT_LFS_SKIP_SMUDGE=1 git clone https://github.com/wareabouts/portfolio.git

Fill in `notes.md`, drop files into `media/`, commit, push. The notes travel with git. The
media stays on the machine you put it on, so the import step runs there too, from a Claude
Code session in that clone, or copy the `media/` folder across first.
