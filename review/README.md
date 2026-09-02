# Copy desk

A suggest-edits review loop for the site's copy. Proposed changes are written here as
data, rendered into a review page with word-level diffs and Accept / Reject buttons, and
only what Alex accepts is written back into `content/`.

```
rewrites.mjs  ->  build.mjs  ->  proposals.json + dist/copy-desk.html  ->  published artifact
                                                                               |
content/*.md  <-  apply.mjs  <-  decisions/<date>.json  <-  read_db "decisions"  <-'
```

## Files

| | |
|---|---|
| `rewrites.mjs` | the suggestions: style guide, title map, heading fixes, typo fixes, structural fixes, prose rewrites |
| `build.mjs` | anchors every suggestion to an exact line in a content file and emits the page. Fails on a missing or ambiguous anchor. |
| `copy-desk.html` | the review page. `build.mjs` injects the proposals JSON at `/*__PROPOSALS__*/`. |
| `apply.mjs` | writes accepted suggestions into `content/`. Verifies every anchor first; writes nothing if any fail. |
| `decisions/` | what came back from each round, committed as the record of what was decided |
| `proposals.json`, `dist/` | generated; not committed |

## A round

1. Edit `rewrites.mjs`.
2. `node review/build.mjs` — prints the suggestion count by kind, or the anchors it could not resolve.
3. Publish `review/dist/copy-desk.html` as an artifact with `capabilities: {db: {}}`.
   Decisions save to the artifact's database as `decisions/<suggestion id>`.
4. Alex reviews. Keyboard: `j`/`k` move, `a` accept, `r` reject, `u` undo. A note can be
   saved with a decision or on its own.
5. Read the decisions back (`read_db`, collection `decisions`) and save them to
   `review/decisions/<date>.json`.
6. `node review/apply.mjs review/decisions/<date>.json`, then `npm --prefix site run build`,
   commit `content/`, push.
7. For anything rejected with a note: revise its entry in `rewrites.mjs` and go to 2. A
   revised suggestion gets a new id, so the old decision does not carry over to new wording;
   everything else keeps its decision.

## Where things stand (2026-09-02)

Round 1 is published at
https://claude.ai/code/artifact/ed7eabd5-a15e-4240-a438-b3532bb7706f (private to the
wareabouts account). 89 suggestions across 32 pages; nothing applied to `content/` yet. The
heading-rendering fix in `tools/extract.py` is already live and changed no words.

Next: Alex reviews, then read the decisions back (`read_db`, collection `decisions`) into
`review/decisions/<date>.json`, `node review/apply.mjs` that file, `npm --prefix site run
build`, commit `content/`, push. Then round 2: prose passes on the remaining pages under
whichever rules survived round 1.

Open questions for Alex: lowercase vs Title Case titles; whether the about page wants a
fuller bio; whether to do a captions pass.

### On a fresh machine

```bash
GIT_LFS_SKIP_SMUDGE=1 git clone https://github.com/wareabouts/portfolio.git
cd portfolio/site && npm ci && cd ..
node review/build.mjs     # regenerates proposals.json and dist/
node review/serve.mjs     # http://localhost:4180/copy-desk.html
```

`GIT_LFS_SKIP_SMUDGE=1` skips the 754 MB of archive originals; the site and the review loop
both work from the committed web-sized images. Needs git, git-lfs and Node 24. Python 3 is
only for `tools/` (re-extraction and validation).

## Anchoring

A suggestion's `old` is a whole line of the Markdown file (the extractor writes one
paragraph per line). Matching folds curly quotes to straight so anchors are forgiving to
type; the actual file line is what gets stored and later replaced, exactly. Typo fixes are
substrings with word boundaries, grouped so a paragraph with two typos is one suggestion.

If the database is unavailable to the viewer, the page keeps decisions in `localStorage`
and offers "Copy decisions as JSON"; `apply.mjs` accepts that shape too.
