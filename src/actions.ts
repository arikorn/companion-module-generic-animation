import type { LowresScreensaverInstance } from './main.js'
import { Grid } from './internal/grid.js'
import { shapes, getShapeExtent /*, shapesByCategory*/ } from './internal/shapes.js'

function makeChoices(strMap: Map<string, number[][]>): any {
	return Array.from(strMap.keys()).map((val) => ({ id: val, label: val }))
}

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
		//============================
		setShape: {
			name: 'Add Shape',
			options: [
				{
					id: 'shape',
					type: 'dropdown',
					label: 'Select Shape',
					choices: [...makeChoices(shapes)],
					default: 'point',
				},
				{
					id: 'pos',
					type: 'dropdown',
					label: 'Placement',
					choices: [
						{ id: 'center', label: 'center' },
						{ id: 'top-center', label: 'top' },
					],
					default: 'center',
				},
			],
			callback: async (event) => {
				const newBoard = new Grid(self.boardSize[0], self.boardSize[1])
				const shapeName = event.options.shape
				const position = event.options.pos
				const theShape = shapes.get(shapeName)
				const shapeExt = getShapeExtent(theShape)
				const midBoard = [Math.round(self.boardSize[0] / 2), Math.round(self.boardSize[1] / 2)]
				const midShape = [Math.round((shapeExt[1] - shapeExt[0]) / 2), Math.round((shapeExt[3] - shapeExt[2]) / 2)]
				let offset = [0, 0, 0, 0]
				if (position === 'center') {
					offset = [midBoard[0] - midShape[0], midBoard[1] - midShape[1]]
				} else if (position === 'top-center') {
					offset = [0 - shapeExt[0], midBoard[1] - midShape[1]]
				}

				newBoard.setShape(theShape, false, offset)
				self.state.stop()
				self.state.replaceBoard(newBoard, () => self.checkFeedbacks())
			},
		},
		//============================
		setInterval: {
			name: 'Set Generation Time',
			options: [
				{
					id: 'time',
					type: 'number',
					label: 'ms',
					default: 400,
					min: 10,
					max: 1000,
					range: true,
					tooltip: 'Enter the delay between generations, in milliseconds.',
				},
			],
			callback: async (event) => {
				const ms: number = Number(event.options.time)
				if (!isNaN(ms)) {
					// enforce the range
					self.setGenerationInterval(Math.max(10, Math.min(1000, ms)))
				}
			},
		},
	})
}
