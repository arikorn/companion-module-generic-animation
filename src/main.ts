import { InstanceBase, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, configSizeToCoord, type LowresScreensaverConfig } from './config.js'
import { UpdateVariableDefinitions } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { GameController } from './internal/controller.js'
import { Coord } from './internal/grid.js'
export class LowresScreensaverInstance extends InstanceBase<LowresScreensaverConfig> {
	config!: LowresScreensaverConfig // Setup in init()

	state: GameController
	buttonGrid: Coord = { x: 11, y: 10 } //just a placeholder
	boardSize: Coord = { x: 11, y: 10 } //just a placeholder

	constructor(internal: unknown) {
		super(internal)
		this.state = new GameController(this.boardSize)
	}

	async init(config: LowresScreensaverConfig): Promise<void> {
		await this.configUpdated(config)

		this.updateStatus(InstanceStatus.Ok)

		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
		this.checkFeedbacks() // not sure if it's necessary after updating variables...
	}

	// When module gets deleted
	async destroy(): Promise<void> {
		this.state.stop() // stop any running timer
		this.log('debug', 'destroy')
	}

	async configUpdated(config: LowresScreensaverConfig): Promise<void> {
		console.log(`Updating config. Board Size: ${config.boardSize}`)
		this.stopGame() // perhaps a bit conservative but simplifies board size and wrap changes
		this.config = config
		this.buttonGrid = configSizeToCoord(config.buttonGrid)
		this.state.genInterval = Math.round(1000 / config.updateRate)
		this.state.setWrap(config.wrap)
		// board size is a bit more complicated...
		let newBoardSize: Coord
		if (config.boardSize === 'fit5x3') {
			newBoardSize = { x: this.buttonGrid.x * 5, y: this.buttonGrid.y * 3 }
		} else if (config.boardSize === 'fit8x4') {
			newBoardSize = { x: this.buttonGrid.x * 8, y: this.buttonGrid.y * 4 }
		} else {
			newBoardSize = configSizeToCoord(config.boardSize)
		}
		// if boardsize changed, update the Game Controller
		if (newBoardSize.x !== this.boardSize.x || newBoardSize.y !== this.boardSize.y) {
			this.boardSize = newBoardSize
			this.state.setBoardSize(newBoardSize)
		}
		// update the buttons
		this.checkFeedbacks()
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

	setGenerationRate(rate: number): void {
		const running = this.state.isRunning()
		const newConfig = { ...this.config, updateRate: rate }
		this.saveConfig(newConfig) // this does not trigger configUpdated
		this.stopGame()
		this.state.genInterval = Math.round(1000 / newConfig.updateRate)
		this.config = newConfig
		if (running) {
			this.startGame()
		}
	}

	async setWrap(enable: boolean): Promise<void> {
		const newConfig = { ...this.config, wrap: enable }
		this.saveConfig(newConfig) // this does not trigger configUpdated
		// we may need to change the board-size too, so...
		await this.configUpdated(newConfig)
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

	startGame(): void {
		this.state.start((_controller) => this.checkFeedbacks())
	}

	stopGame(): void {
		this.state.stop()
	}
}

runEntrypoint(LowresScreensaverInstance, UpgradeScripts)
