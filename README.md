# companion-module-generic-lowres-screensaver

# Introduction

This module implements a low-resolution "screensaver" in Companion that allows you to treat all the buttons of a
surface as a unified screen for animations.

Currently implemented are simple wipe transitions in the four cardinal directions and...
Conway's Game of Life on the surface of a torus, i.e., the bottom wraps back around to the top and the right side wraps around to the left (and vice-versa), with an option to play on a finite plane instead (i.e. no wrap-around).

See the user [HELP.md](./companion/HELP.md) for more details...

# TO DO:

- [ ] Change [row,col] to the more standard [col, row], i.e., [x, y]
- [ ] Add demo with freighters going different dirs in each row...
- [x] Allow offsets for positioning; finish positioning options
- [x] Change speed while game is running
- [ ] Allow adding more than one shape?
- [ ] Random shape selection with auto-chaining of games
- [x] Customize within-button grid size
- [x] Enable/disable wrapping in Conway
- [ ] Looping wipe transitions, user-selectable direction
- [ ] 30x60 for the marquee?
- [x] Specify rate rather than period for update timer
- [ ] Add variables for generation and population
- [ ] Add presets (the "main" button, settings, stats, ...)
- [ ] Add controllable wipe speed?
- [ ] Better shape retrieval
- [ ] Set shape to arbitrary text
- [ ] Possibly, smart placement of text???
- [ ] Possible efficiency improvements:
  - [ ] Don't recalculate button position each time (may use subscribe)
  - [ ] Specify the font size explicitly
  - [ ] Don't use Conway for wipe animation (or tell it to skip calculations...)
  - [ ] Would generating a PNG image directly be more efficient?
- [ ] Typesetting fonts: "real" fonts and/or 5x7 characters (and numbers, whether 5x7 or 4x5)
- [ ] "Spontaneous generation" - occasionally add a new live cell near a randomly-chosen live cell. (to keep board alive; could be strictly UI)

NOTE: Currently, the game appears to have a maximum speed of 8 updates/second (125 ms) regardless of board size

# Developor's Quick Start

Executing a `yarn` command should perform all necessary steps to develop the module, if it does not then follow the steps below.

The module can be built once with `yarn build`. This should be enough to get the module to be loadable by companion.

While developing the module, by using `yarn dev` the compiler will be run in watch mode to recompile the files on change.

See also: [HELP.md](./companion/HELP.md) and [LICENSE](./LICENSE)
