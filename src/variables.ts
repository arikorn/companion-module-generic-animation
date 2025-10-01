import type { AnimationInstance } from './main.js'

export function UpdateVariableDefinitions(self: AnimationInstance): void {
	self.setVariableDefinitions([
		{ variableId: 'generation', name: 'Game of Life: generation' },
		{ variableId: 'population', name: 'Game of Life: population' },
		{ variableId: 'boardSize', name: 'Game of Life: board size' },
		{ variableId: 'running', name: 'Game of Life: running' },
		{ variableId: 'transitioning', name: 'Transitioning boards' },
	])
}

export function updateVariableValues(self: AnimationInstance): void {
	self.setVariableValues({
		generation: self.animation.getGeneration(),
		population: self.animation.getPopulation(),
		boardSize: `${self.boardSize.x}x${self.boardSize.y}`,
		running: self.animation.isGameRunning(),
		transitioning: self.animation.isWiping(),
	})
}
