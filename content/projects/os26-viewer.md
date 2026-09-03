---
title: "OS26 viewer"
slug: os26-viewer
year: 2026
categories: [web-dev, 3d-design]
shape: project
unlisted: true
---

A browser-based 3D planner for event signage. You fly around a model of the real venue, place every sign, pull the actual artwork from Figma onto the 3D models, and the tool turns the plan into a priced order sheet and then a live install checklist for volunteers walking the venue with their phones. I built it for Open Sauce 2026, solo, pair-programming heavily with Claude Code.

## concept

Open Sauce 2026 needed a few hundred signs planned, ordered, and installed across two venues running at the same time, the San Mateo County Event Center and a hotel. Before this, that meant spreadsheets, a Figma file, and pointing at things. I wanted one tool that carried a sign from "should go about here" through design review, the b2Sign purchase order, and a volunteer confirming it was physically up. Editors got the full 3D planner. Volunteers got a read-only viewer whose one control is the install status dropdown.

## process

React Three Fiber and Firebase, with Figma as both the CAD source and the art source. The venue page in Figma maps one pixel to one foot, so barricade lines, fence runs, tents, and about 3,000 chairs come in from the same file the ops team already draws in, rendered as instanced meshes. A small Figma plugin generates art frames on request from the placed signs. A day-layout timeline sits over a persistent base layer, so the base signage exists once and each event day stores only its own additions. Two editors see each other's moves in about a second, with presence avatars, a shared laser pointer, persistent markup, and per-sign comment threads.

The order math took the most design. Hardware is reused across days, so you buy the peak day. Prints are per-design peaks, summed. Owned inventory is subtracted once (subtracting it per venue double-counted it, which was a bug). Frame and print bundles split when buying the parts separately is cheaper. All of it is pure functions with a 28-test harness that runs before every deploy.

The team started using it for real data when it was maybe 60% built, and every schema decision after that was live surgery. Renames became name-only writes so they could not clobber a teammate's concurrent edit. Deletes got a verified-save-then-delete order, so a sign could be duplicated but never lost. The art export for the print order went PDF, then JPEG, then back to PDF, after Figma's 32,768-pixel export ceiling turned out to mean a 159-foot window cling cannot leave Figma's API at 150 DPI. The final code is the simplest of the three tries.

Install week was built mostly on site while it was happening: status dots above every sign, colored by install state with a zone-colored ring, an always-visible install percentage, box select for bulk zone assignment, and a touch joystick so the viewer works one-thumbed on a phone.

## results

It was load-bearing. The team placed and reviewed every sign in it, the actual b2Sign order was placed off its order sheet, and volunteers checked signs off in it while standing in the venue. One Figma file drives the venue geometry, the sign artwork, and the purchase order, and nothing gets re-entered anywhere. The thirty-second demo is the install-dot view over the whole site, green filling in zone by zone.

Next time I would start with per-sign Firestore documents from day one instead of migrating to them, and build the volunteer work list before install week instead of sketching it after. The [code is on GitHub](https://github.com/wareabouts/os26-viewer).
