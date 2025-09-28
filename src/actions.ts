import {
	SomeCompanionActionInputField,
	DropdownChoice,
	CompanionInputFieldDropdown,
	CompanionInputFieldMultiDropdown,
} from '@companion-module/base'
import type { LowresScreensaverInstance } from './main.js'
//import { Grid } from './internal/grid.js'
import { shapes, shapesByCategory } from './internal/shapes.js'
import { buttonSizeDefault, buttonSizeChoices, boardSizeChoices, boardSizeDefault, cellCharChoices } from './config.js'

// Make the menu choices from the keys of the map.
//  If category is specified, filter for a particular category (uses the global variable shapesByCategory)
function makeChoicesFromMap(strMap: Map<string, any>, category: string | null = null): DropdownChoice[] {
	const keys = Array.from(strMap.keys()).filter((val) =>
		category === null ? true : shapesByCategory.get(category)!.includes(val),
	)
	return keys.sort().map((val) => ({ id: val, label: val }))
}

// make one menu for each category
function categoryMenus(allowMultiple = false): CompanionInputFieldDropdown[] | CompanionInputFieldMultiDropdown[] {
	const categories = Array.from(shapesByCategory.keys())
	// note: TypeScript objected to `type: allowMultiple ? 'multidropdown' : 'dropdown', so this is slightly more wordy
	if (allowMultiple) {
		return categories.map((category) => {
			const menuChoices = makeChoicesFromMap(shapes, category)
			return {
				id: category,
				type: 'multidropdown',
				label: `Select "${category}" Shapes:`,
				choices: menuChoices,
				default: menuChoices.map((val) => val.id),
				isVisibleExpression: `$(options:category) === "${category}"`,
			}
		})
	} else {
		return categories.map((category) => {
			const menuChoices = makeChoicesFromMap(shapes, category)
			return {
				id: category,
				type: 'dropdown',
				label: `Select "${category}" Shape:`,
				choices: menuChoices,
				default: menuChoices[0].id,
				isVisibleExpression: `$(options:category) === "${category}"`,
			}
		})
	}
}

function createShapeOptions(self: LowresScreensaverInstance, allowMultiple = false): SomeCompanionActionInputField[] {
	return [
		{
			id: 'category',
			type: 'dropdown',
			label: 'Select Category',
			choices: [...makeChoicesFromMap(shapesByCategory)],
			default: 'continuous',
		},
		...categoryMenus(allowMultiple),
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
		{
			id: 'replace',
			type: 'checkbox',
			label: 'Replace playlist',
			tooltip: 'Replace the current playlist with the selected items.',
			default: true,
			isVisibleExpression: `true === ${allowMultiple}`,
		},
	]
}

// An alternative method that could be implemented with subscribe: rewrite the shape menu whenever category changes.
// at some point we can either convert this file to a class
//const currentFilter = new Map<string, string>()

// function myFilter(options:CompanionOptionValues, self: LowresScreensaverInstance): boolean {
// 	const category = event.options.category as string
// 	if (!currentFilter.has(event.id)) {
// 		currentFilter.set(event.id, category)
// 		self.updateActions()
// 	} else if (currentFilter.get(event.id) !== category) {
// 		self.updateActions()
// 	}

// 	return true
// }

const enum OnOff {
	Off = 0,
	On = 1,
	Toggle = -1,
}

const onOffChoices = [
	{ id: OnOff.On, label: 'Enable' },
	{ id: OnOff.Off, label: 'Disable' },
	{ id: OnOff.Toggle, label: 'Toggle' },
]

