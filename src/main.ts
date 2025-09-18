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
	boardSize = [10, 11] //[8, 9]

	constructor(internal: unknown) {
		super(internal)
		this.state = new GameController(this.boardSize[0], this.boardSize[1])
	}

	async init(config: LowresScreensaverConfig): Promise<void> {
		this.config = config

		this.updateStatus(InstanceStatus.Ok)

		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
	}
	// When module gets deleted
	async destroy(): Promise<void> {
		this.state.stop() // stop any running timer
		this.log('debug', 'destroy')
	}

	async configUpdated(config: LowresScreensaverConfig): Promise<void> {
		this.config = config
		this.boardSize = config.boardSize.split(',').map((val) => Number(val))
		// TODO: if boardsize changed, update the Game Controller
		this.state.genInterval = config.interval
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
