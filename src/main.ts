import { InstanceBase, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, cellCharChoices, configSizeToCoord, type LowresScreensaverConfig } from './config.js'
import { UpdateVariableDefinitions, updateVariableValues } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { GameController } from './internal/controller.js'
import { Coord } from './internal/grid.js'
export class LowresScreensaverInstance extends InstanceBase<LowresScreensaverConfig> {
	config!: LowresScreensaverConfig // Setup in init()

	state: GameController
	buttonGrid: Coord = { x: 11, y: 10 } // value is just a placeholder
	boardSize: Coord = { x: 11, y: 10 } // value is just a placeholder
	on: string = cellCharChoices[0].id[0] // character representing "live" cells
	off: string = cellCharChoices[0].id[1] // character representing "dead" cells

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
		this.updateEfffects() // not sure if it's necessary after updating variables...
	}

	// When module gets deleted
	async destroy(): Promise<void> {
		this.state.stop() // stop any running timer
		this.log('debug', 'destroy')
	}

	async configUpdated(config: LowresScreensaverConfig): Promise<void> {
		console.log(`Updating config. Board Size: ${config.boardSize}`)
		this.stopGame() // perhaps a bit conservative but simplifies board size and wrap changes
		this.buttonGrid = configSizeToCoord(config.buttonGrid)
		this.state.genInterval = Math.round(1000 / config.updateRate)
		if (!('onOffChars' in config)) {
			// needed only for development, the first time the props were added
			config = { ...(config as LowresScreensaverConfig), onOffChars: this.on + this.off }
			this.saveConfig(config)
		}
		this.on = config.onOffChars[0]
		this.off = config.onOffChars[1]
		this.state.setWrap(config.wrap)
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
			this.state.setBoardSize(newBoardSize)
			this.state.resetBoard(() => {}, false) // don't need a callback since we call updateEffects next
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

	setOnfOffChars(onOffChars: string): void {
		if (this.config.onOffChars !== onOffChars) {
			this.on = onOffChars[0]
			this.off = onOffChars[1]
			this.config.onOffChars = onOffChars
			this.saveConfig(this.config)
			// update the buttons
			this.updateEfffects()
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

	updateEfffects(): void {
		this.checkFeedbacks()
		updateVariableValues(this)
	}

	startGame(): void {
		this.state.start((_controller) => this.updateEfffects())
	}

	stopGame(): void {
		this.state.stop()
		this.updateEfffects()
	}
}

runEntrypoint(LowresScreensaverInstance, UpgradeScripts)
