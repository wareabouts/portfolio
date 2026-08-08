---
title: "ATLAS virtual graduation"
slug: atlas-virtual-graduation
year: 2020
categories: [virtual-reality, 3d-design, web-dev]
cover: 783db8e9-0ba0-4c5d-8fce-4c75d306a60a
source: adobe-portfolio
---

::figure{asset="d08f6066-2fe6-4f2f-adc8-be466cd92334" caption="Screenshot from the final event."}

## concept

With my college graduation canceled because of COVID-19; faced with the alternative being a large Zoom call, it left me thinking about what we could do to approximate a proper graduation experience. I had an idea for an interactive, virtual event and sent a proposal to ATLAS faculty (below) .

The idea was to recreate the event location on a platform that allowed faculty, students and their families to "return" to campus one last time. I've used photogrammetry in the past, and was planning to use that for the playable area. That said, I was planning to use socket.io to create a simple Three.js multiplayer experience that allowed users to walk around and talk via text chat.

In doing research into how to create the multiplayer platform, I quickly came across Mozilla Hubs. They were already in the process of building the infrastructure for VRChat-style interactions in the browser. I decided to build around their platform which greatly reduced the workload really enabled the whole experience. That left me to focus on the avatar customizer and the custom map.

I started with the map. Never having used Blender before, and with YouTube as my guide, I learned the workflow for capturing and cleaning up photogrammetry scans in the software. I was looking into a couple paid paid photogrammetry software solutions, but ultimately chose to use the open-source Alice Vision Meshroom. I probably visited the area outside the Visual Arts Center a dozen times, each time returning with a new set of pictures to process. I learned something each time, and after upgrading from my mirrorless camera to a DJI Mavic Mini, I was able to get a highly detailed scan of the entire plaza.

::figure{asset="d48ee981-11b3-4b59-8b7a-82fe02e13127" caption="Screenshot of the VAC Plaza reconstructed with AliceVision Meshroom."}

The model Meshroom produced was around a gigabyte in size; Mozilla Hubs recommends maps be no larger than 18MB. That's where Blender came in. Hours of retopology later, and after borrowing my friend's computer for to project the texture to the new model, I had a low-res map! The retopology process was really entertaining. I tried to optimize the scene as much as possible, that meant deleting any faces that would not be seen by the end users. From the sky, the map is a patchwork of disconnected meshes, but from the ground it looks like a complete scene! I separated out the textures into three levels of distance from the playable area, reducing the resolution at each step to save space. In the end, the GLTF I exported was a slick 16MB.

:::gallery
  ::item{asset="72e56a6a-c85f-4d61-8419-c12d2ba8a7d6" caption="In progress rebuild of the buildings / terrain."}
  ::item{asset="aa72d0e3-44bb-47da-96ed-d1f3251f85f7" caption="Courtyard mostly complete, UMC missing."}
:::

To decorate the scene I also learned how to model trees and a couple other basic objects.

:::gallery
  ::item{asset="ea8c7ce7-9bcb-42a5-80ad-623cfab188e4" caption="ATLAS Banner"}
  ::item{asset="f0c6b0d8-f74f-431f-a846-4c7c02c859e5" caption="Large Tree"}
  ::item{asset="1b0727ca-391f-4a09-89dc-53b01903a0bf" caption="Lamppost"}
  ::item{asset="daa82aa0-3ec1-4313-85d5-bbd39a4009b1" caption="Pine Tree"}
  ::item{asset="09064c6d-ed1f-4c4a-8b45-d7429b0e2049" caption="Small Tree"}
  ::item{asset="336af6ba-0fab-429c-bbbf-b4fcab2af811" caption="Twiggy Tree"}
:::

I separated out the retopologized model into three different distances ( close, mid, far ), and transferred over the texture from the Meshroom model. Further out I dropped the resolution of the texture to shrink the overall file size.

I assembled all the pieces in Mozilla Spoke ( the map-builder ) for Hubs and tried it out.

::figure{asset="b3650d2d-56fd-4f5a-85c9-033b41c12dd0" caption="Demoing the map in Mozilla Hubs"}

::::columns

:::column

::button{href="https://hubs.mozilla.com/scenes/XrE9YBs/cu-boulder-visual-arts-center" label="VISIT THE MAP"}

:::

:::column

::button{href="https://atlas2020.link/" label="TRY THE AVATAR CUSTOMIZER"}

:::

::::

