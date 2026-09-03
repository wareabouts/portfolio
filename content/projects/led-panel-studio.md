---
title: "LED panel studio"
slug: led-panel-studio
cover: 9a28b648-cc9c-42c5-b32b-049e81f299d2
year: 2026
categories: [microcontrollers, web-dev]
shape: project
---

A browser editor and ESP32 firmware for a 32 by 32 LED panel. You write an effect in a small GLSL-style language, watch it run in a preview, and push it to the panel over Bluetooth or WiFi.

::figure{asset="9a28b648-cc9c-42c5-b32b-049e81f299d2" caption="The studio: live preview on the left, the effect's code in the middle, the effect library on the right. The bars under the editor show how hard the panel will have to work, as operations per pixel, the frame rate that implies, and how much of its 64 KB the effect takes."}

## concept

It started with an LED panel workshop by [Dave Elfving](https://github.com/DCElfving): an ESP32 driving a 32 by 32 grid, with a basic way to load patterns onto it. To change anything you had to join the panel's own WiFi network first. I wanted to keep the panel and redo everything in front of it.

## process

I built the editor with Claude Code. The language is a subset of GLSL, close enough that shader habits carry over and small enough that the compiler can tell you before you upload whether the panel will keep up. It reports operations per pixel and the frame rate that works out to, and it flags an effect that will not fit in the panel's 64 KB. The preview runs the same code in the browser, so most of the tuning happens before the hardware is involved.

Along the way I learned a lot about the small optimizations that matter on a chip this size, like hoisting anything that only depends on time out of the per-pixel loop.

## results

The part I like most is the loop: write, preview, push, all in the browser, with no network juggling. It is [live here](https://wareabouts.github.io/led-panel-studio/), with twenty built-in effects to start from. Next I want to chain several panels together over ESP-NOW, find out how bright it can safely go, and use it as a status display for whatever numbers I feel like watching.
