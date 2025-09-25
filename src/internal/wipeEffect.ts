import { Grid, Wipe } from './grid.js'

// animation timer: call setShifting(direction), to start the animation
// TODO: Consider using requestAnimationFrame? https://www.google.com/search?q=react+requestAnimationFrame
//   probably not in node.js?

export class WipeEffect {
	fromBoard: Grid
	toBoard: Grid
	setBoard: (toBoard: Grid) => void

	// set in start():
	shiftDir: Wipe = Wipe.Up // just to give it a value.
	frameRate = 20 // ms
	callback: (() => void) | null = null
	fromIdx = 0
	shifting: NodeJS.Timeout | null = null
	controller = new AbortController() // a place-holder

	constructor(fromBoard: Grid, toBoard: Grid, setBoard: (toBoard: Grid) => void) {
		this.fromBoard = fromBoard
		this.toBoard = toBoard
		this.setBoard = setBoard
	}

	async start(direction: Wipe, callback: () => void, rate = 20): Promise<void> {
		this.stop()
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
		this.callback = callback
		this.controller = new AbortController()
		const signal = this.controller.signal
		const promise = new Promise<void>((resolve) => {
			this.shifting = setInterval(() => this.shiftOne(), this.frameRate)
			signal.addEventListener(
				'abort',
				() => {
					this.stop()
					resolve()
				},
				{ once: true },
			)
		})
		return promise
	}

	stop(): void {
		if (this.shifting !== null) {
			const interval = this.shifting
			this.shifting = null
			// abort will resolve the Promise, and call stop again, but it will be a noop
			this.controller.abort()
			clearInterval(interval)
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
			this.stop()
		}
		if (this.callback !== null) {
			this.callback()
		}
	}
}
