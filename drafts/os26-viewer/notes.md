# OS26 viewer (working title)

Answer in any order, in fragments or paragraphs, as much or as little as you want. Delete
questions that do not apply. Everything here is raw material, not copy.

## The basics

- Year: 2026 (scaffolded June 17, launched with auth July 5, in daily team use through
  install week in mid-July; built for Open Sauce 2026)
- Category: web-dev (leans 3d-design too; it's a browser 3D tool, pick whichever the
  grid needs)
- Shape: project
- Links: repo https://github.com/wareabouts/os26-viewer · live at
  https://os26-viewer.web.app (Google sign-in gated; outside accounts land as
  "pending" until approved, so screenshots/video need an editor account)
- Video: none yet. A screen capture of fly mode over SMCEC with the install dots on
  would carry the page.
- Credits: I built the tool solo, pair-programming heavily with Claude Code. The
  Sauce Signs team were the editors (placing signs, design review, ordering) and
  volunteers used the viewer role on phones during install. Sign art itself lives in
  the team's Figma file.

## What is it?

A browser-based 3D planner for event signage. You fly around a model of the real
venue, place every sign, pull the actual artwork from Figma onto the 3D models, and
the tool turns the plan into a priced order sheet and then a live install checklist
for volunteers walking the venue with their phones.

## What was the goal, and who was it for?

Open Sauce 2026 needed a few hundred signs planned, ordered, and installed across two
venues running simultaneously (the San Mateo County Event Center and a hotel). Before
this, that's spreadsheets, a Figma file, and pointing at things. The goal was one
tool that carries a sign from "should go about here" through design review, the
b2Sign purchase order, and a volunteer confirming it's physically up. Editors got the
full 3D planner; volunteers got a read-only viewer whose one write surface is the
install status dropdown.

## What did you actually do?

React Three Fiber + Firebase (Firestore, Realtime Database for presence, Storage,
Hosting). Figma is both the CAD source and the art source. The venue CAD page maps
1 Figma pixel to 1 foot, so barricade lines, fence runs, tents, and ~3000 chairs come
in from the same file the ops team already draws in, rendered as instanced meshes. A
small Figma plugin generates art frames on request from the placed signs.

The parts that took real design work:

- A sign bank of ~20 real b2Sign products with actual prices, including variable-size
  types priced per square foot with min charges and max-dimension validation.
- Order math that rolls up every layout across both venues: hardware is reused across
  days so you buy the peak day, prints are per-design peaks summed, owned inventory is
  subtracted once (subtracting it per venue double-counted it; that was a bug), and
  frame/print bundles get split when buying components separately is cheaper. Pure
  functions with a 28-test harness that runs before every deploy.
- A day-layout timeline over a persistent "Main" layer, so the base signage exists
  once and each event day only stores its own additions.
- Multiplayer: live presence avatars, click-to-teleport to a teammate, a shared laser
  pointer, persistent markup strokes, per-sign comment threads, chat. Two editors see
  each other's moves in about a second (per-sign Firestore docs, so concurrent edits
  can't clobber each other).
- The order sheet: grouped by product, per-line status workflow (design exported,
  ordered, art uploaded, picked up), print-ready art downloads straight from the
  Figma API, drift warnings when the plan changes after a line was already purchased,
  Pomona sales tax, CSV export.
- Install week, built mostly on-site while it was happening: status dots above every
  sign colored by install state with zone-colored rings, an always-visible install
  percentage, box select for bulk zone assignment, touch joystick and sprint controls
  so the viewer works one-thumbed on a phone.

The dead end worth telling: art export for the print order went PDF, then JPEG, then
back to PDF. Figma's PDF renders timed out on big designs and rasterized badly, so I
switched to JPEG at max render scale with automatic step-down retries, then hit
Figma's hard 32768px export ceiling, which means a 159-foot window cling physically
cannot leave Figma's API at 150 DPI. Built a warning flag for that, Alex fixed the
frames on the Figma side, went back to vector PDF, deleted the flag. Three tries and
the final code is the simplest of the three.

## What are you proudest of?

That it was load-bearing. The team placed and reviewed every sign in it, the actual
b2Sign order was placed off its order sheet, and volunteers checked signs off in it
while standing in the venue. The install-dot view over the whole site, green filling
in zone by zone, is the thirty-second demo.

Also the pipeline itself: one Figma file drives the venue geometry, the sign
artwork, and the purchase order. Nothing gets re-entered anywhere.

## What surprised you, or went wrong?

The team started using it for real data while it was maybe 60% built, which changed
how every feature after that had to be written. Every schema decision was live
surgery: renames became name-only writes so they couldn't clobber a teammate's
concurrent edit, deletes got verified-save-then-delete ordering so a sign could be
duplicated but never lost.

Bugs I remember: signs placed before the terrain model finished downloading snapped
to a flat fallback plane and ended up underground (the real terrain spans 23 feet of
elevation); fixed with a version signal that re-snaps everything when the terrain
arrives. And mobile fly/walk stuttered while orbit was fine, because the on-screen
joystick knob was React state updated on every pointermove, up to 120 Hz of
re-renders fighting the WebGL loop. Made it imperative, one-line diagnosis in
hindsight, took a real hunt.

Figma's API kept surprising me: render timeouts, the 32768px cap, and no way to ask
for JPEG quality at all.

## What would you do differently?

Start with per-sign Firestore docs from day one instead of migrating to them; the
embedded-array era caused most of the concurrency scares. Build the volunteer
work-list view (a checklist grouped by zone, sorted by what's left) before install
week instead of sketching it after. And undo across layouts never happened, so
cross-layout moves are one-way; that's the sharpest remaining edge.

## Notes on the media

- The hero, the image or clip that should be the cover: the 3D venue from fly mode
  with the install-status dot layer on, colored dots with zone rings floating over
  every sign. A short clip of box-selecting a cluster of signs and assigning a zone
  would also work.
- Anything that must be in, or must stay out: real sign art and the venue model are
  fine to show. Keep teammate names/emails out of shots (presence avatars, "set by"
  labels, comments). The Figma token settings panel stays out.
- Captions you already know: "Every chair, fence, and barricade comes from the same
  Figma page the ops team draws in, 1px = 1ft." · "The order sheet that placed the
  actual b2Sign order, with per-line status tracking." · "Install week: volunteers
  check off signs from their phones; dots go green zone by zone." · "A shared laser
  pointer and persistent markup, because the team kept pointing at things."
- Anything that needs context to make sense: the timeline rail at the bottom is day
  layouts over a persistent base layer, worth a sentence wherever it appears. The
  colored dot rings read as decoration until you say "ring = zone, fill = status."
