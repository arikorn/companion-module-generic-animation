# Low-Res "Screensaver" & Conway's Game of Life

This module implements a low-resolution "screensaver" in Companion that allows you to treat all the buttons of a
surface as a unified screen for animations.

Currently implemented are simple wipe transitions in the four cardinal directions and...

## Conway's Game of Life

This project implements Conway's Game of Life with or without wrap-around (i.e. the bottom continues back at the top, and the sides are likewise connected).

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
