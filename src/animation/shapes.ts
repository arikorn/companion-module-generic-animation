import { Coord, Grid } from './grid.js'
import { typeset } from './typeset.js'

export const shapes = new Map<string, Coord[]>() // should be `Map<string, Coord[]>` but it causes too many spurious errors due to possible undefined
export const shapesByCategory = new Map<string, string[]>()

// note: getShape is local to this file only since external consumers may provide an invalid name, i.e. get may return undefined.
function getShape(shapeName: string): Coord[] {
	const theShape = shapes.get(shapeName)
	if (theShape === undefined) {
		throw new Error(`Could not find shape: ${shapeName} in shapes.ts`)
	}
	return theShape
}

// add shape to the shapes Map and to one or more categories:
export function setWithCategory(shapeName: string, categories: string[], shape: Coord[]): void {
	shapes.set(shapeName, shape)
	for (const category of categories) {
		const val = shapesByCategory.get(category)
		if (val === undefined) {
			shapesByCategory.set(category, [shapeName])
		} else {
			val.push(shapeName)
		}
	}
}

// return the extent of a list of Coords: note that it can have negative coordinate values
// result is [{x:minCol, y:minRow}, {x:maxRow, , y:maxCol}]
export function getShapeExtent(shape: Coord[]): Coord[] {
	const x0 = shape[0].x
	const y0 = shape[0].y
	return shape.reduce(
		(prev, curr) => [
			{ x: Math.min(prev[0].x, curr.x), y: Math.min(prev[0].y, curr.y) },
			{ x: Math.max(prev[1].x, curr.x), y: Math.max(prev[1].y, curr.y) },
		],
		[
			{ x: x0, y: y0 }, // min
			{ x: x0, y: y0 }, // max
		],
	)
}

export function shapeArrayToGrid(shape: Coord[]): Grid {
	const [min, max] = getShapeExtent(shape)
	const [rows, columns] = [max.y - min.y + 1, max.x - min.x + 1]
	const result = new Grid({ y: rows, x: columns }, 0)
	result.setShape(shape, false, { y: -min.y, x: -min.x })
	return result
}

// shift a shape along the x axis (columns)
export function shiftx(coords: Coord[], offs: number): Coord[] {
	return coords.map((bit) => ({ x: bit.x + offs, y: bit.y }))
}

export function shifty(coords: Coord[], offs: number): Coord[] {
	return coords.map((bit) => ({ x: bit.x, y: bit.y + offs }))
}

export function shiftxy(coords: Coord[], offs: Coord): Coord[] {
	return coords.map((bit) => ({ x: bit.x + offs.x, y: bit.y + offs.y }))
}

export function transpose(coords: Coord[]): Coord[] {
	return coords.map((bit) => ({ x: bit.y, y: bit.x }))
}

export function hmirror(coords: Coord[]): Coord[] {
	const maxx = coords.reduce((maxval, newval) => Math.max(maxval, newval.x), -Infinity)
	return coords.map((bit) => ({ x: maxx - bit.x, y: bit.y }))
}

export function vmirror(coords: Coord[]): Coord[] {
	const maxy = coords.reduce((maxval, newval) => Math.max(maxval, newval.y), -Infinity)
	return coords.map((bit) => ({ x: bit.x, y: maxy - bit.y }))
}

export function rotate90cw(coords: Coord[]): Coord[] {
	return hmirror(transpose(coords))
}

export function rotate90ccw(coords: Coord[]): Coord[] {
	return vmirror(transpose(coords))
}

export function rotate180(coords: Coord[]): Coord[] {
	return vmirror(hmirror(coords))
}

export function shapeFromBitmap(bits: number[][]): Coord[] {
	const result: Coord[] = []
	for (let y = 0; y < bits.length; y++) {
		const rowVals = bits[y]
		for (let x = 0; x < rowVals.length; x++) {
			if (rowVals[x] > 0) {
				result.push({ x: x, y: y })
			}
		}
	}
	return result
}

// for now, just use my "matrix-style" ordering, for compatibility
//   so array coords are [[row, col], ...], i.e. [[y, x], ...]
function coordsFromArray(coords: number[][]): Coord[] {
	return coords.map((val) => ({ x: val[1], y: val[0] }))
}

