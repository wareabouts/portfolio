---
title: "ellumen: VR training"
slug: vr-training
year: 2022
categories: [virtual-reality]
cover: ff9c8754-adcc-4f7b-9d52-5040d1d67696
source: adobe-portfolio
---

::::columns

:::column

::figure{asset="e907d3c5-f68a-494e-9ace-94c0379d3240" caption="Screenshot of the final warehouse model in Blender"}

:::

:::column

::embed{provider="youtube" id="Z2Bae4JgIBE"}

:::

::::

## concept

VR's come a long way, even since I first tried it in 2016. I've used the Valve Index over the last year and only recently picked up a Meta Quest 2. Trying out wireless VR and the impressive capability of the headset really made me want to take a swing at VR development.

Ellumen works in training and after hearing about companies like StriVR creating VR training for Walmart, I proposed we do the same. My boss, Mary Caroll gave me the go-ahead and I began development.

## process

To create a realistic demo, I worked with one of the Ellumen trainers (Jeremy Wiley) to find relevant tasks that would work well in VR. Eventually, we'd settled on some basic inventory duties that would give participants experience navigating and manipulating objects in the virtual world. 

To create the experience, I knew I'd make the models in Blender and then assemble the scene in either Unreal Engine or Unity. I'd used Unity briefly college and found the VR community to be larger for that engine. Further, a friend suggested I look into the [VRIF from Bearded Ninja Games](https://assetstore.unity.com/packages/templates/systems/vr-interaction-framework-161066). That Unity plugin streamlined the basic functionality and allowed me to rapidly get something in front of stakeholders!

With the technology settled, I began creating the models and scenes in Blender.

:::gallery
  ::item{asset="f2c0b57a-d146-48dc-8e2e-274d62dbf4ff" caption="Blocking out the scene"}
  ::item{asset="0c51072a-d0a1-4d88-8824-f7431cd39ec1"}
  ::item{asset="71e51264-3ca6-4b1c-8bea-1af8b15586d4"}
  ::item{asset="a3f87046-b0ad-47f3-9053-7ab5b6f37168"}
  ::item{asset="9fd6ec9d-6c95-4d3e-89d4-9d74959d183d"}
  ::item{asset="8101a423-bb81-40e3-b081-32449ac9b81d" caption="V1 set up in Unity"}
  ::item{asset="0ca31773-7ec2-4536-92a8-83b0b24a4333"}
  ::item{asset="e3e4f589-b338-4c9c-87a6-9108c9a75b7d"}
:::

I had the first demo ready in a couple of weeks. After having friends and coworkers playtest it, I dove back in to fix bugs and complete the experience.

I wasn't happy with the lighting and overall polish of the scene. I added more details and baked out the textures with raytraced lighting. The lighting and improved textures were a massive boost to the experience; it added a lot to the feeling of presence and realism of the environment.

I wrote some scripts to handle different kinds of tutorial steps, then grouped those under a "Step Manager" object. The two primary steps are UI Steps and Trigger Steps, which are each modifications on an abstract Step class.

For the second version, I also cleaned up the UI. A new font, colors and rounding the corners on panels helped it feel more polished.

Another couple of weeks later, the new experience was ready to demonstrate to executives.

:::gallery
  ::item{asset="f31e21fa-f475-4152-9663-5a7c7b1b9184"}
  ::item{asset="2408e08f-3c56-4d7f-b79f-e2c5500f51b9"}
  ::item{asset="577909f4-d775-4a34-bac4-773df38b16fb"}
  ::item{asset="4655b1ba-0220-499e-813d-541f59367386"}
  ::item{asset="6d5e80ad-6fd1-41d4-a283-f0a80640c203"}
:::

## results

The demo was a blast; it was great to see so many people try the experience ( for some it was their first experience in VR ) and the flurry of new ideas that followed. I'm looking forward to future projects and expanding our capabilities in VR training!

:::gallery
  ::item{asset="d13d91c2-8ca2-4898-b5ed-3aba023ce2db"}
  ::item{asset="e87355c8-6b31-4e0b-b70d-06870122ecea"}
  ::item{asset="ba4dee76-9b59-488e-aaaf-a02805c41583"}
  ::item{asset="d20062b1-c95d-4622-bce3-f4b97a11f6fa"}
:::
