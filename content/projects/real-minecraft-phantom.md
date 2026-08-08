---
title: "real minecraft phantom"
slug: real-minecraft-phantom
year: 2023
categories: [microcontrollers, installation]
cover: c4a945f1-6654-44cb-839b-34796274b620
source: adobe-portfolio
---

::embed{provider="youtube" id="i1O-q5zSj9U"}

## concept

In Minecraft, there's an enemy called "The Phantom". They're flying enemies that spawn when the player hasn't slept in-game for a few days. They circle above the player, screech, and then swoop down and hit the player. You CAN kill them, but more will spawn until you go to sleep. 

I wanted to see how well that'd work in real life...

## process

I started by planning out which parts of the Phantom I wanted to recreate. Specifically the glowing green eyes, screech, some way to swing down, and a way to know if I was awake. 

The screeching and eyes were easy enough; a couple LED's and a small amplifier. I downloaded the Phantom's sounds on its Minecraft wiki page, and they worked right away. 

I spent a while overcomplicating the drop mechanism. I drafted designs for all kinds of different 3D printable releases... and then I realized that the default servo arm would work... just resting the arm on a hook and rotating it out of the way to drop.

The last bit was timing the drop. At one point I thought I was going to power it with batteries and have some kind of wireless communication between my PC and the Pi Pico in the Phantom. Again... overcomplicated. I got a 15ft MicroUSB cable and that solved power AND connected to my PC directly. From there, I wrote a python script that triggered the drop and had that run by a Windows Task Scheduler event. That way, if my computer was on and I was logged in at 9:30pm, it'd attack!

I did a test run to confirm everything worked and set up my security camera to record. I also added another python script that started up my webcam to record that perspective of each hit as well.

With everything in place, I used it for a month...

:::gallery
  ::item{asset="33d9a2dd-a719-4e9f-b3dd-ffe043946c41" caption="Drafts of different latch designs..."}
  ::item{asset="8ae9dea1-0267-4dd4-bb77-9b5045790e3d" caption="Dividing the body into sections for cutting out of packaging foam"}
  ::item{asset="737787d3-b48f-4bc1-9fc7-418c466206d0" caption="Building the body with spray adhesive and packing foam"}
  ::item{asset="612f69f1-ee70-4110-835e-c8d3622365c0" caption="Prototyping the electronics on a breadboard"}
  ::item{asset="3303f936-5607-4779-bdc0-b29a7e9682a5" caption="Installing the electronics in the head of the phantom"}
  ::item{asset="fb89050c-7a63-4545-9daa-498c59f2b38e" caption="Measuring and cutting foam for the body"}
:::

## results

While all the electronics worked well, the Phantom is about as useless and annoying as it is in the game. 

It mostly just made me anxious for the 15 minutes before it attacked every night...

Then, on more than one occasion... I just hung it back up after it attacked and went back to playing games.

All said, I wasn't ever really expecting it to ACTUALLY get me to go to sleep. I had my fun and, visually, it looked exactly how I hoped it would, so I'm happy with it!

The comments on the YouTube video were all positive and great to read, and when I [posted a short clip on r/minecraftmemes](https://www.reddit.com/r/MinecraftMemes/comments/18kweor/i_made_a_real_minecraft_phantom_to_get_me_to_go/) it was received just as well!

::::columns

:::column

::figure{asset="a7dd2c6d-6cc5-4e77-b137-f22598e76914"}

:::

:::column

::figure{asset="6f26671d-286e-43f5-b2f8-bb39da7f3fd1"}

:::

::::
