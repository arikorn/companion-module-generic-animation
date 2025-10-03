import { WipeEffect, AnimationCallbacks } from './wipeEffect.js'
import { Coord, Grid, Wipe } from './grid.js'
import { GameOfLife } from './conway.js'
import { getShapeExtent, shapeArrayToGrid, shapeFromBitmap, shapes } from './shapes.js' //shapesByCategory, transpose
import { randomOrder } from './utilities.js'
import { typeset } from './typeset.js'
export interface BoardQueueItem {
	shapeName: string | Coord[]
	alignment: string
	offset: Coord
	text?: string
	boardSize?: Coord
}

export class GameController {
	// the "conway" object:
	theGame: GameOfLife
	// boardsQueue is the active queue of board setups
	boardsQueue: BoardQueueItem[] = []
	// fullBoardsQueue is what the user specified, so it can be restored for looping/random queues
	fullBoardsQueue: BoardQueueItem[] = []
	repeatQueue = false
	randomizeQueue = false
	gameDelay = 500 // delay before starting a game or after finishing

	// state for the UI:
	//board: Grid //theGame.present
	generation = 0
	running: Array<ReturnType<typeof setTimeout> | WipeEffect> = []
	// callback for the UI to update itself after each step (whether wipe or Conway)
	timerCallback: ((self: GameController) => void) | null = null
	genInterval = 500 // generation interval in ms
	shape = 'point' // for pull-down menu

	// game-over extension:
	extraRounds = 0

	constructor(size: Coord) {
		this.theGame = new GameOfLife(size)
		//this.board = this.theGame.present
	}

	getBoard(): Grid {
		return this.theGame.present
	}

	getBoardSize(): Coord {
		return { y: this.theGame.nrow(), x: this.theGame.ncol() }
	}

	isRunning(): boolean {
		return this.running.length > 0
	}

	isGameRunning(): boolean {
		// "instanceof NodeJS.Timeout" is refused by the compiler, so...
		// if adding new animation types, this may need attention. Maybe create a "dummy class" for Intervals
		return this.running.some((obj) => !(obj instanceof WipeEffect))
	}

	getGeneration(): number {
		return this.generation
	}

	getPopulation(): number {
		return this.theGame.nAlive
	}

	// the generational callback and timer start/stop/step functions
	// nextRound: advance a single generation:
	nextRound(): void {
		//this.board =
		this.theGame.next() // create next generation
		this.generation += 1
		const status = this.theGame.analyzeBoard()
		if (status === 0 || status === 1) {
			this.stop(true)
		} else if (status >= 2) {
			// let it run for two more cycles
			if (this.extraRounds === 0) {
				this.extraRounds = status * 2
			} else if (this.extraRounds === 1) {
				this.extraRounds = 0
				this.stop(true)
			} else {
				this.extraRounds = this.extraRounds - 1
			}
		}
		if (this.timerCallback !== null) {
			this.timerCallback(this)
		}
	}

	start(callback: (self: GameController) => void): void {
		//debug: console.log(`GameController.start(); isRunning = ${this.isRunning()}`)
		this.timerCallback = callback
		if (!this.isRunning()) {
			this.running.push(setInterval(() => this.nextRound(), this.genInterval))
			this.extraRounds = 0
		}
	}

	stopAll(): void {
		//debug: console.log(`GameController.stopAll()`)
		// although there is supposed to be only one interval running at a time, some race condition causes trouble
		// ... so this will guarantee that all timers are cleared.
		while (this.running.length > 0) {
			const timer = this.running.pop()
			if (timer instanceof WipeEffect) {
				timer.stop()
			} else {
				clearInterval(timer)
			}
		}
	}

	// stop the animation. Only the internal routine should set gameOver to true, as this will advance the queue
	stop(gameCompleted = false): void {
		//debug: console.log(`GameController.stop(completed=${gameCompleted})`)
		this.stopAll()

		// the following could be implemented a "done" callback if we used the same protocol as in wipeEffect
		//  not sure if that would be advantagous...
		if (gameCompleted) {
			const newShape = this.advanceQueue() // always do this, so it removes the current board
			if (newShape === null) return // we're done.
			// ELSE:
			// start the next item
			// wait at end of game, then transition in new board, then wait to start next game...
			const timeout = setTimeout(() => {
				// setup transition
				//debug: console.log(`GameController.stop().setup transition`)
				this.stopAll()
				const newBoard = this.newBoard(newShape)
				this.replaceBoard(newBoard, {
					update: () => {
						if (this.timerCallback !== null) this.timerCallback(this)
					},
					done: (aborted) => {
						//debug: console.log(`GameController.stop().done(aborted=${aborted})`)
						if (aborted) return
						// ELSE
						// setup new game
						this.running.push(
							setTimeout(() => {
								//debug: console.log(`GameController.stop().done.start new game`)
								this.stopAll() // to ensure game starts
								this.start(this.timerCallback!)
							}, this.gameDelay),
						)
					},
				})
			}, this.gameDelay)
			this.running.push(timeout)
		}

		this.extraRounds = 0
	}

