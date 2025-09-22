import type { LowresScreensaverInstance } from './main.js'
import { Coord, Grid } from './internal/grid.js'
import { shapes, getShapeExtent /*, shapesByCategory*/ } from './internal/shapes.js'
import { buttonSizeDefault, buttonSizeChoices, boardSizeChoices, boardSizeDefault, cellCharChoices } from './config.js'

function makeChoices(strMap: Map<string, Coord[]>): any {
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
					min: -self.boardSize.x,
					max: self.boardSize.x,
					range: true,
					tooltip: 'Enter an X (columns) offset to the placement.',
				},
				{
					id: 'yOffset',
					type: 'number',
					label: 'y offset',
					default: 0,
					min: -self.boardSize.y,
					max: self.boardSize.y,
					range: true,
					tooltip: 'Enter a Y (rows) offset to the placement.',
				},
			],
			callback: async (event) => {
				const newBoard = new Grid(self.boardSize)
				const shapeName = event.options.shape
				const position = event.options.pos
				const userXOffset = Number(event.options.xOffset)
				const userYOffset = Number(event.options.yOffset)
				const theShape = shapes.get(shapeName)
				const shapeExt = getShapeExtent(theShape) // [min:Coord, max:Coord]
				const midBoard = { y: Math.round(self.boardSize.y / 2), x: Math.round(self.boardSize.x / 2) }
				const midShape = {
					x: Math.round((shapeExt[1].x + shapeExt[0].x) / 2),
					y: Math.round((shapeExt[1].y + shapeExt[0].y) / 2),
				}
				let offset: Coord = { x: 0, y: 0 }
				switch (position) {
					case 'center': {
						offset = { x: midBoard.x - midShape.x, y: midBoard.y - midShape.y }
						break
					}
					case 'top-center': {
						offset = { y: 0 - shapeExt[0].y, x: midBoard.x - midShape.x }
						break
					}
					case 'center-left': {
						offset = { y: midBoard.y - midShape.y, x: 0 - shapeExt[0].x }
						break
					}
					case 'bottom-center': {
						offset = { y: self.boardSize.y - (shapeExt[1].y - shapeExt[0].y) - 1, x: midBoard.x - midShape.x }
						break
					}
					case 'center-right': {
						offset = { y: midBoard.y - midShape.y, x: self.boardSize.x - (shapeExt[1].x - shapeExt[0].x) - 1 }
						break
					}
				}
				if (!isNaN(userXOffset)) {
					offset.x += userXOffset
				}
				if (!isNaN(userYOffset)) {
					offset.y += userYOffset
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
			name: 'Set Full-Board Grid Size',
			options: [
				{
					id: 'size',
					type: 'dropdown',
					label: 'Game Board Grid Size',
					choices: boardSizeChoices(),
					default: boardSizeDefault(),
					allowCustom: true,
					tooltip: 'Choose the size of the full grid.',
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
		setCellCharacters: {
			name: 'Set Cell Characters',
			options: [
				{
					id: 'onOffChars',
					type: 'dropdown',
					label: 'On/Off Character pairs',
					choices: cellCharChoices,
					default: cellCharChoices[0].id,
					tooltip:
						'Choose the character pair to represent "live" (on) and "dead" (off). Note that the colors are reversed and the relative sizes are misleading.',
				},
			],
			callback: async (event) => {
				if (event.options.onOffChars !== undefined) {
					self.setOnfOffChars(String(event.options.onOffChars))
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
