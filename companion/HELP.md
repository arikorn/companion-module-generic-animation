# Animation Module: Low-Res "Screensaver" & Conway's Game of Life

This module implements a low-resolution "screensaver" in Companion that allows you to treat all the buttons of a
surface as a unified screen for animations.

Currently implemented are simple wipe transitions in the four cardinal directions and Conway's Game of Life (see description below). Custom text and PNG files can be loaded, as well as many pre-loaded starting shapes for the Game of Life, all of which can be added to playlists and played repeatedly and/or with shuffle for increased variety.

Please note that for 10x11 button-grids (the default) the PNG import is limited to 55x30 for a Stream Deck and 88x40 pixels for the Stream Deck XL. (For square pixels, set the button-grid to 10x10, and the limit is then 50x30 and 80x40 respectively.) If the image is larger than that, only the top-left corner will be used. The image will be rendered in monochrome, but due to a bug in the PNG library, load only grayscale or color images (monochrome, aka bitmap images don't load properly). Future version will support more colors or at least shades of gray...

## GETTING STARTED

1. In the **Connections** page add the "Generic: animation" module (if you don't see it, follow the instructions in the README on [the main Github page](https://github.com/arikorn/companion-module-generic-animation/)
   1a. Click on the connection in the left pane, then in right-hand pane select the "Total Board Size" that fits your surface. (We strongly recommend using the "fit to" options)
   1b. be sure to click **_Save_**!
2. Go the **Buttons** page and add or choose a page to use for the animation screen
3. Go to the **_Presets_** tab on the right side of the **Buttons** page and elect the **animation** group (i.e. this module)
4. Select the **_Grid Button!_** group: it has only one button: drag it onto the board.
   4a. Recommended: add the action "Surface: Set to page" and set it to "back" to this first button... (and change the Start/Stop action option to "Stop")
   4b. then copy it (ctrl-C/cmd-C) and then paste it (ctrl-V/cmd-V) to all the buttons on the page.
5. On a different page, set up the remaining presets, particularly the buttons from **_Playlists_**

Select a playlist, decide whether to play on repeat and/or shuffle, then go to the "game" page and press any button to start/pause the game! (If you set the screensaver mode, pressing the button may take you away from the page, so you may need to start the game on the settings page.)

### Setting up a screensaver:

- "Shortcut": download the triggers companionconfig file from the Github release section and use the Triggers tab of the "Import Configuration" screen (which comes up after you click "Import" on the "Import/Export page). Then go through each rule to customize for your needs:

- one trigger to set the timeout: (call it "Set Idle Timer")
  - Set the Events to "On any Button Press" and "Startup"
  - Set the Actions to "animation: Set the idle timer" (this will reset the timeout every time a button is pressed)

- one trigger to switch the page on timeout and start game (call it "Start Screensaver")
  - Set the Events to "On condition becoming true"
  - Set the Condition to the feedback "animation: Idle Timeout"
  - Set the Actions to "internal: Surface: Set to page" set it to the grid page (tip: you can set it to the expression: `$(animation:screenPage)` )
  - (optional - set the playlist, repeat, shuffle, etc. or just set it up ahead of time)
  - (optional - use feedback "Playlist is Empty" in an IF action to set the playlist only once, if repeat is enabled.)
  - animation: Start/Stop (Play/Pause) the Game

TIPS:

- In the game status buttons "Gen" stands for "generation" (number of turns) and "Pop" stands for "population" (the number of "live" cells). See below for details.
- You can add other actions to game buttons, such as changing speed or playlists
- You don't have to set _every_ button to the grid display -- the "missing" buttons will just be ignored.
- ...for example, you can dedicate one button to the game statistics. (Or using fancy logic, have status flash on once every few seconds).
- The default button grid is 11x10, which gives non-square pixels. If you want to load a PNG "image" either stretch its width by 10% or switch the button grid to 10x10 (advanced settings in config, or the corresponding action).
- Most settings are stored in the configuration and remembered next time you start -- basically everything you see in the configuration section on the **Connections** page (including advanced settings).

## Conway's Game of Life

This project implements Conway's Game of Life on a wrap-around board(i.e. the bottom continues back at the top, and the sides are likewise connected).

While you can enjoy its "kaleidoscopic" action without knowing how the game works, it may be more interesting to know that all the complexity arises from three simple rules. Conway's Game of Life is a very simple population simulation. On each turn (generation), every cell in a grid is evaluated for how many of its neighbors are "alive" (or "on"). The next generation is determined by the following rules:

1. If the cell has exactly **three** live neighbors, it will be "alive" in the next generation.
2. If the cell has exactly **two** live two neighbors, it will survive to the next generation; i.e., it will stay the same as it was.
3. **All other cells** will be "dead" (off) in the next generation.

The game is starting by setting up an initial "population" (shape). People have done some amazing things with these three simple rules, and some of their designs have been included in this project. See the links in the next section if you would like to delve.

### Further reading

[The "official" website? Conwaylife.com](https://conwaylife.com/)

[Conway life exploratorium](https://conwaylife.com/forums/viewtopic.php?p=113168#p113168)

["Glossary" of Conway Terminology](http://www.radicaleye.com/lifepage/picgloss/picgloss.html)

[An even more comprehensive library of patterns](https://conwaylife.appspot.com/library/)

[Conway's Game of life (on infinite grid), with examples](https://playgameoflife.com/)

[Wikipedia's entry on Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life)

[NYT Article shortly after Conway's death (2020) -- very cool animation at the top!](https://www.nytimes.com/2020/12/28/science/math-conway-game-of-life.html)
