import { Coord } from './grid.js'
import { typeset } from './typeset.js'

export const shapes = new Map() // should be `Map<string, Coord[]>` but it causes too many spurious errors due to possible undefined
export const shapesByCategory = new Map<string, string[]>()

export function setWithCategory(shapeName: string, category: string, shape: Coord[]): void {
	shapes.set(shapeName, shape)
	const val = shapesByCategory.get(category)
	if (val === undefined) {
		shapesByCategory.set(category, [shapeName])
	} else {
		val.push(shapeName)
	}
}

// return the extent of a list of points: note that it can have negative extent
// result is [minRow, maxRow, minCol, maxCol]
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

// TODO: rotate

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

setWithCategory('point', ' point', [{ x: 0, y: 0 }]) // it's in its own category.

setWithCategory(
	'S',
	'static',
	shapeFromBitmap([
		[1, 0, 1, 1],
		[1, 1, 0, 1],
	]),
)

setWithCategory(
	'G (10x11 board)',
	'10x11',
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
	'long-lived',
	shapeFromBitmap([
		[0, 1, 1],
		[1, 1, 0],
		[0, 1, 0],
	]),
)

// also relases several gliders:
setWithCategory(
	'B-heptomino',
	'medium-lived',
	shapeFromBitmap([
		[0, 1, 0, 0],
		[1, 1, 1, 0],
		[1, 0, 1, 1],
	]),
)

setWithCategory('B-hep x 2', 'long-lived', [
	...shapes.get('B-heptomino'),
	...shiftxy(shapes.get('B-heptomino'), { y: 7, x: 14 }),
])

setWithCategory('JG sort of', 'symmetry', [
	...hmirror(shapes.get('G (10x11 board)')),
	...shiftx(shapes.get('G (10x11 board)'), 4),
])

// Wikipedia lists three shapes of indefinite growth (on an infinite plane)
setWithCategory(
	'indefinite1',
	'long-lived',
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
	'long-lived',
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
	'symmetry',
	shapeFromBitmap([
		[
			1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1,
			1,
		],
	]),
)

// block the center from killing itself due to wraparound:
setWithCategory('indefinite3 mod', 'long-lived', [
	//1389 generations
	...coordsFromArray([
		[-12, 13],
		[-12, 14],
		[-12, 15],
	]),
	...shapes.get('indefinite3'),
])

setWithCategory('indefinite3 mod2', 'long-lived', [
	//1644 (something else was 560) generations
	...coordsFromArray([
		[-12, 13],
		[-12, 14],
		[-12, 15],
		[-11, 13],
		[-11, 14],
		[-11, 15],
	]),
	...shapes.get('indefinite3'),
	...coordsFromArray([
		[12, 13],
		[12, 14],
		[12, 15],
		[13, 13],
		[13, 14],
		[13, 15],
	]),
])

setWithCategory('indefinite3 mod2b', 'long-lived', [
	//1833 generations
	...coordsFromArray([
		[-12, 12],
		[-12, 13],
		[-12, 14],
		[-12, 15],
		[-12, 16],
	]),
	...shapes.get('indefinite3'),
	...coordsFromArray([
		[13, 12],
		[13, 13],
		[13, 14],
		[13, 15],
		[13, 16],
	]),
])

setWithCategory('indefinite3 mod2c', 'long-lived', [
	//1008 generations
	...coordsFromArray([
		[-12, 11],
		[-12, 12],
		[-12, 13],
		[-12, 14],
		[-12, 15],
	]),
	...shapes.get('indefinite3'),
	...coordsFromArray([
		[13, 12],
		[13, 13],
		[13, 14],
		[13, 15],
		[13, 16],
	]),
])

// note: vertical of 10 form a recurring pattern (8 lasts 49 gen)
// entire height forms a recurring pattern of vertical lines
setWithCategory('vertical24', 'symmetry', shapeFromBitmap(new Array(24).fill([1]))) // 148 on a 30-row board; 28 gen with enough space
setWithCategory('horiz5', 'building-block', shapeFromBitmap([new Array(5).fill(1)])) //

setWithCategory('horiz5 x 5 ornamented', 'symmetry', [
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
])

