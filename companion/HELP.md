# Animation Module: Low-Res "Screensaver" & Conway's Game of Life

This module implements a low-resolution "screensaver" in Companion that allows you to treat all the buttons of a
surface as a unified screen for animations.

Currently implemented are simple wipe transitions in the four cardinal directions and Conway's Game of Life (see description later)

## Loading a Dev Module

1. Choose a folder for dev modules
2. In the Companion launch window click on the cog in the upper-right and set the "Developer module path" to the folder chosen in step 1. (If using v4.1 or later, make sure it is also enabled.)
3. Download the module and unzip it into that folder (the module should be a subfolder of the dev module path)

The module will now show up in the **_Connections_** tab (but not in the Modules page, since it is not yet part of the official set of Companion modules).

## GETTING STARTED

1. In the **Connections** page select the "Total Board Size" that fits your surface. (We strongly recommend using the "fit to" options)
   -- be sure to click **_Save_**!
2. Go the **Buttons** page and choose a page to use for the animation screen
3. Go to the **_Presets_** tab on the right side of the **Buttons** page and elect the **animation** group (i.e. this module)
4. Select the **_Grid Button!_** group: it has only one button: drag it onto the board.
   4a. Optional: if using as a scrrensaver, you can add the action "Surface: Set to page" and set it to "back".
   4b. then copy it (ctrl-C/cmd-C) and then paste it (ctrl-V/cmd-V) to all the buttons on the page. (Or just drag the preset repeatedly.)
5. On a different page, set up the remaining presets, particularly the buttons from **_Board Content_**

Select a playlist, decide whether to play on repeat and/or shuffle, then go to the "game" page and press any button to start/pause the game! (If you set the screensaver mode, pressing the button may take you away from the page, so you may need to start it on the settings page.)

Setting up a screensaver:

- one trigger to set the timeout
- one trigger to switch to page on timeout and start game

TIPS:

- In the game status buttons "Gen" stands for "generation" (number of turns) and "Pop" stands for "population" (the number of "live" cells). See below for details.
- You can "hide" some actions in any of the game buttons, such as changing speed or playlists
- You don't have to set _every_ button to the grid display -- the "missing" buttons will just be ignored.
- ...for example, you can dedicate one button to the game statistics. (Or using fancy logic, have it flash on once every few seconds).

## Conway's Game of Life

This project implements Conway's Game of Life on a wrap-around board(i.e. the bottom continues back at the top, and the sides are likewise connected).

While no knowledge of how the game works it required, it makes it more interesting to know how all the complexity arises from three simple rules: The basic idea of Conway's Game of Life is a very simple population simulation. On each turn (generation), every cell in a grid is evaluated for how many of its neighbors are "alive" (or "on"). The next generation is computed using three simple rules:

1. If the cell has exactly **three** live neighbors, it will be "alive" in the next generation.
2. If the cell has exactly **two** live two neighbors, it will survive to the next generation; i.e., it will stay the same as it was.
3. **All other cells** will be "dead" (off) in the next generation.

The game is starting by setting up an initial "population." People have done some amazing things with these three simple rules, and some of their designs have been included in this project. See the links in the next section for more details.

### Further reading

[The "official" website? Conwaylife.com](https://conwaylife.com/)

[Conway life exploratorium](https://conwaylife.com/forums/viewtopic.php?p=113168#p113168)

["Glossary" of Conway Terminology](http://www.radicaleye.com/lifepage/picgloss/picgloss.html)

[An even more comprehensive library of patterns](https://conwaylife.appspot.com/library/)

[Conway's Game of life (on infinite grid), with examples](https://playgameoflife.com/)

[Wikipedia's entry on Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life)

[NYT Article shortly after Conway's death (2020) -- very cool animation at the top!](https://www.nytimes.com/2020/12/28/science/math-conway-game-of-life.html)
