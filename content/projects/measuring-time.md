---
title: "measuring time"
slug: measuring-time
year: 2019
categories: [microcontrollers, installation]
cover: 5d26ef59-993b-4374-8145-5551a0202bde
source: adobe-portfolio
---

::figure{asset="325362b2-0b62-4fc3-ad0a-cfea8fa19b76"}

## concept

For this project, we took an everyday measuring tool and turned it into a timepiece. We motorized a tape measure and programmed it to increment over the day to show the time in hours. To keep the whole project looking as best it could, the largest challenge was minifying the electronics and keeping the overall footprint of the device to roughly the size of the real object.

## process

Our project uses the tape taken from another tape measure. Separated from its original shell, we built a new case to support the mechanism and our electronics. A stepper motor replaced the inner steel spring to drive the tape in and out. It’s controlled by an Arduino nano attached beneath it, along with a real-time clock chip and h-bridge attached on the sides. The real-time clock allows the device to know the time even when unplugged and resume timekeeping when it’s plugged in. All of these electronics are contained in the space inside the metal tape’s spool. Lastly a limit switch on the front is triggered by the end of the tape and allows us to home the tape measure.

We began with an MDF prototype before iterating on subsequent 3D-prints. We started big, and minified different components as needed. The largest issue became the tape unspooling in the case and pressing against the sides. To combat this, we reprinted the spool until the tolerances were tight enough that the tape wouldn't unwind but the stepper was still able to rotate it.

:::gallery
  ::item{asset="2c47571d-d7e3-473f-890a-f3d8ecebabd0" caption="MDF prototype."}
  ::item{asset="867d730b-dc17-4e96-99af-275c8695701f" caption="Model for MDF prototype."}
  ::item{asset="d5618e21-fec7-4484-a212-e0ff26abfb5d" caption="Model for PLA prototype."}
  ::item{asset="249b269a-2253-4de2-9bee-2896326150be" caption="PLA prototype."}
  ::item{asset="ad1a8cea-c4c2-4e14-89f6-816c52c474b6" caption="Wiring diagram."}
  ::item{asset="cb09d1a8-65f5-4e61-951f-444f858246e7" caption="Modified power adaptor."}
  ::item{asset="eaa8c81f-cf50-461c-b77c-0ed25b498399" caption="Final case model."}
  ::item{asset="4e13f1af-da07-4c9d-b038-b412d8c89da0" caption="Final case processing (Bondo and sanding)."}
  ::item{asset="dc78c7fc-6e72-473c-a7c2-8187c1066b62" caption="More sanding..."}
  ::item{asset="72f750e8-49fd-47a4-9c64-63336ef927fc" caption="Case after spray paint."}
  ::item{asset="484ba56b-3468-4d9d-ae24-7af81396ca5a" caption="Assembling the final case."}
:::

## result

After enough tweaking, it all works as we'd hoped! The tape looks great mounted on the wall and works immediately on being plugged in. The tape homes, then extends out to the current time in inches. The RTC keeps time even when it's not plugged in so it catches up as soon as it's plugged in.

::embed{provider="youtube" id="FSvwEukJsqk"}

[Instructables](https://www.instructables.com/id/Time-Measure-Tape-Measure-Clock/):Featured, 52K+ Views, 2nd place in their ["clocks" competition](https://www.instructables.com/contest/clocks2020/)

::figure{asset="f74231e0-0f7a-4798-90d9-e483598184fc"}

[Hackaday](https://hackaday.com/2020/04/27/watch-the-day-inch-along-with-a-tape-measure-clock/):Featured project

::figure{asset="5be71405-fada-4551-b1c7-41f601e41d52"}

[Raspberry Pi's Hackspace Magazine](https://hackspace.raspberrypi.org/issues/31):2-page feature in their June 2020 Issue ( #31 )

::figure{asset="e7fb19d6-3405-440d-90fb-90aff361ba19"}
