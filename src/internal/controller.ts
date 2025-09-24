import { WipeEffect } from './wipeEffect.js'
import { Coord, Grid, Wipe } from './grid.js'
import { GameOfLife } from './conway.js'
import { shapeArrayToGrid, shapes } from './shapes.js' //shapesByCategory, transpose

export class GameController {
	// the "conway" object:
	theGame: GameOfLife

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

	getBoardSize(): number[] {
		return [this.theGame.nrow(), this.theGame.ncol()]
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
	nextRound(): void {
		//this.board =
		this.theGame.next() // create next generation
		this.generation += 1
		const status = this.theGame.analyzeBoard()
		if (status === 0 || status === 1) {
			this.stop()
		} else if (status >= 2) {
			// let it run for two more cycles
			if (this.extraRounds === 0) {
				this.extraRounds = status * 2
			} else if (this.extraRounds === 1) {
				this.extraRounds = 0
				this.stop()
			} else {
				this.extraRounds = this.extraRounds - 1
			}
		}
		if (this.timerCallback !== null) {
			this.timerCallback(this)
		}
	}

	start(callback: (self: GameController) => void): void {
		this.timerCallback = callback
		if (this.running === null) {
			this.running = setInterval(() => this.nextRound(), this.genInterval)
		}
		this.extraRounds = 0
	}

	stop(): void {
		if (this.running !== null) {
			clearInterval(this.running)
		}
		this.running = null
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

	//  **** Add Shape ****
	addShape(shape: string, topLeft: Coord): void {
		// later we can center... and/or add transforms
		const newBoard = this.theGame.present.copy()
		//console.log(`Clicked ${JSON.stringify(idx)}!`);
		const toggle = shape === 'point'
		const newShape = shapes.get(shape)
		newBoard.setShape(newShape, toggle, topLeft)
		this.updateBoard(newBoard)
		//console.log(`fill: ${board}; newFill: ${newBoard}`);
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

	wiperCallback(callback: () => void): void {
		if (this.wiper !== null && !this.wiper.isRunning()) {
			this.wiper = null
		}
		callback()
	}

	isWiping(): boolean {
		return this.wiper !== null
	}

	// replace the current board with a new board, using a wipe effect
	replaceBoard(fromBoard: Grid, callback: () => void): void {
		const toBoard = this.theGame.present
		// TODO: we don't really need to set the board, which counts the population
		if (this.wiper !== null) {
			this.wiper.stop()
		}
		this.wiper = new WipeEffect(fromBoard, toBoard, (board) => this.theGame.setBoard(board))
		this.wiper.start(Math.random() < 0.5 ? Wipe.Up : Wipe.Left, () => this.wiperCallback(callback))
		this.generation = 0
	}

	//  **** RESET ****
	// reset the current generation to the initial generation, using a wipe effect
	resetBoard(callback: () => void, useTransition = true): void {
		// reset the board to the most recent initial state
		const toBoard = this.theGame.present
		const fromBoard = this.theGame.resetBoard()
		// TODO: we don't really need to set the board, which counts the population
		if (this.wiper !== null) {
			this.wiper.stop()
		}
		if (useTransition) {
			this.wiper = new WipeEffect(fromBoard, toBoard, (board) => this.theGame.setBoard(board))
			this.wiper.start(Math.random() < 0.5 ? Wipe.Up : Wipe.Left, () => this.wiperCallback(callback))
		}
		this.generation = 0
	}

	//  **** CLEAR ****
	// clear the board using a wipe effect
	clearBoard(callback: () => void): void {
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
		this.wiper.start(Math.floor(Math.random() * 4), () => this.wiperCallback(callback))
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