The last step was creating the avatar customizer. Hubs allows custom avatars uploaded by users. After creating a basic avatar shape and setting up the UVs I created the [customizer](https://atlas2020.link/) using Three.js. Users can let the website access their webcam, and preview the avatar textured with the picture. Rather than seeing anonymous avatars, my peers would be able to see each other! As a little feature, I arranged the UV's for the sides of the head into a small area in the center of the forehead. Then, when a user takes their picture, the head is generally textured with a proper skin color! Then users can upload a square image to be textured on their cap. Lastly, the user downloads the model as a GLB and uploads it on Mozilla hubs.

::figure{asset="d8f00ef4-a63b-4ea9-9f7b-9c2b76a6bf7d"}

## results

The bulk of the program was live-streaming a pre-recorded message, then afterwards viewers were given links to Mozilla Hubs rooms.

Avatar customization was definitely an extra step users had to go through but contributed a lot to the overall experience. We still had plenty of robots and pandas around, but graduates were easy to spot in the crowd.

All in all, we only had around 50-70 users pop in and out (4 rooms capped at 50 users each were set up, only the first two were used), dwindling out after around 3hrs. The whole thing was fairly tame until people figured out they could type "/grow" in the chat to make their avatars larger... The reactions (at least the ones I heard) were really positive! People were walking around talking to each other and able to find friends in the crowd. Proximity-based voice chat had users congregating in groups as they would normally, which was really cool to see! Even our major's counselor was walking between groups greeting people and saying goodbye. Everyone understood that we couldn't offer a 1:1 replacement for the in-person ceremony but they were happy to see each other one last time.

After our event, I heard about another [event done in the same fashion was received less favorably](https://www.theverge.com/2020/5/29/21273946/nyu-vr-graduation-virtual-grad-alley-vaporwave-college).

Some thoughts on what could be improved / lessons learned.

1. ROOM CAP

Though the event was successful, it could have benefited from larger room caps. That's a fairly challenging problem, though, as we had 50+ people in a room where Mozilla says you should keep it below 30. Bandwidth is spread thin and performance drops, especially with dozens of sources of positional audio. That's an issue closer to the core of Mozilla Hubs but also browser capabilities.

2. CLEANER MAP

I learned a lot about map building ( & Blender ) through the process. The final map is fairly detailed, but textures fall apart on close inspection. With what I know now about UV mapping & texturing, with enough time I could add a lot of detail to the environment. I've also since learned better retopology / texture projection methods that could help further.

3. VIDEO GUIDES

Most people were able to enter the virtual graduation easily enough, that said, making video tutorials for some processes ( uploading avatar files, accepting mic / video permissions, movement / navigation ) could have eased some people's experiences.

EVENT PHOTOS / VIDEO

:::gallery
  ::item{asset="4921905c-aec5-44c2-9634-9b9b4186698c"}
  ::item{asset="af2d00ff-80fd-4875-bd7d-7d42e4fe117e"}
  ::item{asset="c0dfcca1-9820-451d-846b-0d7a4a79793c"}
  ::item{asset="edc1f188-41d1-437e-8c25-75e329b4d2ea"}
  ::item{asset="6deb7a76-b468-49b9-8deb-10daa3e77e80"}
  ::item{asset="a5eb9b7f-f8f7-4124-b045-156a34926973"}
  ::item{asset="a4c30171-cce5-413a-b5a4-7cbfc6b9217a"}
  ::item{asset="95ba90c5-5d34-4380-830b-7a0c86f25297"}
  ::item{asset="eff9b84f-2f45-45fc-b720-9c4ff7610ae5"}
  ::item{asset="ec965c55-6fb7-45c9-9f31-b3cdc62e2d7c"}
  ::item{asset="be383155-8832-4bc6-ad1d-9256733fc116"}
  ::item{asset="54959121-b323-4ab8-b3a2-e97d27c41633"}
  ::item{asset="0cbc5b96-3607-43e4-bc4d-3dd545994cd5"}
  ::item{asset="6f496d85-19b4-4b26-97b8-090428a4ddfb"}
  ::item{asset="f02fd490-cbd8-4a6b-92a7-d7b5610d2c54"}
  ::item{asset="8fd9f611-b789-4046-9879-e02c19c240ba"}
  ::item{asset="1e6c1bf0-25b0-4131-a8dd-a225cf8d4caa"}
  ::item{asset="effb0ec9-0659-4c1c-9cd6-96bf39e94be3"}
  ::item{asset="17ad7517-26fb-43ed-a2b7-2af8640a28c4"}
  ::item{asset="03a87288-b11b-4394-a53c-17ab1de7aab4"}
  ::item{asset="dc8b28c6-f98f-46c1-9ae8-2d6ecbe45252"}
:::

::video{src="atlas-virtual-graduation.mp4" source="adobe-ccv:TdnBcMxRy6B"}