	singleStep(): void {
		if (this.isRunning()) return // don't interfere when running
		this.nextRound()
	}

	// ============ CONFIGS ==================
	// **** Board Size ****
	setBoardSize(size: Coord): void {
		if (this.theGame.nrow() !== size.y || this.theGame.ncol() !== size.x) {
			this.stop()
			const newBoard = new Grid(size, 0)
			this.theGame.clear()
			this.theGame.setBoard(newBoard)
		}
	}

	//  **** Add/Set Shape ****
	// probably should deprecate/remove this??:
	addShapeToBoard(board: Grid, shape: string, offset: Coord): void {
		const toggle = shape === 'point'
		const newShape = shapes.get(shape)
		if (newShape !== undefined) {
			board.setShape(newShape, toggle, offset)
		}
	}

	// TODO: support board size, other settings?, temporarily overriding default
	newBoard(shapeSpec: BoardQueueItem | null): Grid {
		const newBoard = new Grid(this.theGame.present.dims(), 0)
		if (shapeSpec === null) {
			return newBoard
		} // ELSE
		const { shapeName, alignment, offset } = shapeSpec
		let theShape: Coord[]
		if (shapeName === 'text') {
			theShape = shapeFromBitmap(typeset(shapeSpec.text!))
		} else if (typeof shapeName === 'string') {
			theShape = shapes.get(shapeName)! // we don't allow custom values
		} else {
			// must be Coord[]
			theShape = shapeName
		}
		const shapeExt = getShapeExtent(theShape) // [min:Coord, max:Coord]
		const boardSize = this.getBoardSize()
		// extent is inclusive, so have to add 1 here:
		const shapeSize = { x: shapeExt[1].x + 1 - shapeExt[0].x, y: shapeExt[1].y + 1 - shapeExt[0].y }
		const boardExcess = { x: boardSize.x - shapeSize.x, y: boardSize.y - shapeSize.y }
		let topLeft: Coord = { x: 0, y: 0 }
		switch (alignment) {
			case 'center': {
				topLeft = { x: Math.floor(boardExcess.x / 2), y: Math.floor(boardExcess.y / 2) }
				break
			}
			case 'top-center': {
				topLeft = { x: Math.floor(boardExcess.x / 2), y: 0 - shapeExt[0].y }
				break
			}
			case 'center-left': {
				topLeft = { x: 0 - shapeExt[0].x, y: Math.floor(boardExcess.y / 2) }
				break
			}
			case 'bottom-center': {
				topLeft = { x: Math.floor(boardExcess.x / 2), y: boardExcess.y }
				break
			}
			case 'center-right': {
				topLeft = { x: boardExcess.x, y: Math.floor(boardExcess.y / 2) }
				break
			}
			case 'none':
				break
		}
		if (!isNaN(offset.x)) {
			topLeft.x += offset.x
		}
		if (!isNaN(offset.y)) {
			topLeft.y += offset.y
		}
		newBoard.setShape(theShape, false, topLeft)
		//this.addShapeToBoard(newBoard, shape, topLeft)
		return newBoard
	}

	// add a shape to existing board (not yet used)
	addShape(shape: string, offset: Coord): Grid {
		// later we can center... and/or add transforms
		const newBoard = this.theGame.present.copy()
		this.addShapeToBoard(newBoard, shape, offset)
		this.updateBoard(newBoard)
		return newBoard
	}

	pushShapeQueue(shapes: BoardQueueItem[], updateBoard = this.boardsQueue.length === 0): Grid | null {
		this.boardsQueue.push(...shapes)
		this.fullBoardsQueue.push(...shapes)
		this.refreshCurrentQueue()
		if (updateBoard && this.boardsQueue.length > 0) {
			return this.newBoard(this.boardsQueue[0])
		}
		return null
	}

	// call this when re-instating the cached queue:
	refreshCurrentQueue(): void {
		if (this.randomizeQueue) {
			// randomize the active queue but leave the cache alone
			const order = randomOrder(this.boardsQueue.length)
			this.boardsQueue = order.map((idx) => this.boardsQueue[idx])
		}
	}

	popShapeQueue(): void {
		if (this.boardsQueue.length > 0) {
			this.boardsQueue.shift()
		}
	}

