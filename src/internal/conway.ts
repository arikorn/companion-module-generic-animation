import { Grid, plus } from './grid.js'

interface GoL_State {
	board: Grid
	nAlive: number
}

// Conway's Game Of Life
export class GameOfLife {
	// extends Grid
	present: Grid // current generation
	nAlive = 0
	wrap = true

	past: GoL_State[] = []
	start: Grid

	constructor(nrows: number, ncols: number) {
		const newBoard = new Grid(nrows, ncols, 0)
		this.present = newBoard
		this.start = newBoard
		this.nAlive = 0
		this.wrap = true
	}

	nrow(): number {
		return this.present.nrow()
	}

	ncol(): number {
		return this.present.ncol()
	}

	setWrap(val: boolean): void {
		this.wrap = val
	}

	// set a new start of game:
	setBoard(newBoard: Grid): void {
		this.clearHistory()
		this.present = newBoard
		this.nAlive = this.countAlive()
		this.start = this.present
	}

	// restore the last start of game:
	resetBoard(): Grid {
		this.clearHistory()
		this.present = this.start
		this.nAlive = this.countAlive()
		return this.present
	}

	clear(): void {
		this.clearHistory()
		this.present = new Grid(this.present.nrow(), this.present.ncol(), 0)
		this.nAlive = 0
		//clear start?
	}

	countAlive(): number {
		return this.present.reduceAll(plus)
	}

	updateHistory(): void {
		// maintain two generations of history:
		if (this.past.length >= 1) {
			this.past[1] = this.past[0]
		}
		this.past[0] = { board: this.present, nAlive: this.nAlive }
	}

	clearHistory(): void {
		this.past = []
	}

	// compute and return the next generation
	next(): Grid {
		// store the present state in history
		this.updateHistory()

		const source = this.present
		const rows = source.nrow()
		const nextgen = new Grid(rows, source.ncol(), 0)
		const neighbors = nextgen.copy()

		// compute neighbor values efficiently: for each "live" cell, increment all of its neighbors
		for (let row = 0; row < rows; row++) {
			const rowArray = source.getRow(row)
			rowArray.forEach((value, col) => {
				if (value > 0) {
					this.markNeighbors(neighbors, row, col)
				}
			})
		}

		// populate the next generation matrix
		// rules: 3 neighbors -- always alive
		//            2 neighbors -- survive (i.e. if already alive)
		//            all else -- dead
		let nAlive = 0
		for (let row = 0; row < rows; row++) {
			const sourceRowArr = source.getRow(row)
			const neighborRowArr = neighbors.getRow(row)
			const nextgenRowArr = nextgen.getRow(row)

			for (let col = 0; col < neighborRowArr.length; col++) {
				const value = neighborRowArr[col]
				if (value === 3) {
					nextgenRowArr[col] = 1
					nAlive++
				} else if (value === 2) {
					nextgenRowArr[col] = sourceRowArr[col]
					nAlive += sourceRowArr[col]
				} // everything else is zero
			}
		}

		// TODO: Store current state, initial state
		this.nAlive = nAlive
		this.present = nextgen
		return this.present
	}

	// Mark the eight neighbors of (row,col) by incrementing them by 1.
	markNeighbors(dest: Grid, row: number, col: number): void {
		const lastrow = dest.nrow() - 1
		const lastcol = dest.ncol() - 1
		const destdata = dest
		const wrap = this.wrap
		let xoffsets: number[]
		let yoffsets: number[]

		if (wrap) {
			// offsets with wraparound: these will be added to row and col, so [-1, 0, 1] with adjustments
			xoffsets = [row === 0 ? lastrow : -1, 0, row === lastrow ? -lastrow : 1]
			yoffsets = [col === 0 ? lastcol : -1, 0, col === lastcol ? -lastcol : 1]
		} else {
			xoffsets = row === 0 ? [0, 1] : row === lastrow ? [-1, 0] : [-1, 0, 1]
			yoffsets = col === 0 ? [0, 1] : col === lastcol ? [-1, 0] : [-1, 0, 1]
		}
		// increment each neighbor.
		for (const xoff of xoffsets) {
			for (const yoff of yoffsets) {
				if (xoff === 0 && yoff === 0) continue
				destdata[row + xoff][col + yoff]++
			}
		}
	}

	// return 0 if none are alive, -1 if no periodic cycle is found, otherwise return the period
	//  currently we only detect period 1 (static) and period 2 (bi-phasic) cycles.
	analyzeBoard(): number {
		if (this.nAlive === 0) {
			return 0
		} // else
		let period = 1
		for (const bstate of this.past) {
			if (bstate.nAlive === this.nAlive) {
				// compare states.
				if (this.present.equals(bstate.board)) {
					return period
				} // else
				period++
			}
		}
		return -1
	}
}
