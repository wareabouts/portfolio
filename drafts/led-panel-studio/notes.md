# LED panel studio (working title)

Answer in any order, in fragments or paragraphs, as much or as little as you want. Delete
questions that do not apply. Everything here is raw material, not copy.

## The basics

- Year: 2026
- Category: Microcontrollers / web dev
- Shape (project for most things, feature for a big one, collection for several small things): Project
- Links (repo, live site, press, the thing it was made for): https://wareabouts.github.io/led-panel-studio/
- Video (YouTube links, unlisted is fine; the page embeds them): (I still need to make / record a video)
- Credits (who else worked on it, and which parts were yours): Based on an LED panel workshop by Dave Elfving (https://github.com/DCElfving)

## What is it?

Browser IDE + ESP32 firmware for a 32x32 LED art panel: write GLSL-subset effects, preview them, push over WiFi or Bluetooth

## What was the goal, and who was it for?
After taking a workshop on setting up an ESP32 to be able to customize a display on a 32x32px pixel grid, I was inspired to take it further and fully redo the interface. 

## What did you actually do?
I used Claude code to make interacting with the panel easier, and made an interface for writing custom GLSL-esque shader code to create new effects. 


## What are you proudest of?

Most proud of the workflow of interacting with the panel. Previously, you had to connect your device to the Wifi of the panel to interact with it / upload. Now, effects can be pushed to the panel over bluetooth and iterated on quickly with the preview. 

## What surprised you, or went wrong?

Learned a lot about small optimizations that could help effects run faster, and was able to relentlessly pursue an enjoyable user experience for unique interactions with the panel. 

## What would you do differently?

Less differently, more... what's next. I'm interested in expanding the panel, connecting multiple using ESPNOW. Also curious to explore brightness limits and using the panel as a status indicator / dashboard for various stats and pieces of information. 

## Notes on the media

- The hero, the image or clip that should be the cover (for a video page, put a still or a
  short clip in media/ so the grid cover can be made from it):
- Anything that must be in, or must stay out:
- Captions you already know:
- Anything that needs context to make sense (a screenshot of what, a clip from where):