	// Retrieve the next item in the queue
	advanceQueue(): BoardQueueItem | null {
		if (this.boardsQueue.length > 0) {
			this.popShapeQueue() // remove & discard the current board
		}

		if (this.boardsQueue.length === 0 && this.repeatQueue) {
			this.boardsQueue = this.fullBoardsQueue.slice()
			// randomize it if requested
			this.refreshCurrentQueue()
		}

		if (this.boardsQueue.length === 0) {
			// there's nothing to advance to
			this.fullBoardsQueue = [] // clear everything
			return null // we're done
		} else {
			return this.boardsQueue[0]
		}
	}

	clearShapeQueue(): void {
		this.boardsQueue = []
		this.fullBoardsQueue = []
	}

	playlistIsEmpty(): boolean {
		return this.fullBoardsQueue.length === 0
	}

	updateBoard(newBoard: Grid): void {
		this.theGame.setBoard(newBoard)
	}

	// Copy the shape to clipboard?
	// or copyBoard?  extracts the smallest bounding box of live elements
	// a place-holder for the moment...
	copyShape(): string {
		const points = this.theGame.present.getShape()
		const bitmap = shapeArrayToGrid(points)
		return '[[' + bitmap.map((row) => row.join(', ')).join('],\n [') + ']]' //shapeFromBitmap(..)
		// const bitmapText = //the return value, above
		//await clipboardy.write(bitmapText);  //import clipboardy from 'clipboardy';
	}

	// **** TRANSITION ACTIONS: REPLACE, RESET, CLEAR
	//wiper: WipeEffect | null = null

	// wrap internal maintenance around the user-supplied callback
	wiperCallback(callback: AnimationCallbacks): AnimationCallbacks {
		return {
			done: (aborted) => {
				//debug: console.log(`GameController.wiperCallback.done(aborted=${aborted})`)
				this.stopAll() // it will call wipeEffect.stop() again, but it's a noop
				if (callback.done !== undefined) {
					callback.done(aborted)
				}
			},
			update: () => {
				if (callback.update !== undefined) {
					callback.update()
				}
			},
		}
	}

	isWiping(): boolean {
		return this.running.some((obj) => obj instanceof WipeEffect)
	}

	//  use stopAll()...
	// stopTransition(): void {
	// 	if (this.wiper !== null) {
	// 		const wipeObject = this.wiper
	// 		this.wiper = null
	// 		wipeObject.stop()
	// 	}
	// }

	// replace the current board with a new board, using a wipe effect
	replaceBoard(fromBoard: Grid, callback: AnimationCallbacks): void {
		this.generation = 0
		const toBoard = this.theGame.present
		this.stopAll()
		// TODO: we don't really need to set the board, which counts the population
		const wiper = new WipeEffect(fromBoard, toBoard, (board) => this.theGame.setBoard(board))
		wiper.start(Math.random() < 0.5 ? Wipe.Up : Wipe.Left, this.wiperCallback(callback))
		this.running.push(wiper)
	}

	//  **** RESET ****
	// reset the current generation to the initial generation, using a wipe effect
	resetBoard(callback: AnimationCallbacks, useTransition = true): void {
		// reset the board to the most recent initial state
		const toBoard = this.theGame.present
		const fromBoard = this.theGame.resetBoard()
		this.stopAll()
		if (useTransition) {
			// TODO: we don't really need to set the board, which counts the population
			const wiper = new WipeEffect(fromBoard, toBoard, (board) => this.theGame.setBoard(board))
			wiper.start(Math.random() < 0.5 ? Wipe.Up : Wipe.Left, this.wiperCallback(callback))
			this.running.push(wiper)
		}
		this.generation = 0
	}

	//  **** CLEAR ****
	// clear the board using a wipe effect
	clearBoard(callback: AnimationCallbacks): void {
		// reset the board to the initial state
		const toBoard = this.theGame.present // we are putting the clear board *into* the current board
		this.theGame.clear()
		const fromBoard = this.theGame.present
		//eventually just use: this.replaceBoard(fromBoard, callback, direction)
		this.generation = 0
		this.stopAll()
		// if instantaneous:
		//setBoard(theGame.present)
		const wiper = new WipeEffect(fromBoard, toBoard, (board) => this.theGame.setBoard(board))
		// Set direction to 0..3 (the default values for enum)
		wiper.start(Math.floor(Math.random() * 4), this.wiperCallback(callback))
		this.running.push(wiper)
	}

	//  **** WRAP Checkbox ****
	// whether to treat board as a "cylindrical" surface (in both dimensions).
	setWrap(enable = true): void {
		this.theGame.setWrap(enable)
	}

	getWrap(): boolean {
		return this.theGame.wrap
	}

	// **** COPY (to clipboard) ****
	// handleCopy(): void {
	// 	const points = this.theGame.present.getShape()
	// 	await clipboardy.write('[[' + points.join('],[') + ']]') // points.map(val=> '[' + val.join() + ']')
	// }
}
