import { type SomeCompanionConfigField } from '@companion-module/base' //Regex,
import { DropdownChoiceId, DropdownChoice } from '@companion-module/base'
import { Coord } from './internal/grid.js'

export interface LowresScreensaverConfig {
	buttonGrid: string
	boardSize: string
	updateRate: number
	wrap: boolean
}

// columns, rows
const boardSizes = [
	[55, 30],
	[11, 10],
	[60, 30],
	[88, 40],
]

// columns, rows within a button.
const buttonSizes = [
	[11, 10], // default and best
	[10, 9],
	[9, 8],
	[8, 7],
	[7, 6],
]

export function configSizeToCoord(size: string): Coord {
	const sizeArr = size.split(',').map((val) => Number(val))
	return { x: sizeArr[0], y: sizeArr[1] }
}

export function buttonSizeChoices(): DropdownChoice[] {
	return buttonSizes.map((val) => ({ id: val.join(','), label: val.join('x') }))
}

export function buttonSizeDefault(): DropdownChoiceId {
	return buttonSizeChoices()[0].id
}

export function boardSizeChoices(): DropdownChoice[] {
	return [
		{ id: 'fit5x3', label: 'fit to 5x3 surface' },
		{ id: 'fit8x4', label: 'fit to 8x4 surface' },
		...boardSizes.map((val) => ({ id: val.join(','), label: val.join('x') })),
	]
}

export function boardSizeDefault(): DropdownChoiceId {
	return boardSizeChoices()[0].id
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'dropdown',
			id: 'boardSize',
			label: 'Internal Board Size',
			tooltip:
				'Specify the size of the board (width x height). The board may need not all be visible, or may be smaller than the size allowed by the surface.',
			width: 12,
			choices: boardSizeChoices(),
			default: boardSizeDefault(),
		},
		{
			type: 'dropdown',
			id: 'buttonGrid',
			label: 'Grid Size INSIDE each button',
			tooltip: 'Specify the size of the subgrid (width x height) shown on a button.',
			width: 12,
			choices: buttonSizeChoices(),
			default: buttonSizeDefault(),
		},
		{
			type: 'number',
			id: 'updateRate',
			label: 'Game update rate (rounds/second)',
			tooltip: 'Specify have many generations are computed each second.',
			width: 8,
			min: 1,
			max: 10, // note: currently the achievable max appears to be 8 Hz
			default: 5,
		},
		{
			type: 'checkbox',
			id: 'wrap',
			label: 'Wrap the grid so edges continue on the opposite side',
			tooltip: 'Generally, leaving "wrap" on is more interesting.',
			width: 8,
			default: true,
		},
	]
}
