---
title: "delta RGB game"
slug: delta-rgb-game
year: 2019
categories: [microcontrollers]
cover: c1e5de02-4dd0-4aa5-b3f4-a787222e4bed
source: adobe-portfolio
---

::figure{asset="d6f77904-8a35-481a-b7ea-f4f7bee13fd0"}

## CONCEPT

Inspired by unique movements of Delta-style 3D-Printers, I wanted to use what I'd learned about potentiometers, 3D-Printing and addressable LED's to create an interactive game.

:::gallery
  ::item{asset="435cca5a-18b4-4300-ab22-4233aaa72db1" caption="Fusion model of the ball joint."}
  ::item{asset="b15b46ce-b3f5-4050-87f1-e49371ef241a" caption="Example of a Delta-style 3D-printer."}
  ::item{asset="88c86faa-2b91-4c47-81a6-9b7582325c14" caption="Ball joint caps for the potentiometers."}
  ::item{asset="9ece80d1-d3a4-4df2-a1b5-acbf7dd40e42" caption="Idea sketches."}
  ::item{asset="6f9722a7-b9c0-495f-9a85-7f6699814710" caption="Wiring diagram."}
:::

## PROCESS

The housing was made with laser cut MDF panels spray-painted and glued together. This hid the Arduino in the center surrounded by a couple addressable LED's. The goal of the game is to manipulate the top triangle piece and match its color to that of the base. Each arm represents the intensity of each color of light. For example, if the triangle is pulled all the way to the top, it should be white, and all the way down should be black, any tilt off center increases the value of the light opposite the motion.

My first attempt at the joints was misguided; I didn't think through the side to side motion the joints would need to reproduce. After buying a ceramic beaded bracelet from Michael's and remodeling the ball joints, it worked as planned.

Later, to expand on the project, the Arduino was made to transfer information about it's state through serial to a p5 sketch that helped guide players toward the correct color. Code is on [GitHub Gists](https://gist.github.com/scealux/115b604e47940e1e74c91dbc83b07e5b).

::embed{provider="youtube" id="ym3WRqgNeP4"}

::figure{asset="bac47fab-a047-49b0-96f3-19ea83893214" caption="Final Project (With p5 sketch in the background)"}
