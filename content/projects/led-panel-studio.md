---
title: "LED panel studio"
slug: led-panel-studio
year: 2026
categories: [microcontrollers, web-dev]
shape: project
unlisted: true
---

A browser IDE and ESP32 firmware for a 32 by 32 LED art panel. You write effects in a GLSL subset, preview them in the browser, and push them to the panel over WiFi or Bluetooth.

## concept

It started with an LED panel workshop by [Dave Elfving](https://github.com/DCElfving), setting up an ESP32 to drive a 32 by 32 pixel grid. I wanted to take it further and redo the interface from scratch. The old workflow meant joining the panel's own WiFi network every time you wanted to change anything on it.

## process

I built it with Claude Code. The editor takes shader-style code, a GLSL-esque subset, and renders a live preview, so an effect can be iterated on before it ever touches hardware. Then it pushes to the panel over Bluetooth. Along the way I learned a lot about the small optimizations that make effects run faster on the ESP32, and got to chase an enjoyable way of interacting with the panel without compromise.

## results

The workflow is the part I am proudest of: write, preview, push, all from the browser, no network juggling. The [studio is live](https://wareabouts.github.io/led-panel-studio/). Next I want to connect several panels with ESP-NOW, find the brightness limits, and use the panel as a status display for whatever stats I feel like watching.