// *************** 10x11 board stats *****
// "G": 63
// wing: 66;
// conway video: 142
// glider TR & block methus: 146
// glider and blocks 1500 gets 200

//building blocks:
const block = shapeFromBitmap([
	[1, 1],
	[1, 1],
])

setWithCategory('point', ['xx building-block'], [{ x: 0, y: 0 }]) // it's in its own category.

setWithCategory(
	'S',
	['xx building-block', 'static'],
	shapeFromBitmap([
		[1, 0, 1, 1],
		[1, 1, 0, 1],
	]),
)

setWithCategory(
	'G',
	['works on 10x11 board', 'short-lived'],
	shapeFromBitmap([
		[1, 1, 1],
		[1, 0, 0],
		[1, 0, 1],
		[1, 0, 1],
		[1, 1, 1],
	]),
)

setWithCategory(
	'R-pentomino',
	['long-lived', 'atomic', 'classic'],
	shapeFromBitmap([
		[0, 1, 1],
		[1, 1, 0],
		[0, 1, 0],
	]),
)

// also relases several gliders:
setWithCategory(
	'B-heptomino',
	['medium-lived', 'atomic', 'classic'],
	shapeFromBitmap([
		[0, 1, 0, 0],
		[1, 1, 1, 0],
		[1, 0, 1, 1],
	]),
)

setWithCategory(
	'B-hep x 2',
	['long-lived'],
	[...getShape('B-heptomino'), ...shiftxy(getShape('B-heptomino'), { y: 7, x: 14 })],
)

setWithCategory('JG sort of', ['symmetry', 'long-lived'], [...hmirror(getShape('G')), ...shiftx(getShape('G'), 4)])

// Wikipedia lists three shapes of indefinite growth (on an infinite plane)
setWithCategory(
	'indefinite1',
	['long-lived', 'classic'],
	shapeFromBitmap([
		[1, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0],
		[1, 1, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0],
		[0, 0, 1, 1, 1, 0],
		[0, 0, 0, 0, 0, 0],
		[0, 0, 0, 1, 1, 1],
		[0, 0, 0, 0, 1, 0],
	]),
)

// also releases several gliders:
setWithCategory(
	'indefinite2',
	['long-lived', 'classic'],
	shapeFromBitmap([
		[1, 1, 1, 0, 1],
		[1, 0, 0, 0, 0],
		[0, 0, 0, 1, 1],
		[0, 1, 1, 0, 1],
		[1, 0, 1, 0, 1],
	]),
)

// can't get much out of this one on 55x30 and it's too long to transpose...
setWithCategory(
	'indefinite3',
	['symmetry', 'medium-lived', 'classic'],
	shapeFromBitmap([
		[
			1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1,
			1,
		],
	]),
)

// block the center from killing itself due to wraparound:
setWithCategory(
	'indefinite3 mod',
	['long-lived'],
	[
		//1389 generations
		...coordsFromArray([
			[-12, 13],
			[-12, 14],
			[-12, 15],
		]),
		...getShape('indefinite3'),
	],
)

setWithCategory(
	'indefinite3 mod2',
	['long-lived'],
	[
		//1644 (something else was 560) generations
		...coordsFromArray([
			[-12, 13],
			[-12, 14],
			[-12, 15],
			[-11, 13],
			[-11, 14],
			[-11, 15],
		]),
		...getShape('indefinite3'),
		...coordsFromArray([
			[12, 13],
			[12, 14],
			[12, 15],
			[13, 13],
			[13, 14],
			[13, 15],
		]),
	],
)

setWithCategory(
	'indefinite3 mod2b',
	['long-lived'],
	[
		//1833 generations
		...coordsFromArray([
			[-12, 12],
			[-12, 13],
			[-12, 14],
			[-12, 15],
			[-12, 16],
		]),
		...getShape('indefinite3'),
		...coordsFromArray([
			[13, 12],
			[13, 13],
			[13, 14],
			[13, 15],
			[13, 16],
		]),
	],
)

