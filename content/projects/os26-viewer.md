---
title: "OS26 viewer"
slug: os26-viewer
cover: f27da898-9390-49d1-9d12-a6a988c2c768
year: 2026
categories: [web-dev, 3d-design]
shape: project
---

A browser tool for planning event signage in 3D. I built it for Open Sauce 2026, where a few hundred signs had to be planned, ordered, and installed across two venues at once. You fly around a model of the real venue, place each sign, pull its artwork from Figma onto the model, and the same plan becomes the purchase order and then the checklist volunteers used on their phones during install.

::figure{asset="bd6ebdd1-cfbf-4a95-909f-a2a536870abe" caption="The San Mateo County Event Center in fly mode. Every building, tree, fence run and chair comes from the same Figma page the ops team draws in, one pixel to one foot. The rail at the bottom switches between event days, which all sit on one shared base layout."}

## concept

Before this, sign planning was a spreadsheet, a Figma file, and a lot of pointing at things. I wanted one place where a sign could go from "somewhere around here" to reviewed, ordered, and confirmed on the ground, without anyone re-entering it along the way. Editors got the full planner. Volunteers got a read-only viewer with one control, the install status of whatever sign they were standing in front of.

I built it solo over about a month, pair programming with Claude Code, and the team started using it for real while it was maybe 60% done.

## process

It runs on React Three Fiber and Firebase. Figma does double duty as the CAD file and the art source. The venue page there maps one pixel to one foot, so the barricades, fence runs, tents, and roughly 3,000 chairs all come from the file the ops team had already drawn, rendered as instanced meshes. A small Figma plugin makes an art frame for each placed sign, and the viewer pulls the finished artwork back down onto it.

The order math was the hard part. Hardware gets reused across days, so you buy for the busiest day. Prints are counted per design. Signs we already owned get subtracted once (subtracting them once per venue double counted them, which I found the hard way). Bundles get split when the parts are cheaper on their own. It is all pure functions, with 28 tests that run before every deploy.

::figure{asset="f27da898-9390-49d1-9d12-a6a988c2c768" caption="The install layer turned on. Every sign gets a dot: the fill is its install status, the ring is its zone. On the right, the order sheet the real b2Sign order was placed from."}

Because the team was in it every day, every change to the data model happened around live data. Renames only write the name field, so they cannot overwrite a teammate's edit. Deletes save first and remove second, so a sign can end up duplicated but never lost. The print export went from PDF to JPEG and back to PDF after I hit Figma's 32,768 pixel export limit, which meant a 159 foot window cling could not come out of the API at print resolution at all.

Install week got its own features, mostly written on site: a dot above every sign coloured by status with a ring for its zone, a running install percentage, box select for assigning zones in bulk, and a touch joystick so the viewer works one-handed on a phone.

:::gallery
  ::item{asset="143f03e8-a18d-413d-b2bf-ed882b82dc48" caption="One sign selected: zone, position, product, the Figma frame it pulls art from, install status, and design approval."}
  ::item{asset="eb53e701-0dee-4519-8c3e-1e77f09ecaae" caption="The volunteer view on a phone. A joystick, a sprint button, and one control: the install status of the sign in front of you."}
:::

## results

The team placed and reviewed every sign in it, the real b2Sign order came straight off its order sheet, and volunteers checked signs off in it while walking the venue. One Figma file ended up driving the venue model, the artwork, and the purchase order.

If I did it again I would start with one Firestore document per sign instead of migrating to that mid-project, and I would build the volunteer checklist before install week rather than sketching it during. The [code is on GitHub](https://github.com/wareabouts/os26-viewer).
