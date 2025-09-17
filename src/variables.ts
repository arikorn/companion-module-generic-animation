import type { LowresScreensaverInstance } from './main.js'

export function UpdateVariableDefinitions(self: LowresScreensaverInstance): void {
	self.setVariableDefinitions([
		{ variableId: 'variable1', name: 'My first variable' },
		{ variableId: 'variable2', name: 'My second variable' },
		{ variableId: 'variable3', name: 'Another variable' },
	])
}
