---
title: "fishcity.co"
slug: fishcityco
year: 2020
categories: [web-dev, graphic-design]
cover: ba80df2b-9445-4ae3-8f3c-3e2a339a304f
source: adobe-portfolio
---

::figure{asset="c6878fcb-153e-4f3a-9d58-712c79126716"}

## CONCEPT

I'm not the only one frustrated with the state of higher education and lackluster online alternatives. In thinking about a solution to the issues there I came up with the idea for fishcity. The idea is to build an online education platform built around the idea of connection and navigation of existing content. Typical the online education business model centers around the creation of exclusive content. Locked behind a paywall, the website supports itself with paid memberships. I believe this model is flawed and leads to the creation of redundant and restricted content.

In thinking how to create a visualization for sometimes disparate, sometimes related content I landed on the city as a way to organize the assembled content. The goal with the 3D visualization is to get some of the same benefits of a "mind palace", by linking information to definite locations. Additionally, neighborhoods form around common traits but that doesn't mean those traits don't exist in other parts of the city as well. That's important for conveying the interconnections of content, but also that physical distance isn't an exclusive indicator of relation.

fishcity’s users aggregate links to educational content from across the web and the platform serves as a tool for navigating that content. Resources are structured as a city, similar subjects forming neighborhoods.

I've had the idea for a while, but worked on developing an MVP for around 3 months as a senior capstone project. I made the city visualization, and the backend enough for users to submit links and have them begin to populate the map. In the future users will be able to navigate the paths through the “city” or browse, documenting their learning with projects along the way.

Currently in the process of cleaning up the code and experimenting with the UI/UX around navigating the visualization.

( This process is kind of a TLDR, more complete [process blog here](/fishcity-devlog) )

Because there wasn't really a platform to test out the user experience of navigating non-location content through a a city visualization, I spent most of capstone creating that. I wanted the city to develop procedurally, but had no experience creating something like that before. Much of the first month was spent creating a [Seeded Voronoi-Based Object Oriented Bounding Box Subdivision](https://codesandbox.io/s/dark-tree-l7eeu) process to create building plots.

:::gallery
  ::item{asset="f5bb4605-a119-4a32-96f4-2c3b946dfc18"}
  ::item{asset="ad322ea2-efe3-43fb-b218-c02cb6f868bf"}
  ::item{asset="7783c08e-614d-48ea-9ca6-78eed6c61e7a"}
  ::item{asset="c9765d74-c277-4ea8-92d7-d391bd3ca2c3"}
  ::item{asset="8dc01c2a-9695-49f2-91ed-fc4ef7da14c4"}
  ::item{asset="024933ed-bd1e-4ea1-9c28-d3fbe4db568a"}
  ::item{asset="c14ec0a0-3eed-4b57-b494-016593fb33b2"}
:::

[Applied on a larger scale](https://codesandbox.io/s/d3-delunay-plotified-yntqr?file=/src/mapGen.js), it spits out a few thousand building plots in a fairly organic layout.

::figure{asset="012987b8-46c4-4efc-b245-d87d1145b4a2"}

In the future, I want the city to be able to expand procedurally as well. For the MVP though, I decided creating the underlying map ahead of time would work to prove the idea. From there, I transferred all the plot information to Google Firebase, my backend system of choice.

I spent a long time laying out the structure of the data in Cloud Firestore. It wasn't a process I'm familiar with, and involved watching and rewatching the guides to Firestore that Google has on Youtube. Eventually I had it all settled and was able to hook everything together.

## RESULTS

The final product allows users to sign in, add and browse links. When a link is added, tags are used to place it in the city in a relevant neighborhood.

::figure{asset="47732756-2eb7-44a1-ad10-2e81d20097f1"}

With the buildings for resources working, I spent the last couple of weeks experimenting with different ways to visualize paths through content. I wasn't able to get paths into the MVP before the end of the class, but have been toying with possible UI's for paths.

::figure{asset="967c3f61-c0af-4a7b-8b56-641f91d98814"}

## EXTENSIONS

I'm continuing to work on this project. Overall, the whole process was a little more rushed than I'd have liked. I learned a lot through the process, and I'm thinking about starting over using what I've learned.

Paths are a high priority, without them the MVP doesn't really reach what I'd imagined the minimum features I'd expected.