setWithCategory(
	'indefinite3 mod2c',
	['long-lived'],
	[
		//1008 generations
		...coordsFromArray([
			[-12, 11],
			[-12, 12],
			[-12, 13],
			[-12, 14],
			[-12, 15],
		]),
		...getShape('indefinite3'),
		...coordsFromArray([
			[13, 12],
			[13, 13],
			[13, 14],
			[13, 15],
			[13, 16],
		]),
	],
)

// note: vertical of 10 form a recurring pattern (8 lasts 49 gen)
// entire height forms a recurring pattern of vertical lines
setWithCategory('vertical24', ['symmetry', 'medium-lived', 'pretty'], shapeFromBitmap(new Array(24).fill([1]))) // 148 on a 30-row board; 28 gen with enough space
setWithCategory('horiz5', ['xx building-block', 'short-lived'], shapeFromBitmap([new Array(5).fill(1)])) //

setWithCategory(
	'horiz5 x 5 ornamented',
	['symmetry', 'long-lived', 'pretty'],
	[
		//553
		...shapeFromBitmap([
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
			[0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
			[0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0],
		]),
		...coordsFromArray([
			[10, 16],
			[11, 15],
			[11, 17],
			[12, 16],
		]),
	],
)

setWithCategory(
	'vert-horiz',
	['long-lived'],
	[...getShape('vertical24'), ...shiftxy(transpose(getShape('vertical24')), { y: 7, x: 13 })],
)

setWithCategory(
	'horiz x 3',
	['symmetry', 'long-lived'],
	[
		//660 gens with symmetry
		...transpose(getShape('vertical24')),
		...shifty(transpose(getShape('vertical24')), 8),
		...shifty(transpose(getShape('vertical24')), 15),
	],
)

setWithCategory(
	'pi',
	['symmetry', 'atomic', 'medium-lived', 'pretty'],
	shapeFromBitmap([
		[1, 1, 1],
		[1, 0, 1],
		[1, 0, 1],
	]),
)

const pi = getShape('pi')

setWithCategory(
	'pi x 5',
	['long-lived'],
	[
		// 1848 gen!
		...pi,
		...shiftx(pi, 3 + 5),
		...shiftx(pi, 3 * 2 + 5 + 4),
		...shiftx(pi, 3 * 3 + 5 + 4 + 3),
		...shiftx(pi, 3 * 4 + 5 + 4 + 3 + 2),
	],
)

// 537 gen:
setWithCategory(
	'acorn (methuselah)',
	['long-lived', 'classic', 'atomic'],
	shapeFromBitmap([
		[0, 1, 0, 0, 0, 0, 0],
		[0, 0, 0, 1, 0, 0, 0],
		[1, 1, 0, 0, 1, 1, 1],
	]),
)

setWithCategory(
	'dove',
	['medium-lived', 'classic', 'atomic'],
	shapeFromBitmap([
		[0, 1, 1, 0, 0],
		[1, 0, 0, 1, 0],
		[0, 1, 0, 0, 1],
		[0, 0, 1, 1, 1],
	]),
)

const dove = getShape('dove')

setWithCategory('dove x 3', ['medium-lived'], [...dove, ...shiftx(dove, 5 + 5), ...shiftx(dove, 5 * 2 + 5 + 4)])

// 496 gen
setWithCategory(
	'time bomb',
	['medium-lived', 'classic'],
	shapeFromBitmap([
		[0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
		[1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
		[0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
		[0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0],
		[0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
		[0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	]),
)

setWithCategory(
	'rabbits',
	['medium-lived', 'classic'],
	shapeFromBitmap([
		[1, 0, 0, 0, 1, 1, 1],
		[1, 1, 1, 0, 0, 1, 0],
		[0, 1, 0, 0, 0, 0, 0],
	]),
)

// also release several gliders
setWithCategory('rabbits x 2', ['long-lived'], [...shiftx(getShape('rabbits'), 19), ...shifty(getShape('rabbits'), 9)])

setWithCategory(
	'bunnies',
	['medium-lived', 'classic'],
	shapeFromBitmap([
		[1, 0, 0, 0, 0, 0, 1, 0],
		[0, 0, 1, 0, 0, 0, 1, 0],
		[0, 0, 1, 0, 0, 1, 0, 1],
		[0, 1, 0, 1, 0, 0, 0, 0],
	]),
)

setWithCategory('bunnies, transposed', ['medium-lived', 'classic'], transpose(getShape('bunnies')))

setWithCategory(
	'toaster',
	['continuous'],
	shapeFromBitmap([
		[0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0],
		[0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
		[0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0],
		[0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
		[0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0],
		[0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
		[0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1],
		[1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1],
	]),
)

setWithCategory(
	'toaster w/ guards',
	['symmetry', 'medium-lived'],
	[...getShape('toaster'), ...shiftxy(block, { y: -4, x: 5 }), ...shiftxy(block, { y: 13, x: 5 })],
)

setWithCategory(
	'gliderBL',
	['xx building-block', 'continuous', 'atomic'],
	coordsFromArray([
		[0, 1],
		[1, 0],
		[2, 0],
		[2, 1],
		[2, 2],
	]),
)

setWithCategory(
	'gliderBL-form2',
	['xx building-block', 'continuous', 'atomic'],
	coordsFromArray([
		[0, 0],
		[0, 2],
		[1, 0],
		[1, 1],
		[2, 1],
	]),
)

setWithCategory(
	'gliderBR',
	['xx building-block', 'continuous', 'atomic'],
	coordsFromArray([
		[0, 1],
		[1, 2],
		[2, 0],
		[2, 1],
		[2, 2],
	]),
)

setWithCategory(
	'gliderTL',
	['xx building-block', 'continuous', 'atomic'],
	coordsFromArray([
		[0, 0],
		[0, 1],
		[0, 2],
		[1, 0],
		[2, 1],
	]),
)

setWithCategory(
	'gliderTR',
	['xx building-block', 'continuous', 'atomic'],
	coordsFromArray([
		[0, 0],
		[0, 1],
		[0, 2],
		[1, 2],
		[2, 1],
	]),
)

setWithCategory(
	'gliderBR and block becomes pi',
	['long-lived', 'glider construction', 'symmetry'],
	[...getShape('gliderBR'), ...shiftxy(block, { y: 6, x: 2 })],
)

// setWithCategory(
// 	'gliderTR and block', // goes to sideways pi, so is the same as previous
// 	['symmetry', 'glider construction', 'short-lived'],
// 	[...shifty(getShape('gliderTR'), 2), ...shiftx(block, 6)],
// )

setWithCategory(
	'gliderTR and block to beehive',
	['short-lived', 'glider construction'],
	[...shifty(getShape('gliderTR'), 1), ...shiftx(block, 6)],
)
setWithCategory(
	'gliderTR and block from bottom becomes H-H', // big S close to end
	['short-lived', 'glider construction'],
	[...shifty(getShape('gliderTR'), 3), ...shiftx(block, 1)],
)
setWithCategory(
	'gliderTR and block methus.',
	['long-lived', 'glider construction', 'works on 10x11 board'],
	[...shifty(getShape('gliderTR'), 3), ...shiftx(block, 0)],
)

setWithCategory(
	'gliders and blocks 1500 gen',
	['long-lived', 'glider construction', 'works on 10x11 board'],
	[
		...getShape('gliderBR and block becomes pi'),
		...shiftxy(getShape('gliderTR and block from bottom becomes H-H'), { y: 8, x: 23 }),
	],
)

// generates glider and block after a show
setWithCategory(
	'wing',
	['xx building-block', 'glider generator', 'works on 10x11 board'],
	shapeFromBitmap([
		[1, 1, 0, 0],
		[1, 0, 1, 0],
		[1, 0, 0, 1],
		[0, 1, 1, 0],
	]),
)

setWithCategory(
	'wing x 2',
	['medium-lived', 'glider generator'],
	[...shiftx(getShape('wing'), 19), ...shifty(getShape('wing'), 11)],
)
// setWithCategory('wing x 3m', ['medium-lived', 'glider generator'], [
// 	...shiftx(getShape('wing'), 19),
// 	...shifty(getShape('wing'), 11),
// 	...shiftxy(getShape('wing'), { y: 15, x: 25 }),
// ])

// 1129 gen on 55x30
setWithCategory(
	'wing x 3',
	['long-lived', 'glider generator'],
	[
		...shiftx(getShape('wing'), 19),
		...shifty(getShape('wing'), 11),
		...shiftxy(getShape('wing'), { y: 14, x: 24 }), //34 is good too
	],
)

// or symmetry?
setWithCategory(
	'tank',
	['atomic', 'symmetry', 'short-lived'],
	shapeFromBitmap([
		[0, 1, 1, 0],
		[1, 1, 0, 1],
		[0, 1, 1, 0],
	]),
)

// interesting but short-lived, symmetry
setWithCategory(
	'Z-hexomino',
	['atomic', 'classic', 'short-lived'],
	shapeFromBitmap([
		[1, 1, 0],
		[0, 1, 0],
		[0, 1, 0],
		[0, 1, 1],
	]),
)

// 2-step cycle
setWithCategory(
	'barberpole',
	['xx building-block', 'continuous', 'classic'],
	coordsFromArray([
		[0, 0],
		[0, 1],
		[1, 0],
		[2, 1],
		[2, 3],
		[4, 3],
		[4, 5],
		[5, 6],
		[6, 5],
		[6, 6],
	]),
)

// Still-lifes

setWithCategory('block', ['static'], block)

setWithCategory(
	'ship (still)',
	['static'],
	shapeFromBitmap([
		[0, 1, 1],
		[1, 0, 1],
		[1, 1, 0],
	]),
)

setWithCategory(
	'loaf',
	['static'],
	shapeFromBitmap([
		[0, 1, 0, 0],
		[1, 0, 1, 0],
		[1, 0, 0, 1],
		[0, 1, 1, 0],
	]),
)

setWithCategory(
	'hive (vertical)',
	['static'],
	coordsFromArray([
		[0, 1],
		[1, 0],
		[1, 2],
		[2, 0],
		[2, 2],
		[3, 1],
	]),
)

//  (static, eater)
setWithCategory(
	'fish hook',
	['static'],
	shapeFromBitmap([
		[1, 1, 0, 0],
		[1, 0, 1, 0],
		[0, 0, 1, 0],
		[0, 0, 1, 1],
	]),
)

setWithCategory('fish hook (inverted)', ['static'], vmirror(getShape('fish hook')))
setWithCategory('fish hook (reversed)', ['static'], hmirror(getShape('fish hook')))

setWithCategory(
	'integral',
	['static'],
	shapeFromBitmap([
		[0, 0, 0, 1, 1],
		[0, 0, 1, 0, 1],
		[0, 0, 1, 0, 0],
		[1, 0, 1, 0, 0],
		[1, 1, 0, 0, 0],
	]),
)

setWithCategory(
	'H-H',
	['symmetry', 'medium-lived'],
	shapeFromBitmap([
		[0, 0, 0, 1, 1, 1, 0],
		[0, 1, 1, 0, 1, 0, 1],
		[1, 0, 1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1, 0, 1],
		[1, 0, 1, 0, 1, 1, 0],
		[0, 1, 1, 1, 0, 0, 0],
	]),
)

setWithCategory(
	'H-H block',
	['medium-lived'],
	[...shifty(getShape('loaf'), 3), ...shiftx(getShape('block'), 8), ...shiftxy(getShape('H-H'), { y: 4, x: 12 })],
)

setWithCategory(
	'freighter',
	['continuous', 'classic'],
	shapeFromBitmap([
		[0, 1, 1, 1, 1, 1, 1],
		[1, 0, 0, 0, 0, 0, 1],
		[0, 0, 0, 0, 0, 0, 1],
		[0, 0, 0, 0, 0, 1, 0],
		[0, 0, 1, 1, 0, 0, 0],
	]),
)

setWithCategory(
	'freighter x 3',
	['continuous', 'classic'],
	[
		...shiftxy(getShape('freighter'), { y: -11, x: 10 }),
		...hmirror(getShape('freighter')),
		...shiftxy(getShape('freighter'), { y: 11, x: -10 }),
	],
)

setWithCategory(
	'freighter x 3 9x8 button',
	['continuous', 'classic'],
	[
		...shiftxy(getShape('freighter'), { y: -8, x: 9 }),
		...hmirror(getShape('freighter')),
		...shiftxy(getShape('freighter'), { y: 8, x: -10 }),
	],
)

setWithCategory(
	'Herschel climber',
	['long-lived', 'glider generator', 'glider construction', 'pretty'],
	[
		//1429 on 40row, 1535 on 30row
		...coordsFromArray([
			[12, 0],
			[13, 0],
			[13, 2],
			[14, 0],
			[14, 1],
			[14, 2],
			[15, 2],
		]),
		...shiftx(getShape('gliderBL-form2'), 15),
		...shiftx(getShape('loaf'), 32),
	],
)

const gun = coordsFromArray([
	[0, 0],
	[1, 0],
	[1, 1],
	[2, 1],
	[2, 2],
	[3, 0],
	[3, 1],
])

const gun1 = shiftx(gun, 17)
const gun_vrefl = gun.map((val) => ({ y: 3 - val.y + 7, x: val.x + 17 }))

const gun_hrefl = gun.map((val) => ({ y: val.y + 4, x: 2 - val.x + 30 }))
const gun_hvrefl = gun.map((val) => ({ y: 3 - val.y + 11, x: 2 - val.x + 30 }))

const gun_block1 = shifty(getShape('block'), 8)
const gun_block2 = shiftxy(getShape('block'), { y: 5, x: 48 })

setWithCategory(
	'double gun',
	['xx building-block', 'glider generator'],
	[...gun_block1, ...gun1, ...gun_hrefl, ...gun_vrefl, ...gun_hvrefl, ...gun_block2],
)
setWithCategory(
	'double gun, protected on 55x30',
	['continuous', 'glider generator'],
	[
		...getShape('double gun'),
		...shiftxy(getShape('fish hook (reversed)'), { y: 23, x: 11 }),
		...shiftxy(getShape('fish hook (inverted)'), { y: 18, x: 35 }),
	],
)
setWithCategory(
	'double gun, protected on 88x40',
	['continuous', 'glider generator'],
	[
		...getShape('double gun'),
		...shifty(getShape('fish hook (inverted)'), 15),
		...shiftxy(getShape('fish hook (reversed)'), { y: -4, x: 46 }),
	],
)

setWithCategory(
	'conway video',
	['medium-lived', 'classic', 'works on 10x11 board'],
	shapeFromBitmap([
		[0, 0, 0, 0, 0, 0, 1, 0],
		[0, 0, 0, 0, 1, 0, 1, 1],
		[0, 0, 0, 0, 1, 0, 1, 0],
		[0, 0, 0, 0, 1, 0, 0, 0],
		[0, 0, 1, 0, 0, 0, 0, 0],
		[1, 0, 1, 0, 0, 0, 0, 0],
	]),
)

setWithCategory(
	'doorbell',
	['symmetry', 'medium-lived'],
	shapeFromBitmap([
		[0, 0, 0, 1, 0],
		[0, 0, 1, 0, 1],
		[0, 1, 0, 1, 1],
		[1, 1, 0, 1, 1],
		[0, 1, 0, 1, 1],
		[0, 0, 1, 0, 1],
		[0, 0, 0, 1, 0],
	]),
)

setWithCategory(
	'plunger',
	['symmetry', 'medium-lived'],
	shapeFromBitmap([
		[1, 0, 1, 0, 0, 0, 0],
		[1, 0, 0, 1, 0, 0, 0],
		[0, 0, 0, 1, 1, 0, 0],
		[0, 1, 0, 0, 0, 1, 1],
		[0, 0, 0, 1, 1, 0, 0],
		[1, 0, 0, 1, 0, 0, 0],
		[1, 0, 1, 0, 0, 0, 0],
	]),
)

const hook = coordsFromArray([
	[0, 4],
	[0, 5],
	[1, 0],
	[1, 1],
	[1, 2],
	[1, 5],
	[2, 2],
	[2, 3],
	[2, 4],
	[2, 5],
	[3, 3],
	[3, 4],
])

setWithCategory(
	'house + mask',
	['medium-lived'],
	[
		// but 2937 on a 40row board!
		...transpose(getShape('doorbell')),
		...shiftxy(transpose(getShape('plunger')), { y: 1, x: 26 }),
	],
)

setWithCategory(
	'glider gun',
	['xx building-block', 'glider generator'],
	[
		...shifty(getShape('block'), 5),
		...shiftxy(getShape('doorbell'), { y: 2, x: 5 }),
		...coordsFromArray([
			[2, 15],
			[3, 15],
			[4, 16],
		]),
		...shiftxy(hook, { y: 5, x: 15 }),
		...shiftx(getShape('plunger'), 23),
		...shiftxy(getShape('block'), { y: 3, x: 34 }),
	],
)

setWithCategory(
	'gosper gun',
	['xx building-block', 'classic', 'glider generator'],
	shapeFromBitmap([
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
		[1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	]),
)

setWithCategory(
	'glider gun protected on 55x30',
	['continuous', 'glider generator'],
	[...getShape('gosper gun'), ...shiftxy(getShape('fish hook'), { y: -4, x: 15 })],
)
setWithCategory(
	'glider gun protected on 88x40',
	['continuous', 'glider generator'],
	[...getShape('gosper gun'), ...shiftxy(getShape('fish hook'), { y: -5, x: 1 })],
)

const gliderTL2 = coordsFromArray([
	[0, 0],
	[0, 1],
	[1, 0],
	[1, 2],
	[2, 0],
])

setWithCategory(
	'glider gun generator',
	['curiosity', 'glider generator', 'glider construction'],
	[
		...shifty(getShape('block'), 2),
		...shiftxy(getShape('ship (still)'), { y: 2, x: 8 }),
		...shiftx(getShape('ship (still)'), 22),
		...shiftxy(getShape('gliderTL'), { y: 2, x: 13 }),
		...shiftxy(getShape('gliderTL'), { y: 5, x: 32 }),
		...shiftxy(gliderTL2, { y: 9, x: 22 }),
		...shiftx(getShape('block'), 34),
	],
)

// almost continously looping: ship grows the number of blinkers over time
setWithCategory(
	'blinker ship - grows',
	['curiosity'],
	shapeFromBitmap([
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1],
		[0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1],
		[0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1],
		[0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	]),
)

setWithCategory(
	'twin bees shuttle',
	['continuous'],
	shapeFromBitmap([
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
		[1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	]),
)

const marqueeSegment = coordsFromArray([
	[0, 0],
	[1, 0],
	[1, 1],
	[1, 2],
	[7, 0],
	[7, 1],
	[7, 2],
	[8, 0],
])

const marqueeCar = coordsFromArray([
	[3, 0],
	[3, 1],
	[3, 2],
	[4, 2],
	[4, 3],
	[5, 0],
	[5, 1],
	[5, 2],
])

setWithCategory(
	'marquee center 55w',
	['xx building-block'],
	[
		...Array.from({ length: 7 }, (_val, idx) => shiftx(marqueeSegment, idx * 3)).flat(),
		...Array.from({ length: 4 }, (_val, idx) => shiftx(marqueeCar, idx * 5)).flat(),
	],
)
setWithCategory(
	'marquee center 88w',
	['xx building-block'],
	[
		...Array.from({ length: 17 }, (_val, idx) => shiftx(marqueeSegment, idx * 3)).flat(),
		...Array.from({ length: 10 }, (_val, idx) => shiftx(marqueeCar, idx * 5)).flat(),
	],
)
setWithCategory(
	'marquee center 60w',
	['xx building-block', 'works only with 60x30', 'continuous'],
	[
		...Array.from({ length: 20 }, (_val, idx) => shiftx(marqueeSegment, idx * 3)).flat(),
		...Array.from({ length: 12 }, (_val, idx) => shiftx(marqueeCar, idx * 5)).flat(),
	],
)
setWithCategory(
	'marquee center 60w reversed',
	['xx building-block', 'works only with 60x30', 'continuous'],
	hmirror(getShape('marquee center 60w')),
)

setWithCategory(
	'marquee center x 3 for 60w',
	['continuous', 'works only with 60x30'],
	[
		...getShape('marquee center 60w'),
		...shiftxy(getShape('marquee center 60w reversed'), { y: 8, x: 1 }),
		...shifty(getShape('marquee center 60w'), 16),
	],
)

setWithCategory(
	'marquee start',
	['xx building-block'],
	shapeFromBitmap([
		[0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1],
		[1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0],
		[1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 0],
		[0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0],
		[1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 0],
		[0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1],
		[0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0],
	]),
)

setWithCategory(
	'marquee end',
	['xx building-block'],
	[
		...transpose(getShape('fish hook')),
		...shiftxy(transpose(getShape('horiz5')), { y: 5, x: 4 }),
		...shiftxy(transpose(getShape('horiz5')), { y: 5, x: 6 }),
		...shifty(transpose(getShape('fish hook (reversed)')), 11),
		...coordsFromArray([
			[4, 1],
			[4, 3],
			[4, 5],
			[5, 2],
			[6, 0],
			[6, 2],
			[7, 7],
			[8, 0],
			[8, 2],
			[9, 2],
			[10, 1],
			[10, 3],
			[10, 5],
		]),
	],
)

setWithCategory(
	'marquee 55w',
	['continuous'],
	[
		...getShape('marquee start'),
		...shiftxy(getShape('marquee center 55w'), { y: 4, x: 22 }),
		...shiftxy(getShape('marquee end'), { y: 1, x: 22 + 20 }),
	],
)

setWithCategory(
	'marquee 88w',
	['continuous'],
	[
		...getShape('marquee start'),
		...shiftxy(getShape('marquee center 88w'), { y: 4, x: 22 }),
		...shiftxy(getShape('marquee end'), { y: 1, x: 22 + 50 }),
	],
)

setWithCategory('marquee 88w, reversed', ['continuous'], hmirror(getShape('marquee 88w')))

// ************ LETTERS ***************

setWithCategory('Hello World', ['text demo'], shapeFromBitmap(typeset('Hello\nWorld'))) // 1843 generations!

setWithCategory('Life', ['text demo'], shapeFromBitmap(typeset('Life')))

setWithCategory('Game of Life', ['text demo'], shapeFromBitmap(typeset('Game of Life')))

setWithCategory('Conway Game of Life', ['text demo'], shapeFromBitmap(typeset("  Conway's\nGame of Life")))

setWithCategory('ABC', ['text demo'], shapeFromBitmap(typeset("ABCDEFGHI\nJKLMNOPQR\nSTUVWXYZ'")))

const life_quotes = shiftxy(
	shapeFromBitmap([
		[1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
		[1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
		[0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 0],
		[0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0],
		[0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
	]),
	{ x: 18, y: 12 },
)

setWithCategory('Life w/ Marquee', ['demo'], [...getShape('marquee center 60w'), ...life_quotes])

setWithCategory(
	'Life, Marque persists (2-residues) 60x30',
	['demo', 'continuous'],
	[
		...getShape('Life w/ Marquee'),
		...shiftxy(block, { x: 22, y: 22 }),
		...shiftxy(block, { x: 28, y: 22 }),
		...shiftxy(block, { x: 35, y: 22 }),
	],
)

setWithCategory(
	'Life, Marque persists (1 residue); 60x30',
	['demo', 'continuous'],
	[
		...getShape('Life w/ Marquee'),
		...shiftxy(block, { y: 19, x: 9 }), // remove this for 2 residues
		//...shiftxy( getShape('fish hook (reversed)'), {y: 18, x: 7}),
		...shiftxy(block, { y: 12, x: 28 }),
		...shiftxy(block, { y: 23, x: 34 }),
	],
)

// Life devolves to a single glider... 2574 generations!
setWithCategory(
	'Marquee, Life -> glider; 60x30',
	['demo', 'long-lived', 'pretty'],
	[
		...getShape('Life w/ Marquee'),
		...shiftxy(
			shapeFromBitmap([
				[1, 0],
				[1, 1],
			]),
			{ y: 18, x: 18 },
		),
		...shiftxy(block, { y: 12, x: 28 }),
		...shiftxy(block, { y: 22, x: 34 }),
		...shiftxy(
			shapeFromBitmap([
				[0, 1],
				[1, 1],
			]),
			{ y: 18, x: 39 },
		),
	],
)
