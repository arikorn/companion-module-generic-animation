import type { LowresScreensaverInstance } from './main.js'
import { Grid } from './internal/grid.js'
import { shapes, getShapeExtent /*, shapesByCategory*/ } from './internal/shapes.js'
import { buttonSizeDefault, buttonSizeChoices, boardSizeChoices, boardSizeDefault } from './config.js'

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
					self.stopGame()
				} else {
					self.startGame()
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
						{ id: 'center-left', label: 'left' },
						{ id: 'bottom-center', label: 'bottom' },
						{ id: 'center-right', label: 'right' },
					],
					default: 'center',
				},
				{
					id: 'xOffset',
					type: 'number',
					label: 'X offset',
					default: 0,
					min: -self.boardSize[1],
					max: self.boardSize[1],
					range: true,
					tooltip: 'Enter an X (columns) offset to the placement.',
				},
				{
					id: 'yOffset',
					type: 'number',
					label: 'y offset',
					default: 0,
					min: -self.boardSize[0],
					max: self.boardSize[0],
					range: true,
					tooltip: 'Enter a Y (rows) offset to the placement.',
				},
			],
			callback: async (event) => {
				const newBoard = new Grid(self.boardSize[0], self.boardSize[1])
				const shapeName = event.options.shape
				const position = event.options.pos
				const userXOffset = Number(event.options.xOffset)
				const userYOffset = Number(event.options.yOffset)
				const theShape = shapes.get(shapeName)
				const shapeExt = getShapeExtent(theShape)
				const midBoard = [Math.round(self.boardSize[0] / 2), Math.round(self.boardSize[1] / 2)]
				const midShape = [Math.round((shapeExt[1] - shapeExt[0]) / 2), Math.round((shapeExt[3] - shapeExt[2]) / 2)]
				let offset = [0, 0, 0, 0]

				switch (position) {
					case 'center': {
						offset = [midBoard[0] - midShape[0], midBoard[1] - midShape[1]]
						break
					}
					case 'top-center': {
						offset = [0 - shapeExt[0], midBoard[1] - midShape[1]]
						break
					}
					case 'center-left': {
						offset = [midBoard[0] - midShape[0], 0 - shapeExt[2]]
						break
					}
					case 'bottom-center': {
						offset = [self.boardSize[0] - (shapeExt[1] - shapeExt[0]) - 1, midBoard[1] - midShape[1]]
						break
					}
					case 'center-right': {
						offset = [midBoard[0] - midShape[0], self.boardSize[1] - (shapeExt[3] - shapeExt[2]) - 1]
						break
					}
				}
				if (!isNaN(userXOffset)) {
					offset[1] += userXOffset
				}
				if (!isNaN(userYOffset)) {
					offset[0] += userYOffset
				}
				newBoard.setShape(theShape, false, offset)
				self.state.stop()
				self.state.replaceBoard(newBoard, () => self.checkFeedbacks())
			},
		},
		//============================
		setButtonGrid: {
			name: 'Set Button Grid Size',
			options: [
				{
					id: 'size',
					type: 'dropdown',
					label: 'Button Grid, Internal Size',
					choices: buttonSizeChoices(),
					default: buttonSizeDefault(),
					tooltip: 'Choose the grid-size within each button.',
				},
			],
			callback: async (event) => {
				if (event.options.size !== undefined) {
					await self.setButtonGridSize(String(event.options.size))
				}
			},
		},
		//============================
		setGridSize: {
			name: 'Set Board Grid Size',
			options: [
				{
					id: 'size',
					type: 'dropdown',
					label: 'Game Board Grid Size',
					choices: boardSizeChoices(),
					default: boardSizeDefault(),
					tooltip: 'Choose the grid-size within each button.',
				},
			],
			callback: async (event) => {
				if (event.options.size !== undefined) {
					await self.setBoardSize(String(event.options.size))
				}
			},
		},
		//============================
		setGameRate: {
			name: 'Set Game Update Rate',
			options: [
				{
					id: 'time',
					type: 'number',
					label: 'Frequency (rounds/second)',
					default: 5,
					min: 1,
					max: 10,
					range: true,
					tooltip: 'Enter the number of generations per second. (Note: 8 may be the actual max)',
				},
			],
			callback: async (event) => {
				const rate: number = Number(event.options.time)
				if (!isNaN(rate)) {
					// enforce the range
					self.setGenerationRate(Math.max(1, Math.min(10, rate)))
				}
			},
		},
		//============================
		setGameWrap: {
			name: 'Set Game Board Wrapping',
			description: 'Wrap the game board so the left edge continues on the right edge, etc. ',
			options: [
				{
					id: 'wrap',
					type: 'checkbox',
					label: 'Wrap the grid',
					default: true,
					tooltip: 'Wrap the grid so edges continue on the opposite side',
				},
			],
			callback: async (event) => {
				const wrap = Boolean(event.options.wrap)
				await self.setWrap(wrap)
			},
		},
	})
}