setWithCategory('vert-horiz', 'long-lived', [
	...shapes.get('vertical24'),
	...shiftxy(transpose(shapes.get('vertical24')), { y: 7, x: 13 }),
])

setWithCategory('horiz x 3', 'symmetry', [
	//660 gens with symmetry
	...transpose(shapes.get('vertical24')),
	...shifty(transpose(shapes.get('vertical24')), 8),
	...shifty(transpose(shapes.get('vertical24')), 15),
])
setWithCategory(
	'robot',
	'building-block',
	shapeFromBitmap([
		[0, 1, 1, 1, 0],
		[1, 0, 0, 0, 1],
		[0, 1, 0, 1, 0],
		[0, 1, 0, 1, 0],
	]),
)

const robot = shapes.get('robot')

setWithCategory('robot x 5', 'medium-lived', [
	...robot,
	...shiftx(robot, 5 + 5 + 1),
	...shiftx(robot, 5 * 2 + 5 + 4 + 2),
	...shiftx(robot, 5 * 3 + 5 + 4 + 3 + 3),
	...shiftx(robot, 5 * 4 + 5 + 4 + 3 + 2 + 4),
])

setWithCategory(
	'pi',
	'symmetry',
	shapeFromBitmap([
		[1, 1, 1],
		[1, 0, 1],
		[1, 0, 1],
	]),
)

const pi = shapes.get('pi')

setWithCategory('pi x 5', 'long-lived', [
	// 1848 gen!
	...pi,
	...shiftx(pi, 3 + 5),
	...shiftx(pi, 3 * 2 + 5 + 4),
	...shiftx(pi, 3 * 3 + 5 + 4 + 3),
	...shiftx(pi, 3 * 4 + 5 + 4 + 3 + 2),
])

// 537 gen:
setWithCategory(
	'acorn (methuselah)',
	'long-lived',
	shapeFromBitmap([
		[0, 1, 0, 0, 0, 0, 0],
		[0, 0, 0, 1, 0, 0, 0],
		[1, 1, 0, 0, 1, 1, 1],
	]),
)

setWithCategory(
	'dove',
	'medium-lived',
	shapeFromBitmap([
		[0, 1, 1, 0, 0],
		[1, 0, 0, 1, 0],
		[0, 1, 0, 0, 1],
		[0, 0, 1, 1, 1],
	]),
)

const dove = shapes.get('dove')

setWithCategory('dove x 3', 'medium-lived', [...dove, ...shiftx(dove, 5 + 5), ...shiftx(dove, 5 * 2 + 5 + 4)])

// 496 gen
setWithCategory(
	'time bomb',
	'medium-lived',
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
	'medium-lived',
	shapeFromBitmap([
		[1, 0, 0, 0, 1, 1, 1],
		[1, 1, 1, 0, 0, 1, 0],
		[0, 1, 0, 0, 0, 0, 0],
	]),
)

// also release several gliders
setWithCategory('rabbits x 2', 'long-lived', [
	...shiftx(shapes.get('rabbits'), 19),
	...shifty(shapes.get('rabbits'), 9),
])

setWithCategory(
	'bunnies',
	'medium-lived',
	shapeFromBitmap([
		[1, 0, 0, 0, 0, 0, 1, 0],
		[0, 0, 1, 0, 0, 0, 1, 0],
		[0, 0, 1, 0, 0, 1, 0, 1],
		[0, 1, 0, 1, 0, 0, 0, 0],
	]),
)

setWithCategory('bunnies, transposed', 'medium-lived', transpose(shapes.get('bunnies')))

