import { WipeEffect, AnimationCallbacks } from './wipeEffect.js'
import { Coord, Grid, Wipe } from './grid.js'
import { GameOfLife } from './conway.js'
import { getShapeExtent, shapeArrayToGrid, shapes } from './shapes.js' //shapesByCategory, transpose
import { randomOrder } from './utilities.js'
interface BoardQueueItem {
	shapeName: string
	alignment: string
	offset: Coord
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
	running: NodeJS.Timeout | null
	// callback for the UI to update itself after each step (whether wipe or Conway)
	timerCallback: ((self: GameController) => void) | null = null
	genInterval = 500 // generation interval in ms
	shape = 'point' // for pull-down menu
	wrap = true // should the board act like a torus? (bottom wraps to top, etc.)

	// game-over extension:
	extraRounds = 0

	constructor(size: Coord) {
		this.theGame = new GameOfLife(size)
		//this.board = this.theGame.present
		this.running = null
	}

	getBoard(): Grid {
		return this.theGame.present
	}

	getBoardSize(): Coord {
		return { y: this.theGame.nrow(), x: this.theGame.ncol() }
	}

	isRunning(): boolean {
		return this.running !== null
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

	start(callback: (self: GameController) => void, delay = 0): void {
		this.timerCallback = callback
		const startGame = () => (this.running = setInterval(() => this.nextRound(), this.genInterval))
		if (this.running === null) {
			if (delay > 0) {
				this.gameDelay = delay
				this.running = setTimeout(startGame, delay)
			} else {
				startGame()
			}
			this.extraRounds = 0
		}
	}

	// stop the animation. Only the internal routine should set gameOver to true, as this will advance the queue
	stop(gameOver = false): void {
		if (this.running !== null) {
			clearInterval(this.running)
			this.running = null
		}
		// this could be a "done" callback if we used the same protocol as in wipeEffect
		//  not sure if that would be advantagous...
		if (gameOver) {
			const newShape = this.advanceQueue() // always do this, so it removes the current board
			if (newShape === null) return // we're done.
			// ELSE:
			// start the next item
			// wait at end of game, then transition in new board, then wait to start next game...
			this.running = setTimeout(() => {
				// setup transition
				this.running = null
				const newBoard = this.newBoard(newShape)
				this.replaceBoard(newBoard, {
					update: () => {
						if (this.timerCallback !== null) this.timerCallback(this)
					},
					done: () => {
						// setup new game
						this.running = setTimeout(() => {
							this.running = null // to ensure game starts
							this.start(this.timerCallback!, this.gameDelay)
						}, this.gameDelay)
					},
				})
			}, this.gameDelay)
		}

		this.extraRounds = 0
	}

	singleStep(): void {
		if (this.running !== null) return // don't interfere when running
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
		board.setShape(newShape, toggle, offset)
	}

	// TODO: support board size
	newBoard({ shapeName, alignment, offset }: BoardQueueItem): Grid {
		const newBoard = new Grid(this.theGame.present.dims(), 0)
		const theShape = shapes.get(shapeName)
		const shapeExt = getShapeExtent(theShape) // [min:Coord, max:Coord]
		const boardSize = this.getBoardSize()
		const midBoard = { y: Math.round(boardSize.y / 2), x: Math.round(boardSize.x / 2) }
		const midShape = {
			x: Math.round((shapeExt[1].x + shapeExt[0].x) / 2),
			y: Math.round((shapeExt[1].y + shapeExt[0].y) / 2),
		}
		let topLeft: Coord = { x: 0, y: 0 }
		switch (alignment) {
			case 'center': {
				topLeft = { x: midBoard.x - midShape.x, y: midBoard.y - midShape.y }
				break
			}
			case 'top-center': {
				topLeft = { y: 0 - shapeExt[0].y, x: midBoard.x - midShape.x }
				break
			}
			case 'center-left': {
				topLeft = { y: midBoard.y - midShape.y, x: 0 - shapeExt[0].x }
				break
			}
			case 'bottom-center': {
				topLeft = { y: boardSize.y - (shapeExt[1].y - shapeExt[0].y) - 1, x: midBoard.x - midShape.x }
				break
			}
			case 'center-right': {
				topLeft = { y: midBoard.y - midShape.y, x: boardSize.x - (shapeExt[1].x - shapeExt[0].x) - 1 }
				break
			}
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
	wiper: WipeEffect | null = null

	// wrap internal maintenance around the user-supplied callback
	wiperCallback(callback: AnimationCallbacks): AnimationCallbacks {
		return {
			done: () => {
				this.wiper = null
				if (callback.done !== undefined) {
					callback.done()
				}
			},
			update: () => {
				if (callback.update !== undefined) {
					callback.update()
				}
			},
		}
		// if (this.wiper !== null && !this.wiper.isRunning()) {
		// 	// the wipe effect has completed, reset the instance variable:
		// 	this.wiper = null
		// }
		// if (callback != null) callback()
	}

	isWiping(): boolean {
		return this.wiper !== null
	}

	// replace the current board with a new board, using a wipe effect
	replaceBoard(fromBoard: Grid, callback: AnimationCallbacks): void {
		this.generation = 0
		const toBoard = this.theGame.present
		// TODO: we don't really need to set the board, which counts the population
		if (this.wiper !== null) {
			this.wiper.stop()
		}
		this.wiper = new WipeEffect(fromBoard, toBoard, (board) => this.theGame.setBoard(board))
		return this.wiper.start(Math.random() < 0.5 ? Wipe.Up : Wipe.Left, this.wiperCallback(callback))
	}

	//  **** RESET ****
	// reset the current generation to the initial generation, using a wipe effect
	resetBoard(callback: AnimationCallbacks, useTransition = true): void {
		// reset the board to the most recent initial state
		const toBoard = this.theGame.present
		const fromBoard = this.theGame.resetBoard()
		// TODO: we don't really need to set the board, which counts the population
		if (this.wiper !== null) {
			this.wiper.stop()
		}
		if (useTransition) {
			this.wiper = new WipeEffect(fromBoard, toBoard, (board) => this.theGame.setBoard(board))
			void this.wiper.start(Math.random() < 0.5 ? Wipe.Up : Wipe.Left, this.wiperCallback(callback))
		}
		this.generation = 0
	}

	//  **** CLEAR ****
	// clear the board using a wipe effect
	clearBoard(callback: AnimationCallbacks): void {
		// reset the board to the initial state
		const fromBoard = this.theGame.present
		this.theGame.clear()
		const toBoard = this.theGame.present
		this.generation = 0
		// if instantaneous:
		//setBoard(theGame.present)
		// if shifting in new board:
		if (this.wiper !== null) {
			this.wiper.stop()
		}
		this.wiper = new WipeEffect(fromBoard, toBoard, (board) => this.theGame.setBoard(board))
		// Set direction to 0..3 (the default values for enum)
		void this.wiper.start(Math.floor(Math.random() * 4), this.wiperCallback(callback))
	}

	//  **** WRAP Checkbox ****
	// whether to treat board as a "cylindrical" surface (in both dimensions).
	setWrap(enable = true): void {
		this.theGame.setWrap(enable)
	}

	// **** COPY (to clipboard) ****
	// handleCopy(): void {
	// 	const points = this.theGame.present.getShape()
	// 	await clipboardy.write('[[' + points.join('],[') + ']]') // points.map(val=> '[' + val.join() + ']')
	// }
}
