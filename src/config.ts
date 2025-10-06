import { type SomeCompanionConfigField } from '@companion-module/base' //Regex,
import { DropdownChoiceId, DropdownChoice } from '@companion-module/base'
import { Coord } from './animation/grid.js'

// see defaults definition below
export interface AnimationConfig {
	buttonGrid: string
	boardSize: string
	randomize: boolean
	repeat: boolean
	updateRate: number
	wrap: boolean
	onOffChars: string // two (or three?) character representing on, off, (and no-cell)
	showAdvancedConfig: boolean
}

// columns, rows
const boardSizes = [
	[55, 30],
	[11, 10],
	[60, 30], // special case for the marquee
	[88, 40],
	[90, 40], // special case for the marquee
]

// columns, rows within a button.
const buttonSizes = [
	[11, 10], // default and best
	[10, 10], // for square pixels
	[10, 9],
	[9, 8],
	[8, 7],
	[7, 6], // both 6-row options are about the same...
	[6, 6], // as good as 7x6
	[5, 5], // note depending on the "off" glyph this looks wrong, but it's right for the "on" glyph, which is what counts
	[4, 4], // the rest are here for completeness, not sure I'd recommend
	[3, 3],
	[2, 2],
	[1, 1],
]

// characters for "live" and "dead" cells:
export const cellCharChoices = [
	{ id: '\u2589⬜', label: '\u2589, ⬜: recommended: "on" is largest' },
	{ id: '⬛⬜', label: '⬛, ⬜: exact size-match but "on" is smaller' },
	{ id: '\u2589⬚', label: '\u2589, ⬚: dimmer background' },
	{ id: '\u2589\u3164', label: '\u2589, \u3164: no grid: best for 1-6 rows per button' },
]

// const on = '\u2589' //'⯀' = \u2BC0  matches the blanks but is small //'⬛' \u2B1B ?
// const off = '⬜' //'\u115F' //'⬚'
// candidates for on
//'⬛' \u2B1B ? - from noto symbol 2 Geometric shapes - symbols and emoji
// '\u2588' - "full block" but not square (too tall)
// '\u2587' - "lower 7/8 block" is square but slightly too big..
// '\u2589' - "left 7/8 block" is just right!
// '\u25A0' is tiny!

// candidates for off:
// braille blank: '\u2800' - too narrow
// '\u115F' HANGUL CHOSEONG FILLER -- pretty close, but this one causes Companion to choke!
// U+1160 HANGUL JUNGSEONG FILLER -- same
// '\u3164' HANGUL FILLER - same size, but Companion handles it as efficiently as the other characters.
// '⬚' --similar to above and good compromise with complete blank
// '⬜' -- \u2B1C, a perfect match for 2B1B or 2589, but brightest BG. Sanme Noto Symbol 2 group.
// various others either aren't blank or are zero-width such as '\ufffc' '\uE002F' '\u2000' series (en quad, en space, etc.)
//  right-t-left mark: '\u200F' has zero width

export function configSizeToCoord(size: string): Coord {
	const sizeArr = size.split(/[x,]/).map((val) => Number(val))
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
		{ id: 'fit5x3', label: 'fit to 5x3-button surface' },
		{ id: 'fit8x4', label: 'fit to 8x4-button surface (SD XL)' },
		{ id: 'fit4x3', label: 'fit to 4x3-button surface (SD+)' },
		{ id: 'fit4x2', label: 'fit to 4x2-button surface (SD+ or Neo)' },
		{ id: 'fit3x2', label: 'fit to 3x2-button surface (SD mini)' },
		...boardSizes.map((val) => ({ id: val.join('x'), label: val.join('x') })),
	]
}

export function boardSizeDefault(): DropdownChoiceId {
	return boardSizeChoices()[0].id
}

// this can be used to "dynamically" update existing configs
const defaultConfig: AnimationConfig = {
	buttonGrid: buttonSizeDefault() as string,
	boardSize: boardSizeDefault() as string,
	randomize: true,
	repeat: true,
	updateRate: 4,
	wrap: true,
	onOffChars: cellCharChoices[0].id,
	showAdvancedConfig: false,
}

export function updateConfig(config: AnimationConfig): boolean {
	let updated = false
	for (const key in defaultConfig) {
		if (!(key in config)) {
			// a bit of contortion to get past TypeScript errors "expression of type 'string' can't be used to index type 'AnimationConfig'."
			const obj = { [key]: defaultConfig[key as keyof AnimationConfig] }
			Object.assign(config, obj)
			updated = true
		}
	}
	return updated
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'checkbox',
			id: 'repeat',
			label: 'Enable Repeat',
			tooltip: 'When enabled, loop the playlist continuously.',
			width: 4,
			default: defaultConfig.repeat,
		},
		{
			type: 'checkbox',
			id: 'randomize',
			label: 'Enable Shuffle',
			tooltip: 'Determine whether the playlist of board configurations should be played in random order.',
			width: 4,
			default: defaultConfig.randomize,
		},
		{
			type: 'dropdown',
			id: 'boardSize',
			label: 'Total Board Size',
			tooltip:
				'Specify the size of the button grid ("fit to WxH") or the number of cells in the board (width x height). The board may be larger or smaller than the size allowed by the number of buttons times the button-grid size.',
			width: 9,
			choices: boardSizeChoices(),
			default: defaultConfig.boardSize,
			allowCustom: true,
		},
		{
			type: 'dropdown',
			id: 'buttonGrid',
			label: 'ADVANCED: Grid Size INSIDE each button',
			tooltip: 'Specify the size of the subgrid (width x height) shown on a button.',
			width: 9,
			choices: buttonSizeChoices(),
			default: defaultConfig.buttonGrid,
			isVisibleExpression: `$(options:showAdvancedConfig)`,
		},
		{
			type: 'number',
			id: 'updateRate',
			label: 'ADVANCED: Game update rate (rounds/second)',
			tooltip: 'Specify have many generations are computed each second.',
			width: 9,
			min: 1,
			max: 10, // note: currently the achievable max appears to be 8 Hz
			default: defaultConfig.updateRate,
			isVisibleExpression: `$(options:showAdvancedConfig)`,
		},
		{
			type: 'dropdown',
			id: 'onOffChars',
			label: 'ADVANCED: Glyphs for "on" and "off" -- see the help',
			tooltip:
				'Specify the pair of characters to represent cells that are, respectively, "on" (live) and "off" (dead).\nNote that the colors are reversed here and the relative scales are misleading',
			width: 9,
			choices: cellCharChoices,
			default: defaultConfig.onOffChars,
			isVisibleExpression: `$(options:showAdvancedConfig)`,
		},
		{
			type: 'checkbox',
			id: 'wrap',
			label: 'ADVANCED: Wrap the grid edges',
			tooltip:
				'If "on", the board continues on the opposite sides. Generally, leaving "wrap" on is more interesting, except for very small boards (like 5x3).',
			width: 9,
			default: defaultConfig.wrap,
			isVisibleExpression: `$(options:showAdvancedConfig)`,
		},
		{
			type: 'checkbox',
			id: 'showAdvancedConfig',
			label: 'Show advanced config options',
			width: 9,
			default: defaultConfig.showAdvancedConfig,
		},
	]
}
