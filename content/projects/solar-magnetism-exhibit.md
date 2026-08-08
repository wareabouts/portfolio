---
title: "solar magnetism exhibit"
slug: solar-magnetism-exhibit
year: 2019
categories: [installation]
cover: d96ceaea-7735-4ecf-ba27-49b7cae9ab9d
source: adobe-portfolio
---

::figure{asset="77f3c796-ce8b-4295-943e-34e5680b6431" caption="Image by Viget Labs"}

## concept

During the semester of Spring '19, I had the opportunity to take the class "Designing a Science Exhibit". Fellow students and I quickly realized it wasn't like any other class we'd taken before. We were grouped and given a small portion of a grant Fiske Planetarium had received. Over the semester we were tasked with prototyping and evaluating an exhibit centered around solar magnetism. The following summer a few students, including myself, were hired to take what was learned in the class and produce a final exhibit.

The basis for the summer project was a prototype called the "Solar Arcade". At the time it consisted of a red felt walkway (the surface of the sun) under six 8-foot LED loops. There was a pressure pad where the loops could be activated to demonstrate coronal mass ejections. Taking that as a starting point, we decided to emphasize the Sun's shifting surface to illustrate how these dynamic motions create and influence coronal loops.

## process

The summer consisted of a couple weeks of prototyping, testing LED grids with different diffusion layers before settling on 1" thick HDPE to protect and support patrons walking on it. After that, we began planning and constructing five 2ft x 6ft panels that could be connected together to form a large LED screen. The panels use laser-cut MDF to evenly space addressable LED strips. A processing sketch written by another teammate is run on a Raspberry pi and displayed on the panels. Multiple Adafruit Fadecandy's instruct the LED strips how to function.

::::columns

:::column

:::gallery
  ::item{asset="6d7d2504-3c28-4c4e-a556-16b05443018a" caption="Pete's cat helping us test LED diffusion."}
  ::item{asset="baf66e1a-30ed-4c8f-a62e-6bddf7aad7dc" caption="Wiring the LED strips."}
  ::item{asset="6ac2d6e6-d9f8-40ee-a1f9-bc6eb3fec34b" caption="LED strips laid out in MDF channels."}
  ::item{asset="769a4200-707d-4207-9933-fc7c9f772240" caption="One panel illuminated to show a sun-spot."}
  ::item{asset="ce4173db-72b7-4c43-8502-3d8f699c34fc" caption="Prototype clamp to hold the HDPE on top of the floor panel."}
  ::item{asset="68e755b2-9e69-4ce8-8eab-b15dd284be6a" caption="Standing on a floor panel."}
  ::item{asset="f26eb812-8818-48b0-befb-215654c40c81" caption="Completed panels before installing under the loops."}
:::

:::

:::column

::video{src="solar-magnetism-exhibit.mp4" source="adobe-ccv:CiyFi5F63UE"}

:::

::::

After getting to that point, one of my main tasks for the later build was creating a way for the loops to securely attach to the panels, but still be removable. After going through many iterations, I decided on a bolted piece of CNC'd HDPE. (Process left to right)

:::gallery
  ::item{asset="a718b446-1063-4428-b42d-c38374871c15" caption="3D-Printed quick release latch."}
  ::item{asset="5613a65d-9481-46ef-aa5f-8cd52056d663" caption="3D-printed clamp latch."}
  ::item{asset="367f13fd-6849-4b92-b351-c1ebfe333b27" caption="Conduit holder."}
  ::item{asset="634b6bde-4a42-4f76-8bdf-58dce28cf3fc" caption="PVC with lynch pin."}
  ::item{asset="7c3de6e3-9224-42af-9bd7-3d817736e87e" caption="Wood-supported PVC with lynch pin."}
  ::item{asset="a5d72907-6ac3-4c8f-9c40-64b6cf5f6c80" caption="Angled wood block."}
  ::item{asset="bf0509e9-ee64-4f74-8e11-944fd63850fd" caption="Final CNC'd HDPE block."}
:::

## results

The exhibit is up in Fiske and designed to be easily disassembled and stored when they host large events. Each panel has a garage-door-style detector that tells the Raspberry Pi to spawn sunspots where the beam is broken. My partners in the project were [Anna Lynton](https://www.linkedin.com/in/anna-lynton-62a276179/), [Pete Pascente](https://www.linkedin.com/in/ppascente/), [Justin Trupiano](https://www.linkedin.com/in/justin-trupiano-a86153a8/), and [Juan Andrés Molina](https://www.linkedin.com/in/jamolinaesca/).