setWithCategory(
	'toaster',
	'continuous',
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

setWithCategory('toaster w/ guards', 'symmetry', [
	...shapes.get('toaster'),
	...shiftxy(block, { y: -4, x: 5 }),
	...shiftxy(block, { y: 13, x: 5 }),
])

setWithCategory(
	'gliderBL',
	'building-block',
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
	'building-block',
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
	'building-block',
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
	'building-block',
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
	'building-block',
	coordsFromArray([
		[0, 0],
		[0, 1],
		[0, 2],
		[1, 2],
		[2, 1],
	]),
)

setWithCategory('gliderBR and block -> pi', 'long-lived', [
	...shapes.get('gliderBR'),
	...shiftxy(block, { y: 6, x: 2 }),
	// ...shiftxy(block, { y: 5, x: 23 }),
	// ...shiftxy(block, { y: 19, x: 23 }),
	// ...shiftxy(shapes.get("gliderBR"), 15, 21),
	// ...coordsFromArray([[17,20]],
])

setWithCategory('gliderTR and block', 'symmetry', [...shifty(shapes.get('gliderTR'), 2), ...shiftx(block, 6)])
setWithCategory('gliderTR and block to beehive', 'short-lived', [
	...shifty(shapes.get('gliderTR'), 1),
	...shiftx(block, 6),
])
setWithCategory('gliderTR and block from bottom - big S', 'short-lived', [
	...shifty(shapes.get('gliderTR'), 3),
	...shiftx(block, 1),
])
setWithCategory('gliderTR and block methus.', 'long-lived', [...shifty(shapes.get('gliderTR'), 3), ...shiftx(block, 0)])
setWithCategory('gliderTR and block to pi.', 'long-lived', [...shifty(shapes.get('gliderTR'), 5), ...shiftx(block, 2)])

setWithCategory('gliders and blocks 1500', 'long-lived', [
	...shapes.get('gliderBR and block -> pi'),
	...shiftxy(shapes.get('gliderTR and block from bottom - big S'), { y: 8, x: 23 }),
])

// generates glider and block after a show
setWithCategory(
	'wing',
	'building-block',
	shapeFromBitmap([
		[1, 1, 0, 0],
		[1, 0, 1, 0],
		[1, 0, 0, 1],
		[0, 1, 1, 0],
	]),
)

setWithCategory('wing x 2', 'medium-lived', [...shiftx(shapes.get('wing'), 19), ...shifty(shapes.get('wing'), 11)])
setWithCategory('wing x 3', 'medium-lived', [
	...shiftx(shapes.get('wing'), 19),
	...shifty(shapes.get('wing'), 11),
	...shiftxy(shapes.get('wing'), { y: 15, x: 25 }),
])
setWithCategory('wing x 3b (very long)', 'long-lived', [
	...shiftx(shapes.get('wing'), 19),
	...shifty(shapes.get('wing'), 11),
	...shiftxy(shapes.get('wing'), { y: 14, x: 24 }), //34 is good too
])

// or symmetry?
setWithCategory(
	'tank',
	'building-block',
	shapeFromBitmap([
		[0, 1, 1, 0],
		[1, 1, 0, 1],
		[0, 1, 1, 0],
	]),
)

// interesting but short-lived, symmetry
setWithCategory(
	'Z-hexomino',
	'building-block',
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
	'building-block',
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

setWithCategory('block', 'static', block)

setWithCategory(
	'ship (still)',
	'static',
	shapeFromBitmap([
		[0, 1, 1],
		[1, 0, 1],
		[1, 1, 0],
	]),
)

setWithCategory(
	'loaf',
	'static',
	shapeFromBitmap([
		[0, 1, 0, 0],
		[1, 0, 1, 0],
		[1, 0, 0, 1],
		[0, 1, 1, 0],
	]),
)

setWithCategory(
	'hive (vertical)',
	'static',
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
	'static',
	shapeFromBitmap([
		[1, 1, 0, 0],
		[1, 0, 1, 0],
		[0, 0, 1, 0],
		[0, 0, 1, 1],
	]),
)

setWithCategory('fish hook (inverted)', 'static', vmirror(shapes.get('fish hook')))
setWithCategory('fish hook (reversed)', 'static', hmirror(shapes.get('fish hook')))

setWithCategory(
	'integral',
	'static',
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
	'symmetry',
	shapeFromBitmap([
		[0, 0, 0, 1, 1, 1, 0],
		[0, 1, 1, 0, 1, 0, 1],
		[1, 0, 1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1, 0, 1],
		[1, 0, 1, 0, 1, 1, 0],
		[0, 1, 1, 1, 0, 0, 0],
	]),
)

setWithCategory('H-H block', 'medium-lived', [
	...shifty(shapes.get('loaf'), 3),
	...shiftx(shapes.get('block'), 8),
	...shiftxy(shapes.get('H-H'), { y: 4, x: 12 }),
])

setWithCategory(
	'freighter',
	'continuous',
	shapeFromBitmap([
		[0, 1, 1, 1, 1, 1, 1],
		[1, 0, 0, 0, 0, 0, 1],
		[0, 0, 0, 0, 0, 0, 1],
		[0, 0, 0, 0, 0, 1, 0],
		[0, 0, 1, 1, 0, 0, 0],
	]),
)

setWithCategory('freighter x 3', 'continuous', [
	...shiftxy(shapes.get('freighter'), { y: -11, x: 10 }),
	...hmirror(shapes.get('freighter')),
	...shiftxy(shapes.get('freighter'), { y: 11, x: -10 }),
])

setWithCategory('Herschel climber', 'long-lived', [
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
	...shiftx(shapes.get('gliderBL-form2'), 15),
	...shiftx(shapes.get('loaf'), 32),
])

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

const gun_block1 = shifty(shapes.get('block'), 8)
const gun_block2 = shiftxy(shapes.get('block'), { y: 5, x: 48 })

setWithCategory('double gun', 'building-block', [
	...gun_block1,
	...gun1,
	...gun_hrefl,
	...gun_vrefl,
	...gun_hvrefl,
	...gun_block2,
])
setWithCategory('double gun, protected 55x30', 'continuous', [
	...shapes.get('double gun'),
	...shiftxy(shapes.get('fish hook (reversed)'), { y: 23, x: 11 }),
	...shiftxy(shapes.get('fish hook (inverted)'), { y: 18, x: 35 }),
])
setWithCategory('double gun protected 88x40', 'continuous', [
	...shapes.get('double gun'),
	...shifty(shapes.get('fish hook (inverted)'), 15),
	...shiftxy(shapes.get('fish hook (reversed)'), { y: -4, x: 46 }),
])

setWithCategory(
	'conway video',
	'medium-lived',
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
	'symmetry',
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
	'symmetry',
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

setWithCategory('house + mask', 'long-lived', [
	// 2937 on a 40row board!
	...transpose(shapes.get('doorbell')),
	...shiftxy(transpose(shapes.get('plunger')), { y: 1, x: 26 }),
])

setWithCategory('glider gun', 'building-block', [
	...shifty(shapes.get('block'), 5),
	...shiftxy(shapes.get('doorbell'), { y: 2, x: 5 }),
	...coordsFromArray([
		[2, 15],
		[3, 15],
		[4, 16],
	]),
	...shiftxy(hook, { y: 5, x: 15 }),
	...shiftx(shapes.get('plunger'), 23),
	...shiftxy(shapes.get('block'), { y: 3, x: 34 }),
])

setWithCategory(
	'gosper gun',
	'building-block',
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

setWithCategory('glider gun 55x30', 'continuous', [
	...shapes.get('gosper gun'),
	...shiftxy(shapes.get('fish hook'), { y: -4, x: 15 }),
])
setWithCategory('glider gun 88x40', 'continuous', [
	...shapes.get('gosper gun'),
	...shiftxy(shapes.get('fish hook'), { y: -5, x: 1 }),
])

const gliderTL2 = coordsFromArray([
	[0, 0],
	[0, 1],
	[1, 0],
	[1, 2],
	[2, 0],
])

setWithCategory('gun generator', 'curiosity', [
	...shifty(shapes.get('block'), 2),
	...shiftxy(shapes.get('ship (still)'), { y: 2, x: 8 }),
	...shiftx(shapes.get('ship (still)'), 22),
	...shiftxy(shapes.get('gliderTL'), { y: 2, x: 13 }),
	...shiftxy(shapes.get('gliderTL'), { y: 5, x: 32 }),
	...shiftxy(gliderTL2, { y: 9, x: 22 }),
	...shiftx(shapes.get('block'), 34),
])

// almost continously looping: ship grows the number of blinkers over time
setWithCategory(
	'blinker ship',
	'curiosity',
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
	'continuous',
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

setWithCategory('marquee center 55w', 'building-block', [
	...Array.from({ length: 7 }, (_val, idx) => shiftx(marqueeSegment, idx * 3)).flat(),
	...Array.from({ length: 4 }, (_val, idx) => shiftx(marqueeCar, idx * 5)).flat(),
])
setWithCategory('marquee center 88w', 'building-block', [
	...Array.from({ length: 17 }, (_val, idx) => shiftx(marqueeSegment, idx * 3)).flat(),
	...Array.from({ length: 10 }, (_val, idx) => shiftx(marqueeCar, idx * 5)).flat(),
])
setWithCategory('marquee center 60w', 'building-block', [
	...Array.from({ length: 20 }, (_val, idx) => shiftx(marqueeSegment, idx * 3)).flat(),
	...Array.from({ length: 12 }, (_val, idx) => shiftx(marqueeCar, idx * 5)).flat(),
])
setWithCategory('marquee center 60w reversed', 'building-block', hmirror(shapes.get('marquee center 60w')))

setWithCategory(
	'marquee center 60w x 3',
	'continuous',
	coordsFromArray([
		...shapes.get('marquee center 60w'),
		...shiftxy(shapes.get('marquee center 60w reversed'), { y: 8, x: 1 }),
		...shifty(shapes.get('marquee center 60w'), 16),
	]),
)

setWithCategory(
	'marquee start',
	'building-block',
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

setWithCategory('marquee end', 'building-block', [
	...transpose(shapes.get('fish hook')),
	...shiftxy(transpose(shapes.get('horiz5')), { y: 5, x: 4 }),
	...shiftxy(transpose(shapes.get('horiz5')), { y: 5, x: 6 }),
	...shifty(transpose(shapes.get('fish hook (reversed)')), 11),
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
])

setWithCategory('marquee 55w', 'continuous', [
	...shapes.get('marquee start'),
	...shiftxy(shapes.get('marquee center 55w'), { y: 4, x: 22 }),
	...shiftxy(shapes.get('marquee end'), { y: 1, x: 22 + 20 }),
])

setWithCategory('marquee 88w', 'continuous', [
	...shapes.get('marquee start'),
	...shiftxy(shapes.get('marquee center 88w'), { y: 4, x: 22 }),
	...shiftxy(shapes.get('marquee end'), { y: 1, x: 22 + 50 }),
])

setWithCategory('marquee 88w, reversed', 'continuous', hmirror(shapes.get('marquee 88w')))

// ************ LETTERS ***************

setWithCategory('Hello World', 'demo', shapeFromBitmap(typeset('Hello\nWorld'))) // 1843 generations!

setWithCategory('Life', 'demo', shapeFromBitmap(typeset('Life')))

setWithCategory('Game of Life', 'demo', shapeFromBitmap(typeset('Game of Life')))

setWithCategory('Conway Game of Life', 'demo', shapeFromBitmap(typeset("  Conway's\nGame of Life")))

setWithCategory('ABC', 'demo', shapeFromBitmap(typeset("ABCDEFGHI\nJKLMNOPQR\nSTUVWXYZ'")))

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

setWithCategory('Life w/ Marquee', 'demo', [...shapes.get('marquee center 60w'), ...life_quotes])

setWithCategory('Life, Marque persists (2-residues) 60x30', 'demo', [
	...shapes.get('Life w/ Marquee'),
	...shiftxy(block, { x: 22, y: 22 }),
	...shiftxy(block, { x: 28, y: 22 }),
	...shiftxy(block, { x: 35, y: 22 }),
])

setWithCategory('Life, Marque persists (1 residue); 60x30', 'demo', [
	...shapes.get('Life w/ Marquee'),
	...shiftxy(block, { y: 19, x: 9 }), // remove this for 2 residues
	//...shiftxy( shapes.get('fish hook (reversed)'), {y: 18, x: 7}),
	...shiftxy(block, { y: 12, x: 28 }),
	...shiftxy(block, { y: 23, x: 34 }),
])

// Life devolves to a single glider... 2574 generations!
setWithCategory('Marquee, Life -> glider; 60x30', 'demo', [
	...shapes.get('Life w/ Marquee'),
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
])
