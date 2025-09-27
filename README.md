# companion-module-generic-lowres-screensaver

# Introduction

This module implements a low-resolution "screensaver" in Companion that allows you to treat all the buttons of a
surface as a unified screen for animations.

Currently implemented are simple wipe transitions in the four cardinal directions and...
Conway's Game of Life on the surface of a torus, i.e., the bottom wraps back around to the top and the right side wraps around to the left (and vice-versa), with an option to play on a finite plane instead (i.e. no wrap-around).

See the user [HELP.md](./companion/HELP.md) for more details...

# TO DO:

- [ ] Note apparent bug in Companion 4.1 (or others?) - CPU goes up to 70% after recompile dev module
- [x] Bug in companion-module/base - can't debug starting with 1.12. (9-20: Julian says he fixed it!)
- [x] Change [row,col] to the more standard [col, row], i.e., [x, y]
- [x] Add demo with freighters going different dirs in each row...
- [x] Configurable cell-characters (blank vs. grid, maybe dimmer grid)
- [x] Allow offsets for positioning; finish positioning options
- [x] Change speed while game is running
- [x] Organize shapes, both internally and for the user. (probably could do better...)
- [x] Manually advance to next in queue
- [ ] Allow shapes to be in more than one category
- [ ] Allow game-timeout so "continuous" shapes can be played in a playlist (or just let user do it with standard actions?)
- [ ] Create a timeout variable/feedback for use in Triggers (for screensaver functionality)
- [ ] Set shape to arbitrary text
- [ ] Possibly, smart placement of text???
- [ ] Random shape selection (i.e. user doesn't select a playlist at all)
- [x] Make "repeat" (loop) separate from the Start action?
- [x] Auto-chaining of games (queue either a category or arbitrary group)
  - [x] better way with {update: (), done: ()} callbacks
- [x] (Put set shape on queue as well...)
- [x] Continuous looping of queue / randomize queue
- [x] Fix up prettier's mangling of shapes.ts? (or convert to...?)
- [x] Customize within-button grid size
- [x] Enable/disable wrapping in Conway
- [ ] Looping wipe transitions, user-selectable direction
- [x] Add 60x30 marquee?
- [x] Specify rate rather than period for update timer
- [x] Add variables for generation and population (and running and board size)
- [x] Animation: set a variable with animation status (on/off) for triggers
- [x] Add feedbacks for running, transitioning (wiping)
- [ ] Allow adding more than one shape to a single board?
- [ ] Add Presets (the "main" button, settings, stats, ...); remove colors from feedbacks
- [ ] Add controllable wipe speed?
- [ ] Allow user to specify an offset for button position relative to the internal grid
- [ ] User access to shape transforms? (Also: implement rotate() function in shapes.ts)
- [ ] User-specified shapes? and allow user to save current shape.
- [ ] Typesetting fonts: "real" fonts and/or 5x7 characters (and numbers, whether 5x7 or 4x5) - maybe with half-tone anti-aliasing?
- [ ] "Spontaneous generation" - occasionally add a new live cell near a randomly-chosen live cell. (to keep board alive; could be strictly UI)
- [ ] Possible efficiency improvements:
  - [ ] Don't recalculate button position each time (may use subscribe?)
  - [ ] Specify the font size explicitly
  - [ ] Don't use Conway for wipe animation (or tell it to skip calculations...)
  - [ ] Would generating a PNG image directly be more efficient?

NOTE: Currently, the game appears to have a maximum speed of 8 updates/second (125 ms) regardless of board size
(An easy way to measure is with the "freighter" which travels at c/2.)

# Developor's Quick Start

Executing a `yarn` command should perform all necessary steps to develop the module, if it does not then follow the steps below.

The module can be built once with `yarn build`. This should be enough to get the module to be loadable by companion.

While developing the module, by using `yarn dev` the compiler will be run in watch mode to recompile the files on change.

See also: [HELP.md](./companion/HELP.md) and [LICENSE](./LICENSE)
