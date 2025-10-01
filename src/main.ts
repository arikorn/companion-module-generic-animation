import { InstanceBase, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, cellCharChoices, configSizeToCoord, type AnimationConfig } from './config.js'
import { UpdateVariableDefinitions, updateVariableValues } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { GameController } from './animation/controller.js'
import { Coord, Grid } from './animation/grid.js'
export class AnimationInstance extends InstanceBase<AnimationConfig> {
	config!: AnimationConfig // Setup in init()

	animation: GameController
	buttonGrid: Coord = { x: 11, y: 10 } // value is just a placeholder
	boardSize: Coord = { x: 11, y: 10 } // value is just a placeholder
	on: string = cellCharChoices[0].id[0] // character representing "live" cells
	off: string = cellCharChoices[0].id[1] // character representing "dead" cells

	constructor(internal: unknown) {
		super(internal)
		this.animation = new GameController(this.boardSize)
	}

	async init(config: AnimationConfig): Promise<void> {
		await this.configUpdated(config)

		this.updateStatus(InstanceStatus.Ok)

		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
		this.updateEfffects() // not sure if it's necessary after updating variables...
	}

	// When module gets deleted
	async destroy(): Promise<void> {
		this.animation.stop() // stop any running game or transition
		this.log('debug', 'destroy')
	}

	async configUpdated(config: AnimationConfig): Promise<void> {
		//debug: console.log(`Updating config. Board Size: ${config.boardSize}`)
		this.stopGame() // perhaps a bit conservative but simplifies board size and wrap changes
		this.buttonGrid = configSizeToCoord(config.buttonGrid)
		this.animation.genInterval = Math.round(1000 / config.updateRate)
		if (!('repeat' in config)) {
			// needed only for development, the first time the prop is added
			config = { ...(config as AnimationConfig), repeat: false }
			this.saveConfig(config)
		}
		this.animation.randomizeQueue = config.randomize
		this.animation.repeatQueue = config.repeat
		this.on = config.onOffChars[0]
		this.off = config.onOffChars[1]
		this.animation.setWrap(config.wrap)
		this.config = config
		// board size is a bit more complicated...
		let newBoardSize: Coord
		if (config.boardSize.includes('fit')) {
			// 'fit5x3', for example:
			const dims = configSizeToCoord(config.boardSize.replace('fit', ''))
			newBoardSize = { x: this.buttonGrid.x * dims.x, y: this.buttonGrid.y * dims.y }
		} else {
			newBoardSize = configSizeToCoord(config.boardSize)
		}
		// if boardsize changed, update the Game Controller
		const newSizeIsValid = !(isNaN(newBoardSize.x) || isNaN(newBoardSize.y))
		const newSizeChanged = newBoardSize.x !== this.boardSize.x || newBoardSize.y !== this.boardSize.y
		if (newSizeIsValid && newSizeChanged) {
			this.boardSize = newBoardSize
			this.animation.setBoardSize(newBoardSize)
			// this doesn't/shouldn't work with different sizes
			//this.state.resetBoard({}, false) // don't need a callback since we call updateEffects next, and don't animate
		}
		// update the buttons
		this.updateEfffects()
	}

	async setButtonGridSize(size: string): Promise<void> {
		const newConfig = { ...this.config, buttonGrid: size }
		this.saveConfig(newConfig) // this does not trigger configUpdated
		// we may need to change the board-size too, so...
		await this.configUpdated(newConfig)
	}

	async setBoardSize(size: string): Promise<void> {
		const newConfig = { ...this.config, boardSize: size }
		this.saveConfig(newConfig) // this does not trigger configUpdated
		// we may need to change the board-size too, so...
		await this.configUpdated(newConfig)
	}

	async setRandomize(enable: boolean): Promise<void> {
		const newConfig = { ...this.config, randomize: enable }
		this.saveConfig(newConfig)
		await this.configUpdated(newConfig) // ensure that local state is updated too
	}

	async setRepeat(enable: boolean): Promise<void> {
		const newConfig = { ...this.config, repeat: enable }
		this.saveConfig(newConfig)
		await this.configUpdated(newConfig) // ensure that local state is updated too
	}

	async setGenerationRate(rate: number): Promise<void> {
		const running = this.animation.isGameRunning()
		const newConfig = { ...this.config, updateRate: rate }
		this.saveConfig(newConfig) // this does not trigger configUpdated
		this.stopGame()
		await this.configUpdated(newConfig) // ensure that local state is updated too
		if (running) {
			this.startGame()
		}
	}

	async setOnfOffChars(onOffChars: string): Promise<void> {
		if (this.config.onOffChars !== onOffChars) {
			this.on = onOffChars[0]
			this.off = onOffChars[1]
			this.config.onOffChars = onOffChars
			this.saveConfig(this.config)
			// update the buttons
			await this.configUpdated(this.config)
		}
	}

	async setWrap(enable: boolean): Promise<void> {
		const newConfig = { ...this.config, wrap: enable }
		this.saveConfig(newConfig) // this does not trigger configUpdated
		await this.configUpdated(this.config)
	}

	// Return config fields for web config
	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	updateActions(): void {
		UpdateActions(this)
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}

	updateEfffects(): void {
		this.checkFeedbacks()
		updateVariableValues(this)
	}

	async replaceBoard(newBoard: Grid | null): Promise<void> {
		return new Promise<void>((resolve) => {
			if (newBoard !== null) {
				this.stopGame()
				this.animation.replaceBoard(newBoard, {
					update: () => this.updateEfffects(),
					done: () => resolve(), // whether aborted or not
				})
			} else {
				resolve()
			}
		})
	}

	async clearBoard(): Promise<void> {
		return new Promise<void>((resolve) => {
			this.stopGame()
			this.animation.clearBoard({
				update: () => this.updateEfffects(),
				done: () => resolve(), // whether aborted or not
			})
		})
	}

	// note that we intentionally do not make startGame into a Promise so that a sequential action group is able to stop a game
	startGame(): void {
		this.animation.start((_controller) => this.updateEfffects())
	}

	stopGame(): void {
		//debug: console.log(`main.stopGame()`)
		this.animation.stop() // stop game and/or transition
		this.updateEfffects()
	}
}

runEntrypoint(AnimationInstance, UpgradeScripts)
