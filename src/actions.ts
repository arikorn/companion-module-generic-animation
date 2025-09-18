import type { LowresScreensaverInstance } from './main.js'
import { Grid } from './internal/grid.js'

export function UpdateActions(self: LowresScreensaverInstance): void {
	self.setActionDefinitions({
		startGame: {
			name: 'Start/Stop Game',
			options: [
				{
					id: 'action',
					type: 'dropdown',
					label: 'Action',
					choices: [
						{ id: 0, label: 'Stop' },
						{ id: 1, label: 'Start' },
						{ id: -1, label: 'Toggle' },
					],
					default: -1,
				},
			],
			callback: async (event) => {
				let action = Number(event.options.action)
				if (action === undefined) {
					console.log('Undefined action!')
				}
				if (action < 0) {
					action = self.state.isRunning() ? 0 : 1
				}
				if (action === 0) {
					self.state.stop()
				} else {
					self.state.start((_controller) => self.checkFeedbacks())
				}
			},
		},
		setShape: {
			name: 'Add Shape',
			options: [
				{
					id: 'shape',
					type: 'dropdown',
					label: 'Select Shape',
					choices: [
						{ id: 0, label: 'Stop' },
						{ id: 1, label: 'Start' },
						{ id: -1, label: 'Toggle' },
					],
					default: -1,
				},
			],
			callback: async (_event) => {
				const newBoard = new Grid(self.boardSize[0], self.boardSize[1])
				for (let x = 0; x < self.boardSize[0]; x++) {
					newBoard.set({ x: x, y: 5 }, 1)
				}
				self.state.replaceBoard(newBoard, () => self.checkFeedbacks())
			},
		},
	})
}
