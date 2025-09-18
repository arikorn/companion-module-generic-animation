// A grid or matrix object

export interface Coord {
	x: number
	y: number
}

export enum Wipe {
	Up, // defaults to 0
	Down, // defaults to 1
	Left, // defaults to 2
	Right, // defaults to 3
}

export type BinaryFn = (a: number, b: number) => number

export const plus: BinaryFn = (a, b) => a + b
export const multiply: BinaryFn = (a, b) => a * b
export const min: BinaryFn = (a, b) => Math.min(a, b)
export const max: BinaryFn = (a, b) => Math.max(a, b)

//export const equals:BinaryFn = (a, b) => a === b

export class Grid extends Array<Array<number>> {
	//data: number[][]

	constructor(nrow: number, ncol: number, initval: number = 0) {
		super(nrow)
		for (let r = 0; r < nrow; r++) {
			this[r] = new Array(ncol).fill(initval)
		}
	}

	copy(): Grid {
		const n = this.nrow()
		const result = new Grid(this.nrow(), 0) // just need an empty object
		for (let r = 0; r < n; r++) {
			result[r] = this[r].slice()
		}
		return result
	}

	nrow(): number {
		// rows are outer for now
		return this.length
	}

	ncol(): number {
		// rows are outer for now
		return this.length > 0 ? this[0].length : 0
	}

	getRow(idx: number): number[] {
		return this[idx]
	}

	val(idx: Coord): number {
		return this[idx.y][idx.x]
	}

	set(idx: Coord, val: number): void {
		this[idx.y][idx.x] = val
	}

	wipe(dir: Wipe, fromGrid: Grid | null = null, pos = 0): Grid {
		switch (dir) {
			case Wipe.Left:
			case Wipe.Right:
				return this.colShift(dir === Wipe.Left, fromGrid, pos)
			case Wipe.Up:
			case Wipe.Down:
				return this.rowShift(dir === Wipe.Up, fromGrid, pos)
		}
	}

	wrap(dir: Wipe): Grid {
		switch (dir) {
			case Wipe.Left:
				return this.colShift(true, this, 0)
			case Wipe.Right:
				return this.colShift(false, this, this.ncol() - 1)
			case Wipe.Up:
				return this.rowShift(true, this, 0)
			case Wipe.Down:
				return this.rowShift(false, this, this.nrow() - 1)
		}
	}

	//  shift up, possibly replacing with other data.
	//   Note that rowShift(false, this, 0), for example, will wrap around
	rowShift(up = false, newRow: number[] | Grid | null = null, newRowIdx = 0): Grid {
		const result = this.copy()
		if (newRow === null) {
			newRow = new Array(this.ncol()).fill(0)
		} else if (newRow instanceof Grid) {
			if (newRow === this && newRowIdx === (up ? 0 : this.length - 1)) {
				newRow = newRow[newRowIdx] // we're wrapping, just reuse discarded row
			} else {
				newRow = newRow[newRowIdx].slice() // make a copy, to be safe
			}
		}
		if (up) {
			result.shift() // remove first, then add 0 to end
			result.push(newRow)
		} else {
			result.pop() // remove last, then add 0 to beginning
			result.unshift(newRow)
		}
		return result
	}

	// shift left/right, replacing the removed element with either 0 or the specified new value
	//   newCol has to have at least as many elements (if array) or rows (if Grid) as "this"
	//   newColIdx is required if newCol is a Grid instance.
	// Note that: colShift(true, this, 0), for example, will wrap around
	colShift(left = false, newCol: number[] | Grid | null = null, newColIdx = 0): Grid {
		const result = this.copy()
		//  This works too, though it may produce more transient garbage??
		// let newCol2:number[]|null

		// if (newCol instanceof Grid) {
		//     newCol2 = newCol.map(row => row[newColIdx]) // extract the column
		// } else {
		//     newCol2 = newCol
		// }
		if (left) {
			result.forEach((row, idx) => {
				// remove first, add 0 to end
				row.shift()
				row.push(newCol === null ? 0 : newCol instanceof Grid ? newCol[idx][newColIdx] : newCol[idx])
			})
		} else {
			result.forEach((row, idx) => {
				// remove last, add 0 to beginning
				row.pop()
				row.unshift(newCol === null ? 0 : newCol instanceof Grid ? newCol[idx][newColIdx] : newCol[idx])
			})
		}
		return result
	}

	// note: toggle is not generalized: it will set the value to 0 or val (or 1 if val is missing)
	//  coordinates are expressed as a nested array [[x1,y1,val1?], [x2,y2,val2?], ...]
	//   "val" is optional and defaults to 1
	setShape(idx: number[][], toggle = false, offset = [0, 0]): void {
		idx.forEach((coord) => {
			let row = coord[0] + offset[0]
			let col = coord[1] + offset[1]
			const val = coord.length > 2 ? coord[2] : 1
			while (row + 1 > this.nrow()) {
				// wrap values
				row -= this.nrow()
			}
			while (row < 0) {
				// wrap values
				row += this.nrow()
			}
			while (col + 1 > this.ncol()) {
				col -= this.ncol()
			}
			while (col < 0) {
				col += this.ncol()
			}
			this[row][col] = toggle ? Number(!this[row][col]) * val : val
		})
	}

	getShape(simplify = true): number[][] {
		let result = []
		for (let r = 0; r < this.length; r++) {
			const row = this[r]
			for (let c = 0; c < row.length; c++) {
				if (row[c] > 0) result.push([r, c])
			}
		}
		if (simplify && result.length > 0) {
			const coord_min = result.reduce((gmin, val) => [Math.min(gmin[0], val[0]), Math.min(gmin[1], val[1])], result[0])
			result = result.map((val) => [val[0] - coord_min[0], val[1] - coord_min[1]])
		}
		return result
	}

	reduceAll(op: (a: number, b: number) => number): number {
		// for some reason, a nested reduce didn't work...
		//const level1 = this.present.map(val => val.reduce((rowTotal, cellVal)=> rowTotal + cellVal, 0))
		return this.reduce(
			(total, rowArray) =>
				op(
					total,
					rowArray.reduce((rowTotal, cellVal) => op(rowTotal, cellVal), 0),
				),
			0,
		)
	}

	equals(b: Grid): boolean {
		return this.every((rowArray, rowIdx) => rowArray.every((cellVal, colIdx) => cellVal === b[rowIdx][colIdx]))
	}

	toGlyphString(off: string, on: string): string {
		return this.map((rowArray) => rowArray.map((cell) => (cell === 0 ? off : on)).join('')).join('\n')
	}
}
