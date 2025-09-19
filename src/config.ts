import { type SomeCompanionConfigField } from '@companion-module/base' //Regex,

export interface LowresScreensaverConfig {
	boardSize: string
	interval: number
}

const boardSizes = [
	[30, 55],
	[10, 11],
	[30, 45],
	[40, 88],
]

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'dropdown',
			id: 'boardSize',
			label: 'Internal Board Size',
			width: 8,
			choices: [
				...boardSizes.map((val) => {
					return { id: val.join(','), label: val.join('x') }
				}),
			],
			default: boardSizes[1].join(','),
		},
		{
			type: 'number',
			id: 'interval',
			label: 'Interval between turns',
			width: 5,
			min: 10,
			max: 1000,
			default: 500,
		},
	]
}
