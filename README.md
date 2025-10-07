# companion-module-generic-animation

## For Testers: Loading a Dev Module

For people testing "prerelease" versions

1. Choose a folder on your computer for dev modules
2. Download the module from the ["releases" section on Githhub](https://github.com/arikorn/companion-module-generic-animation/releases) and unzip it into that folder (the module should be a subfolder of the dev module path)
3. In the Companion launch window click on the cog in the upper-right and set the "Developer module path" to the folder chosen in step 1. (If using v4.1 or later, make sure developer modules are also enabled in the settings window.)

The module will now show up in the **_Connections_** tab (but not in the Modules page, since it is not yet part of the official set of Companion modules).

Read [HELP.md](./companion/HELP.md) (which also shows up in the module help window) for further instructions

## For Developers: Introduction

This module implements a low-resolution "screensaver" animation module in Companion that allows you to use all the buttons of a
surface as a unified screen for animations. The low-resolution is because the "pixels" are actually text glyphs representing filled and open squares. In other words, this module "draws" by setting the button text to a segment of an underlying grid.

Internally, the program maintains a standard grid (class Grid) on which it can draw. Externally, the central UI element is a single feedback which checks where the button is and sets it text to a rectangular subspace of the underlying grid. One can therefore visualize the entire grid by putting this same feedback in a sufficient number of buttons.

Many configuration options are available: The user can control the size of pixels (i.e. number of pixels per button) as well as the size of the internal grid. The standard options size the grid to fit the number of buttons on the user's surface (i.e. 5x3, 8x4, etc. for Stream Deck, Stream Deck XL, etc. respectively).

Finally, the module contains a simple animation engine, that could be extended in the future.

Currently implemented are simple wipe transitions in the four cardinal directions, loading of text and small images, and...
Conway's Game of Life -- either on the surface of a torus, i.e., the bottom wraps back around to the top and the right side wraps around to the left (and vice-versa), or on a finite plane instead (i.e. no wrap-around).

See the user [HELP.md](./companion/HELP.md) for more details, especially about Conway's Game of Life.

NOTE: Currently, the animation engine appears to have a maximum speed of 8 updates/second (125 ms) regardless of board size
(An easy way to measure is with the "freighter" which travels at c/2.)

# Developer's Quick Start (generic Companion Module instructions)

Executing a `yarn` command should perform all necessary steps to develop the module, if it does not then follow the steps below.

The module can be built once with `yarn build`. This should be enough to get the module to be loadable by companion.

While developing the module, by using `yarn dev` the compiler will be run in watch mode to recompile the files on change.

See also: [HELP.md](./companion/HELP.md) and [LICENSE](./LICENSE)
