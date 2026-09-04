---
title: "OS26 viewer"
slug: os26-viewer
cover: b352e2cd-b2db-419d-b461-3182b5f2228b
year: 2026
categories: [web-dev, 3d-design]
shape: project
---

Open Sauce 2026 had a few hundred signs to plan, order, and install across two venues at the same time. The tools for that were a spreadsheet, a Figma file, and a lot of pointing at things... so I built a 3D planner for it.

You fly around a model of the real venue, drop signs where they go, pull the real artwork onto them from Figma, and the same plan turns into the purchase order and then the checklist volunteers used on their phones during install.

::figure{asset="bd6ebdd1-cfbf-4a95-909f-a2a536870abe" caption="The San Mateo County Event Center in fly mode. Every building, tree, fence and chair comes straight from the ops team's Figma page, one pixel to one foot. The rail at the bottom flips between event days."}

## concept

One place for a sign to live, from "somewhere around here" to reviewed, ordered, and confirmed up. Editors got the full planner. Volunteers got a stripped-down viewer with exactly one control: is this sign up yet?

I built it solo over about a month, pair programming with Claude Code, and the team was placing real signs in it well before it was finished.

## process

React Three Fiber and Firebase. Figma pulled double duty as the CAD file AND the art source: the venue page is drawn at one pixel to one foot, so the barricades, fences, tents, and ~3000 chairs all came in from the file the ops team was already using.

The order math was the hard part. Hardware gets reused across days, so you buy for the busiest day. Prints count per design. Signs we already owned get subtracted once across both venues, not once per venue. All pure functions, with 28 tests that run before every deploy.

::figure{asset="f27da898-9390-49d1-9d12-a6a988c2c768" caption="The install layer on. Every sign gets a dot: the fill is its install status, the ring is its zone. On the right, the order sheet the real b2Sign order was placed from."}

Because the team was in it every day, edits are written so nobody can clobber a teammate's work: renames only touch the name field, and deletes save before they remove. The print export went PDF, then JPEG, then back to PDF after I learned Figma tops out at 32,768 pixels... a 159 foot window cling just can't come out of the API at print size.

Install week got its own features, written mostly on site: a dot over every sign colored by status with a ring for its zone, box select for assigning zones in bulk, and a touch joystick so it all works one-thumbed on a phone.

:::gallery
  ::item{asset="143f03e8-a18d-413d-b2bf-ed882b82dc48" caption="One sign selected: zone, position, product, the Figma frame it pulls art from, install status, and design approval."}
  ::item{asset="eb53e701-0dee-4519-8c3e-1e77f09ecaae" caption="The volunteer view on a phone. A joystick, a sprint button, and one control: is this sign up yet?"}
:::

## results

Every sign at the event went through it. The real b2Sign order came straight off the order sheet, and volunteers checked signs off while walking the venue. The rollout was fairly smooth. The problems that did come up were on site, working with volunteers and sorting out mounting issues we hadn't expected.

Next time? One Firestore doc per sign from day one, and the volunteer checklist built BEFORE install week instead of during. The [code is on GitHub](https://github.com/wareabouts/os26-viewer).
