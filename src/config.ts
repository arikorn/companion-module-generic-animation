import { type SomeCompanionConfigField } from '@companion-module/base' //Regex,
import { DropdownChoiceId, DropdownChoice } from '@companion-module/base'

export interface LowresScreensaverConfig {
	buttonGrid: string
	boardSize: string
	updateRate: number
	wrap: boolean
}

// rows, columns
const boardSizes = [
	[30, 55],
	[10, 11],
	[30, 45],
	[40, 88],
]

// rows, columns within a button.
export const buttonSizes = [
	[10, 11], // default and best
	[9, 10],
	[8, 9],
	[7, 8],
	[6, 7],
]

export function configSizeToArray(size: string): number[] {
	return size.split(',').map((val) => Number(val))
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
			width: 12,
			choices: boardSizeChoices(),
			default: boardSizeDefault(),
		},
		{
			type: 'dropdown',
			id: 'buttonGrid',
			label: 'Grid Size INSIDE each button',
			width: 12,
			choices: buttonSizeChoices(),
			default: buttonSizeDefault(),
		},
		{
			type: 'number',
			id: 'updateRate',
			label: 'Game update rate (rounds/second)',
			width: 8,
			min: 1,
			max: 10, // note: currently the achievable max appears to be 8 Hz
			default: 5,
		},
		{
			type: 'checkbox',
			id: 'wrap',
			label: 'Wrap the grid so edges continue on the opposite side',
			width: 8,
			default: true,
		},
	]
}
