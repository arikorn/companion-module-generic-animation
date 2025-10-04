import {
	SomeCompanionActionInputField,
	DropdownChoice,
	CompanionInputFieldDropdown,
	CompanionInputFieldMultiDropdown,
} from '@companion-module/base'
import type { AnimationInstance } from './main.js'
import { BoardQueueItem } from './animation/controller.js'
import { shapes, shapesByCategory } from './animation/shapes.js'
import { buttonSizeDefault, buttonSizeChoices, boardSizeChoices, boardSizeDefault, cellCharChoices } from './config.js'
import { readPNG } from './animation/utilities.js'
import { Coord } from './animation/grid.js'

// Make the menu choices from the keys of the map.
//  If category is specified, filter for a particular category (uses the global variable shapesByCategory)
function makeChoicesFromMap(strMap: Map<string, any>, category: string | null = null): DropdownChoice[] {
	const keys = Array.from(strMap.keys()).filter((val) =>
		category === null ? true : shapesByCategory.get(category)!.includes(val),
	)
	const choices = keys.sort().map((val) => ({ id: val, label: val }))
	return choices
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

function createShapeOptions(self: AnimationInstance, allowMultiple = false): SomeCompanionActionInputField[] {
	return [
		{
			id: 'category',
			type: 'dropdown',
			label: 'Select Category',
			choices: [
				{ id: 'Custom_text', label: 'Custom text' },
				{ id: 'PNG_file', label: 'Import PNG File' },
				...makeChoicesFromMap(shapesByCategory),
			],
			default: 'continuous',
		},
		...categoryMenus(allowMultiple),
		{
			id: 'Custom_text',
			type: 'textinput',
			label: 'Text message:',
			default: '',
			isVisibleExpression: `$(options:category) === "Custom_text"`,
		},
		{
			id: 'PNG_file',
			type: 'textinput',
			label: 'PNG Filename:',
			default: '',
			isVisibleExpression: `$(options:category) === "PNG_file"`,
		},
		{
			id: 'threshold',
			type: 'number',
			label: 'Brightness Threshold',
			default: -1,
			min: -1,
			max: 255,
			range: true,
			tooltip: 'Enter the threshold for converting grayscale images to bitmaps. Use -1 for an automated best-guess',
			isVisibleExpression: `$(options:category) === "PNG_file"`,
		},
		{
			id: 'alignment',
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
			//isVisibleExpression: `true === ${allowMultiple}`,
		},
	]
}

// An alternative method that could be implemented with subscribe: rewrite the shape menu whenever category changes.
// at some point we can either convert this file to a class
//const currentFilter = new Map<string, string>()

// function myFilter(options:CompanionOptionValues, self: AnimationInstance): boolean {
// 	const category = event.options.category as string
// 	if (!currentFilter.has(event.id)) {
// 		currentFilter.set(event.id, category)
// 		self.updateActions()
// 	} else if (currentFilter.get(event.id) !== category) {
// 		self.updateActions()
// 	}

// 	return true
// }

export const enum OnOff {
	Off = 0,
	On = 1,
	Toggle = -1,
}

const onOffChoices = [
	{ id: OnOff.On, label: 'Enable' },
	{ id: OnOff.Off, label: 'Disable' },
	{ id: OnOff.Toggle, label: 'Toggle' },
]

// ****************************************************************
export function UpdateActions(self: AnimationInstance): void {
	self.setActionDefinitions({
		startGame: {
			name: 'Start/Stop (Play/Pause) the Game',
			description: 'Start or Stop a Game. Note that stopping will also stop a board transition.',
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
					action = self.animation.isRunning() ? OnOff.Off : OnOff.On
				}
				if (action === OnOff.Off) {
					//debug: console.log(`action.stopGame()`)
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
					repeat = self.animation.repeatQueue ? OnOff.Off : OnOff.On
				}
				if (repeat !== null) {
					await self.setRepeat(repeat === OnOff.On)
				}
			},
		},
		//============================
		setShuffle: {
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
					random = self.animation.randomizeQueue ? OnOff.Off : OnOff.On
				}
				if (random !== null) {
					await self.setRandomize(random === OnOff.On)
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
				let shapeName: string | Coord[]
				if (category === 'Custom_text') {
					shapeName = 'text'
				} else if (category === 'PNG_file') {
					const filename = event.options.PNG_file as string
					const threshold = event.options.threshold as number
					try {
						shapeName = readPNG(filename, threshold, self.animation.getBoardSize())
					} catch (error) {
						console.error('Error reading PNG file:' + filename, error)
						return
					}
				} else {
					shapeName = event.options?.[category as string] as string
				}
				if (shapeName === undefined || shapeName === null) {
					return
				}
				const alignment = event.options.alignment as string
				const offset = { x: Number(event.options.xOffset), y: Number(event.options.yOffset) }
				//const theShape = shapes.get(shapeName)
				const shapeSpec = { shapeName: shapeName, alignment: alignment, offset: offset } as BoardQueueItem
				if (shapeName === 'text') {
					shapeSpec.text = event.options.Custom_text as string
				}
				self.stopGame() // just to be safe. "manual" stop() should not affect the queue
				// replace the queue with the current shape. (This allows it to be played on repeat, for example.)
				//  and also allows other shapes to be queued without removing this shape from the board.
				self.animation.clearShapeQueue()
				self.animation.pushShapeQueue([shapeSpec])
				await self.replaceBoard(self.animation.newBoard(shapeSpec))
			},
		},
		//============================
		setShapeFromPNG: {
			name: 'Load Custom Shape (PNG)',
			options: [
				{
					id: 'filename',
					type: 'textinput',
					label: 'Filename:',
					default: '',
				},
				{
					id: 'threshold',
					type: 'number',
					label: 'Brightness Threshold',
					default: -1,
					min: -1,
					max: 255,
					range: true,
					tooltip: 'Enter the threshold for converting grayscale images to bitmaps. Use -1 for an automated best-guess',
				},
			],
			callback: async ({ options }) => {
				const filename = options.filename as string
				const threshold = options.threshold as number
				try {
					const coords = readPNG(filename, threshold, self.animation.getBoardSize())
					const shapeSpec = { shapeName: coords, alignment: 'center', offset: { x: 0, y: 0 } } as BoardQueueItem
					self.stopGame() // just to be safe.
					self.animation.clearShapeQueue()
					self.animation.pushShapeQueue([shapeSpec])
					await self.replaceBoard(self.animation.newBoard(shapeSpec))
				} catch (error) {
					console.error('Error reading PNG file:' + filename, error)
					// throw error
					// TODO? could have a feedback triggered on error and/or a variable...
				}
			},
		},
		//============================
		setShapeQueue: {
			name: 'Set or Add to Playlist of Shapes',
			description:
				'Set or add one or more shapes to the playlist. Uncheck the "Replace Playlist" option to add to the existing playlist.',
			options: createShapeOptions(self, true), // allow multiple
			callback: async ({ options }) => {
				if (options !== undefined && options.category !== undefined) {
					const category = String(options.category)
					let shapeNames: string[]
					if (category === 'Custom_text') {
						shapeNames = ['text']
					} else {
						shapeNames = options[category] as string[]
					}
					const usertext = options.Custom_text as string
					const alignment = options.alignment as string
					const offset = { x: Number(options.xOffset), y: Number(options.yOffset) }
					const elements = shapeNames.map((shape) => ({
						shapeName: shape,
						alignment: alignment,
						offset: offset,
						text: usertext,
					}))
					const replace = options.replace as boolean
					if (replace) {
						self.animation.clearShapeQueue()
					}
					// replace the board, or noop if pushShapeQueue returns null (queue was not empty)
					await self.replaceBoard(self.animation.pushShapeQueue(elements))
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
				self.animation.clearShapeQueue()
			},
		},
		//============================
		nextInQueue: {
			name: 'Next Item in the Playlist',
			description: "Advance to the next item in the playlist (but don't start playing).",
			options: [],
			callback: async (_event) => {
				const nextItem = self.animation.advanceQueue()
				if (nextItem === null) return // queue is empty, repeat is off
				// ELSE
				await self.replaceBoard(self.animation.newBoard(nextItem))
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
				await self.clearBoard()
			},
		},
		//============================
		setButtonGrid: {
			name: 'Set Button Grid Size',
			description: 'Set the size of the subgrid INSIDE each button.',
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
			description:
				"Set the size of the underlying board. Generally it's best to fit to the button grid of your surface.",
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
			name: 'Set Game Update Rate (Speed)',
			options: [
				{
					id: 'time',
					type: 'number',
					label: 'Frequency (rounds/second)',
					default: 5,
					min: 1,
					max: 10,
					range: true,
					tooltip: 'Enter the number of generations per second. (Note: 8 may be the actual achievable max)',
				},
			],
			callback: async (event) => {
				const rate: number = Number(event.options.time)
				if (!isNaN(rate)) {
					// enforce the range
					await self.setGenerationRate(Math.max(1, Math.min(10, rate)))
				}
			},
		},
		//============================
		setGameDelay: {
			name: 'Set the delay between games in the playlist',
			description:
				'Set the number of ms to wait after the game is finished and after shifting in the next board in the playlist before starting.',
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
				if (!isNaN(delay) && delay > 0) {
					self.animation.gameDelay = delay
				}
			},
		},
		//============================
		setIdleTimer: {
			name: 'Set the idle timer',
			description:
				'Set a timer for the specified time. ' +
				'Typically a Trigger is set up with this action resetting the timeout on button presses. A second Trigger start a screensaver if the timeout expires.',
			options: [
				{
					id: 'time',
					type: 'number',
					label: 'Idle Timeout (minutes)',
					default: 5.0,
					min: 1.0,
					max: 60.0,
					range: true,
					tooltip: 'Enter the number of minutes before the timer set the "timeout" state.',
				},
			],
			callback: async (event) => {
				const minutes = Number(event.options.time)
				if (!isNaN(minutes) && minutes > 0) {
					self.setIdleTimeout(minutes)
				}
			},
		},
		//============================
		setCellCharacters: {
			name: 'Set Cell Characters',
			description: 'Choose the style of the grid inside each button.',
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
					await self.setOnfOffChars(String(event.options.onOffChars))
				}
			},
		},
		//============================
		setGameWrap: {
			name: 'Set Game Board Wrapping (ADVANCED)',
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
					wrap = self.animation.getWrap() ? OnOff.Off : OnOff.On
				}
				if (wrap !== null) {
					await self.setWrap(wrap === OnOff.On)
				}
			},
		},
	})
}