export function UpdateActions(self: LowresScreensaverInstance): void {
	self.setActionDefinitions({
		startGame: {
			name: 'Start/Stop (Play/Pause) the Game',
			options: [
				{
					id: 'action',
					type: 'dropdown',
					label: 'Action',
					choices: [
						{ id: OnOff.On, label: 'Start' },
						{ id: OnOff.Off, label: 'Stop' },
						{ id: OnOff.Toggle, label: 'Toggle' },
					],
					default: OnOff.Toggle,
				},
			],
			callback: async (event) => {
				let action = event.options.action ?? null

				if (action === null) {
					console.log('Undefined Start/Stop action!')
					return
				}
				if (action === OnOff.Toggle) {
					action = self.state.isRunning() ? OnOff.Off : OnOff.On
				}
				if (action === OnOff.Off) {
					self.stopGame()
				} else {
					self.startGame()
				}
			},
		},
		//============================
		setRepeat: {
			name: 'Enable Repeat',
			description: 'Choose whether or not to repeat the playlist when it is completed.',
			options: [
				{
					id: 'repeat',
					type: 'dropdown',
					label: 'Enable Repeat',
					choices: onOffChoices,
					default: OnOff.Toggle,
				},
			],
			callback: async ({ options }) => {
				let repeat = options.repeat ?? null
				if (repeat === OnOff.Toggle) {
					repeat = self.state.repeatQueue ? OnOff.Off : OnOff.On
				}
				if (repeat !== null) {
					self.setRepeat(repeat === OnOff.On)
				}
			},
		},
		//============================
		setRandomOrder: {
			name: 'Enable Shuffle',
			description: 'Choose whether or not to play the playlist in random order (shuffle).',
			options: [
				{
					id: 'random',
					type: 'dropdown',
					label: 'Enable Shuffle (Random Ordering)',
					tooltip:
						'Determine whether the playlist of board configurations should be randomized.' +
						' Note: this command does not randomize the current playlist.',
					choices: onOffChoices,
					default: OnOff.Toggle,
				},
			],
			callback: async ({ options }) => {
				let random = options.random ?? null
				if (random === OnOff.Toggle) {
					random = self.state.randomizeQueue ? OnOff.Off : OnOff.On
				}
				if (random !== null) {
					self.setRandomize(random === OnOff.On)
				}
			},
		},
		//============================
		setShape: {
			name: 'Set Shape',
			description: 'Put a shape on the board. Note that this clears the current board and playlist.',
			options: createShapeOptions(self),
			callback: async (event) => {
				const category = event.options?.category
				const shapeName = event.options?.[category as string] as string
				if (shapeName === undefined || shapeName === null) {
					return
				}
				const position = event.options.pos as string
				const offset = { x: Number(event.options.xOffset), y: Number(event.options.yOffset) }
				//const theShape = shapes.get(shapeName)
				const shapeSpec = { shapeName: shapeName, alignment: position, offset: offset }
				self.state.stop() // just to be safe. "manual" stop() should not affect the queue
				// replace the queue with the current shape. (This allows it to be played on repeat, for example.)
				//  and also allows other shapes to be queued without removing this shape from the board.
				self.state.clearShapeQueue()
				self.state.pushShapeQueue([shapeSpec])
				self.replaceBoard(self.state.newBoard(shapeSpec))
			},
		},
		//============================
		setShapeQueue: {
			name: 'Set or Add to Playlist of Shapes',
			options: createShapeOptions(self, true), // allow multiple
			callback: async ({ options }) => {
				if (options !== undefined && options.category !== undefined) {
					const category = String(options.category)
					if (options[category] !== undefined) {
						const shapes = options[category] as string[]
						const position = options.pos as string
						const offset = { x: Number(options.xOffset), y: Number(options.yOffset) }
						const elements = shapes.map((shape) => ({ shapeName: shape, alignment: position, offset: offset }))
						const replace = options.replace as boolean
						if (replace) {
							self.state.clearShapeQueue()
						}
						// replace the board, or noop if pushShapeQueue returns null (queue was not empty)
						self.replaceBoard(self.state.pushShapeQueue(elements))
					}
				}
			},
		},
		//============================
		clearQueue: {
			name: 'Clear the Playlist',
			description:
				'Clear the playlist.' +
				' Note: this does not affect a currently-playing game but if something is playing it will not repeat.',
			options: [],
			callback: async (_event) => {
				self.state.clearShapeQueue()
			},
		},
		//============================
		nextInQueue: {
			name: 'Next Item in the Playlist',
			description: "Advance to the next item in the playlist (but don't start playing).",
			options: [],
			callback: async (_event) => {
				const nextItem = self.state.advanceQueue()
				if (nextItem === null) return // queue is empty, repeat is off
				// ELSE
				self.replaceBoard(self.state.newBoard(nextItem))
			},
		},
		//============================
		clearBoard: {
			name: 'Clear the Board',
			description:
				'Clear the board, stopping the current game. Note: to get the next board use "Next Item in the Playlist".',
			options: [],
			callback: async (_event) => {
				// Note: user should call nextInQueue to get the next board
				self.clearBoard()
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
		setGameDelay: {
			name: 'Set the delay between games in the playlist',
			options: [
				{
					id: 'time',
					type: 'number',
					label: 'Delay (ms)',
					default: 500,
					min: 0,
					max: 3000,
					range: true,
					tooltip: 'Enter the number of milliseconds between games when playing the playlist',
				},
			],
			callback: async (event) => {
				const delay = Number(event.options.time)
				if (!isNaN(delay)) {
					// enforce the range
					self.state.gameDelay = delay
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
					type: 'dropdown',
					label: 'Wrap the grid',
					choices: onOffChoices,
					default: OnOff.Toggle,
					tooltip: 'Wrap the grid so edges continue on the opposite side',
				},
			],
			callback: async ({ options }) => {
				let wrap = options.wrap ?? null
				if (wrap === OnOff.Toggle) {
					wrap = self.state.getWrap() ? OnOff.Off : OnOff.On
				}
				if (wrap !== null) {
					self.setWrap(wrap === OnOff.On)
				}
			},
		},
	})
}
