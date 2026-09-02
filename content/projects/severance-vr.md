---
title: "severance VR"
slug: severance-vr
year: 2023
categories: [virtual-reality]
cover: dcc9fe88-5043-4fa5-b1ea-d53d0145ff5f
source: adobe-portfolio
---

::embed{provider="youtube" id="bDbwyHaG7CM"}

## concept

I fell in love with Apple TV's Severance after watching it in March of 2023. I'd been following leaks and rumors around the as-yet-unannounced Apple Vision Pro. 

I feel like the show's concept is perfect for the VR platform and set out to make a demo of what that could look like!

## process

The show is centered around the concept of surgically separating your consciousness. Your work and home selves don't know anything about the other. In the show, the moment of transitioning between the selves occurs in a single-person elevator on the way in or out of the office. 

For me, this provided a perfect parallel for the user donning the headset. When they wear the headset they're becoming their "innie" as the show calls them; unaware of who they are in the external world. 

With this as the basis, and following the mysterious past of the "Petey" character from the show, I decided this game could explore that character's origins, as a prequel to the events of Season 1. 

I started with a list of interactions that I felt would be compelling to experience in VR, then integrated important props and story beats. 

When I'd assembled that into a rough storyline, I recorded myself acting through the scenes in my apartment, and edited together a representation of the final video.

::embed{provider="youtube" id="8ruAZ5fPwsA"}

Creating the assets was an awesome experience. It was an engaging challenge to take context clues for dimensions from the show and extrapolate them out to full scenes. There's a hundred individual anecdotes but I wanted to highlight two in particular: the elevator card reader and the "reintegration tear" on the bridge.

The card reader was an interesting action to prototype in VR. It's a precise interaction that most people could do fairly easily in reality, but in VR presented a bit of a challenge. 
The whole time I was pretty committed to the player having a physical body. For the card reader, they'd need to insert and then remove the card, it being detected at its deepest point and triggering the elevator doors. 

I used the AutoHand addon from the Unity Asset Store for most of the interactables. Though the inbuilt XR Interaction Toolkit does support interactables, I love the tactility that the physics built into AutoHand provide.
Kind of how "Enhanced Pointer Precision" works on windows, I wanted the player's motions to slow down near interactions that require more precision. 

I made a sphere volume that, when the player's hand is inside and holding the access card, slows down the motion the closer their hand is to the center. That way, when they reach to insert the card, they physics helps align the card with the reader. Beyond that, a few colliders around the slot direct near-misses into the reader. Then, one more trigger at the end, detects the full insertion and triggers the elevator door animation.

::figure{asset="348bfa4b-58cd-437f-b125-3ca6a02f2879" caption="View behind the camera of the opening shot"}

::figure{asset="a60c7aa6-4a79-48c0-be6d-2319cf5b97ed" caption="Pixel Shader for the screen effect"}

Then, for the "Reintegration Tear". Part of what I love about VR is the opportunity to really break physical rules. 

In the show, there's a scene where Petey is having difficulty "reintegrating" and coordinating memories from his split consciousness. This comes to a head when he believes himself to be running down one of the featureless hallways of the severed floor, when in reality he's shuffling across a bridge wearing a bathrobe. 

To make this happen, I knew I'd have to use a feature that was new to me, the Stencil Buffer. 

For the effect, I made both the bridge scene as well as a long hallway from some modular components. I baked the scene lighting with the hallway floating far above the bridge, then moved it down, in line with the asphalt. 

While the player runs down the hallway, a particle emitter launches shapes toward them, with a material that overrides assets in the "hallway" layer. From there, I animate the visibility of the hallway and distort the player's vision with post processing effects. 

At the end, the player is standing in a bathrobe, on the snowy bridge with flock of birds overhead. I loved this as a scene to end on... drastically contrasting the cramped and claustrophobic environments of the rest of the experience.

## results

After months of work ( and taking more than a few days off work to get past some particularly tricky issues with the player's body... ) It was done! Just a week before Apple announced their Vision Pro!

I shared it in some fan communities and was extremely validated by the response. I always knew that this project was targeting a very specific subset of people ( VR enthusiasts who also liked the specific show ), but a few outside that bubble even said a real version would compel them to enter VR!

While working on this, I'd somehow discovered a second degree connection to the showwriter, Dan Erikson! That friend forwarded the final trailer to him and relayed the enthusiastic response. A few months later, a fan account for the show retweeted the link and the director, Ben Stiller liked the post!

Happy to know that, though this wasn't nearly as viral as some of my other projects, as a passion project... it reached the intended audience. 👌
