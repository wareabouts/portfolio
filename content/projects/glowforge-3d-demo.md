---
title: "glowforge 3D demo"
slug: glowforge-3d-demo
year: 2020
categories: [3d-design, web-dev]
cover: 512432d9-7ea0-4c31-9480-1ef0e95fb647
source: adobe-portfolio
---

::figure{asset="4328cb02-3f47-44aa-8b54-5a23f91151be"}

::button{href="https://codesandbox.io/s/glowforge-3d-w-svg-ui-04c4k?file=/src/index.js" label="View Demo"}

## concept

Glowforge is working to make the laser cutter, typically only found in large labs or machine shops, accessible to hobbyists and entrepreneurial individuals. It's clear that in developing the product, they've tried to smooth over rough edges in the user experience and present the Glowforge as simple to use.

I'm particularly interested in 3D in the browser, and the job description mentioned experience there as a bonus. That said, I wanted to use 3D to introduce potential customers to the Glowforge in a unique way. I decided to make an interactive Glowforge where users can move around the machine to get more comfortable with its features and layout.

## process

I've been learning Blender for the last couple of months, and this seemed like a great opportunity to learn a new side to the program. I'd only briefly touched on UV unwrapping and texturing for a previous project, so I dove in. I'm most comfortable creating 3D models in Fusion 360, so for the sake of time I re-modeled the Glowforge there. Using a couple known dimensions and extrapolating / estimating others, I was able to create a model that closely resembles the real deal. From there, I took it into Blender to polish up some of the details and begin texturing / animating it.

Guided by a series of YouTube tutorials, I modeled the Glowforge specifically for export in the GLTF format. I knew this is what runs best when used with ThreeJS. Texturing was interesting, recreating some of the patterns in Illustrator was really fun! For the crumb tray I even tried out making a normal map, so the grate looked 3D without the added geometry.

::figure{asset="9996e9dd-d39c-4d49-898e-ef4fef268df8" caption="Render of the finished Glowforge model."}

I spent more time than I'd like to admit figuring out Blender's animation system, but was eventually able to rig and animate the Glowforge through an opening motion. This is exported with the GLTF file and is accessible by Three.js.

::figure{asset="8ab5d320-9f12-4e0c-bcc1-423c0e923572" caption="GIF of the opening animation."}

From there, it was a couple weeks of trial and error and learning new things. For the final website, I ended up diving into SVG animation and created a loader with the logo ( below ) among other assets.

::figure{asset="b268389b-53ac-48c8-ad6f-a40da6fb72da" caption="GIF of the animated loader."}

Eventually, I'd finished the demo website and learned a ton along the way about SVG animation, Three.js & CSS Transitions.

## results

[The finished demo is over on Codesandbox](https://codesandbox.io/s/glowforge-3d-w-svg-ui-04c4k?file=/src/index.js).The finished site is made to look like it could easily fit in with Glowforge's existing website as a new "Explore" tab. From there, users click to have the greeting fade away. The Glowforge opens and hotspots appear as transparent ripples on various points of interest. On hover, the points display the name of the feature, and when clicked the view is animated to focus on the point. The focus UI animates into place and gives a bit more information on the specific feature. Users can close a hotspot and return to the main view to explore the others.

## extensions

There's definitely more that could be done, but I'm proud of it as a demo of what's possible. Taking this further there's a few things I think would improve the experience:

### 1. Optimizations for less powerful computers

Working on this on my desktop, performance wasn't an issue until I tried opening it on my girlfriend's Macbook. At this moment, I'm not familiar with the steps necessary to improve performance on those machines ( and to what degree it's possible ), so that'd definitely need to be worked out before this could be live on the real website.

### 2. More useful information on focus

The extra few sentences revealed when a hotspot is clicked aren't incredibly helpful. More information on these features ( i.e. laser wattage / differences per model ) might me more useful that a text blurb.

### 3. Overall emptiness

Though it's a fairly clean setup, I think the overall site could benefit from a more interesting background. Maybe the Glowforge in a scene or in general something to fill the blank white screen on the sides.

### 4. Augmented reality

In thinking about features that could increase customer comfort ( especially when making a fairly expensive purchase ) It'd be nice to use modern WebXR to allow customers to "place" the Glowforge somewhere in their house. It's a gorgeous machine and depending on how accurate the scale could be, it'd be helpful for someone planning where to put it!
