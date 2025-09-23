import type { LowresScreensaverInstance } from './main.js'

export function UpdateVariableDefinitions(self: LowresScreensaverInstance): void {
	self.setVariableDefinitions([
		{ variableId: 'generation', name: 'Game of Life: generation' },
		{ variableId: 'population', name: 'Game of Life: population' },
		{ variableId: 'boardSize', name: 'Game of Life: board size' },
		{ variableId: 'running', name: 'Game of Life: running' },
		{ variableId: 'transitioning', name: 'Transitioning boards' },
	])
}

export function updateVariableValues(self: LowresScreensaverInstance): void {
	self.setVariableValues({
		generation: self.state.getGeneration(),
		population: self.state.getPopulation(),
		boardSize: `${self.boardSize.x}x${self.boardSize.y}`,
		running: self.state.isRunning(),
		transitioning: self.state.isWiping(),
	})
}
