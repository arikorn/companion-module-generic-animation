import { Grid, Wipe } from './grid.js'

// animation timer: call setShifting(direction), to start the animation
// TODO: Consider using requestAnimationFrame? https://www.google.com/search?q=react+requestAnimationFrame
//   probably not in node.js?

export interface AnimationCallbacks {
	update?: () => void
	done?: (aborted: boolean) => void
}

export class WipeEffect {
	fromBoard: Grid
	toBoard: Grid
	setBoard: (toBoard: Grid) => void

	// set in start():
	shiftDir: Wipe = Wipe.Up // just to give it a value.
	frameRate = 20 // ms
	callback: AnimationCallbacks = {}
	fromIdx = 0
	shifting: NodeJS.Timeout | null = null
	//controller = new AbortController() // a place-holder

	// setBoard sets the internal representation of the board since we don't modify the original toBoard
	constructor(fromBoard: Grid, toBoard: Grid, setBoard: (toBoard: Grid) => void) {
		this.fromBoard = fromBoard
		this.toBoard = toBoard
		this.setBoard = setBoard
	}

	start(direction: Wipe, callbacks: AnimationCallbacks, rate = this.frameRate): void {
		//debug: console.log(`wipeEffects.start()`)
		this.stop(false) // abort any current transition
		this.shiftDir = direction
		this.frameRate = rate
		this.fromIdx = 0
		switch (direction) {
			case Wipe.Down:
				this.fromIdx = this.fromBoard.nrow() - 1
				break
			case Wipe.Right:
				this.fromIdx = this.fromBoard.ncol() - 1
				break
			default: // Left, Up start at 0
		}
		this.callback = callbacks
		this.shifting = setInterval(() => this.shiftOne(), this.frameRate)
	}

	// stop current wipe. Generally if a client is calling stop(), the abort argument should be left as false
	stop(completed = false): void {
		//debug: (`wipeEffects.stop(completed=${completed})`)
		if (this.shifting !== null) {
			const interval = this.shifting
			this.shifting = null
			clearInterval(interval)
			if (this.callback.done !== undefined) {
				this.callback.done(!completed)
			}
		}
	}

	isRunning(): boolean {
		return this.shifting !== null
	}

	shiftOne(): void {
		this.toBoard = this.toBoard.wipe(this.shiftDir, this.fromBoard, this.fromIdx)
		this.setBoard(this.toBoard)
		let isShifting = true
		switch (this.shiftDir) {
			case Wipe.Up:
				isShifting = this.fromIdx + 1 < this.fromBoard.nrow()
				this.fromIdx += 1
				break
			case Wipe.Left:
				isShifting = this.fromIdx + 1 < this.fromBoard.ncol()
				this.fromIdx += 1
				break
			default: // Down, Right count down to 0
				isShifting = this.fromIdx > 0
				this.fromIdx -= 1
				break
		}
		if (!isShifting) {
			this.stop(true) // signal a "normal" stop (not aborting)
		}
		if (this.callback.update !== undefined) {
			this.callback.update()
		}
	}
}
