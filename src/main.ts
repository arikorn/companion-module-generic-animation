import { InstanceBase, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type LowresScreensaverConfig } from './config.js'
import { UpdateVariableDefinitions } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { GameController } from './internal/controller.js'
export class LowresScreensaverInstance extends InstanceBase<LowresScreensaverConfig> {
	config!: LowresScreensaverConfig // Setup in init()

	state: GameController
	boardSize = [10, 11] //just a placeholder

	constructor(internal: unknown) {
		super(internal)
		this.state = new GameController(this.boardSize[0], this.boardSize[1])
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
		this.config = config
		const newBoardSize = config.boardSize.split(',').map((val) => Number(val))
		// if boardsize changed, update the Game Controller
		if (!newBoardSize.every((val, idx) => val === this.boardSize[idx])) {
			this.boardSize = newBoardSize
			this.state.setBoardSize(this.boardSize[0], this.boardSize[1])
		}
		this.state.genInterval = config.interval
		this.checkFeedbacks()
	}

	setGenerationInterval(ms: number): void {
		const newConfig = { ...this.config, interval: ms }
		this.saveConfig(newConfig) // this does not trigger configUpdated
		this.state.genInterval = newConfig.interval
		this.config = newConfig
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
}

runEntrypoint(LowresScreensaverInstance, UpgradeScripts)
