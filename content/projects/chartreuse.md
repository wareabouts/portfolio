---
title: "chartreuse"
slug: chartreuse
year: 2019
categories: [microcontrollers, installation]
cover: c1db8307-050f-4c15-b686-631aaa4b5156
source: adobe-portfolio
---

::figure{asset="e806463b-57a7-4a71-89f8-d91a3bf3553c"}

## concept

Chartreuse is a motion-tracking face made as the final project for ATLS 3300: Object. She was inspired by "[Albert](https://www.exploratorium.edu/exhibits/albert)"at the Exploratorium in San Francisco, California.

She was a joint project with [Anna Lynton](https://www.linkedin.com/in/anna-lynton-62a276179/) who edited and assembled the mask using Slicer for Autodesk Fusion 360. I worked on the electronics / design and [code](https://gist.github.com/scealux/136b90b354d1a31f203b4f4105bf7b94?fbclid=IwAR0_ZKMIEB0m4yTNhF6hlXD4e15cC9rFM0m8GRBGALyUnYse5ArOxjVZRo8).

We wanted the project to be low cost and so we settled on MDF construction with a few supporting 3D Printed parts. I happened to have half of a PLA spool lying around that we decided to use as the "lazy Susan" for the rotating head. To get it to run smoothly, I bought a few loose ball bearings and 3D printed two halves of a ring to hold them captive. A soldering iron melts the two halves together. The bearings are held to tight to move at first. Placed between the smooth concrete floor and a plank of wood i stepped on the whole thing and moved around until it rolled smooth. The finished bearing reduces the work the stepper motor has to do.

Anna drafted and sliced the mask in Autodesk Fusion 360 while I tested out various methods for motion tracking. From what we gathered, the original Albert tracks by flashing his eyes and using photodetectors to align the face toward the brightest nearby object. We were planning on having the eyes be reactive, and weren't interested in blinding the people who interacted with her. Additionally, Albert works best in a darker area and we wanted Chartreuse to work in other environments. After a few different tests, we decided an ultrasonic sensor rotating on a servo worked best for our application.

The system could really only track objects coming in from the left, detecting an object within a range would cause the servo it was mounted on to rotate counter-clockwise. When the ultrasonic sensor no longer detected something it would clockwise until the the start position or until it found another object in range.

To make Chartreuse expressive, I designed and 3D-Printed an adapter to make a normal 180deg servo into a linear one. The eyes were lit from behind and the linear servo would raise or lower cardboard "eyelids" to change the shadow projected onto semi-opaque acrylic. From the front, these appeared as different emotions!

The next step was factoring those emotions into the user flow. When Chartruse is idle, her eyes return to a neutral gray. When she sees someone, her eyes turn yellow and the eyelids "smile" and come in from the bottom. When someone leaves / Chartreuse hasn't seen an object in a few seconds, her eyes turn blue and she looks sad before returning to the start position and neutral a few seconds after that.

With it all coded and put together, all that was left was to test it out!

:::gallery
  ::item{asset="08efab59-edfa-44f4-874b-87b4d34c264a" caption="Pieces of the mask."}
  ::item{asset="aaf4d342-10ac-47ba-bdc6-6a8200366d4a" caption="Assembling the mask."}
  ::item{asset="3752f770-afb2-4c87-a09a-b7a3ea4c1c3a" caption="Testing the eyes."}
  ::item{asset="45f06148-e7c1-499a-87c2-c0119dd5afb2" caption="Assembling the 3D-printed ball bearings."}
  ::item{asset="ee1458ff-7877-4c07-bab0-b06e4d01784f" caption="Detail of the back of the mask."}
  ::item{asset="d9a84815-cf3f-460c-9401-b07a4fac5565" caption="Detail of the rotation mechanism of the mask."}
  ::item{asset="e0ce4f66-18cc-4dde-b1c4-2a28df6d14ea" caption="Overhead view of the eyes."}
  ::item{asset="6b7606d8-bdf8-43aa-816b-4ab70cd87dfb" caption="View inside the base."}
  ::item{asset="51e58f51-b405-4e42-a581-79091030e1a6" caption="View of the eye servo."}
:::

## results

Chartreuse was a lot of fun to interact with. She doesn't quite have Albert's speed / reflexes but some of the slowness and visible gears seem to add to add an overall frail but endearing presence. We put together a video showing some of the features and how the interactions work. I hadn't recorded the LED's before and that led to some artifacts in the video.

::embed{provider="youtube" id="Nqh3Ej8qfTU"}

[Instructables](https://www.instructables.com/id/Motion-Tracking-Face/):14K+ views, 2nd place in their "clocks" competition and Featured on Instructables

::figure{asset="2921d13b-839b-49ce-b700-ea7c86f28dc8"}

[Digikey's Maker Update](https://www.youtube.com/watch?v=Z1FAlenQMJw&):Featured as "Project of the Week" for episode #128

::embed{provider="youtube" id="Z1FAlenQMJw"}

[Raspberry Pi's Hackspace Magazine](https://hackspace.raspberrypi.org/issues/21): Full page feature in the August 2019 issue.

::figure{asset="60cf49c4-3996-44aa-bcdf-17901a63ec2c"}
