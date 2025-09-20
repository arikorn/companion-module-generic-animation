import { combineRgb } from '@companion-module/base'
import type { LowresScreensaverInstance } from './main.js'

export const on = '\u2589' //'⯀' = \u2BC0  matches the blanks but is small //'⬛' \u2B1B ?
export const off = '⬜' //'\u115F' //'⬚'
// candidates for on
//'⬛' \u2B1B ? - from noto symbol 2 Geometric shapes - symbols and emoji
// '\u2588' - "full block" but not square (too tall)
// '\u2587' - "lower 7/8 block" is square but slightly too big..
// '\u2589' - "left 7/8 block" is just right!
// '\u25A0' is tiny!

// candidates for off:
// braille blank: '\u2800' - too narrow
// '\u115F' HANGUL CHOSEONG FILLER -- pretty close
// U+1160 HANGUL JUNGSEONG FILLER -- same
// '\u3164' HANGUL FILLER - same
// '⬚' --similar to above and good compromise with complete blank
// '⬜' -- \u2B1C, a perfect match for 2B1B or 2589, but brightest BG. Sanme Noto Symbol 2 group.
// various others either aren't blank or are zero-width such as '\ufffc' '\uE002F' '\u2000' series (en quad, en space, etc.)
//  right-t-left mark: '\u200F' has zero width

export function UpdateFeedbacks(self: LowresScreensaverInstance): void {
	self.setFeedbackDefinitions({
		Text_X_Y: {
			type: 'advanced',
			name: 'Test local variable',
			description: 'Change button text',
			options: [
				{
					id: 'X_Y',
					type: 'dropdown',
					label: 'X/Y',
					choices: [{ id: '$(this:row),$(this:column)', label: 'Just this' }],
					default: '$(this:row),$(this:column)',
				},
				{
					// this does not show up in options:
					id: 'X_Y_const',
					type: 'static-text',
					label: 'X/Y, too',
					value: '$(this:row),$(this:column)',
				},
			],
			callback: async (feedback, context) => {
				const controlY = Number(await context.parseVariablesInString('$(this:row)'))
				const controlX = Number(await context.parseVariablesInString('$(this:column)'))
				const opt = feedback.options.X_Y // not parsed with companion/base 1.11.x
				return {
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(72, 72, 72),
					text: `row:${controlY} col:${controlX} ${controlY + controlX}\n${opt}`,
				}
			},
		},
		Conway: {
			type: 'advanced',
			name: 'Setup a Conway button',
			description: 'Setup a button that represents an entire grid (not usually used)',
			options: [],
			callback: async (_feedback) => {
				//const controlY = Number(await context.parseVariablesInString('$(this:row)'))
				//const controlX = Number(await context.parseVariablesInString('$(this:column)'))

				return {
					color: combineRgb(146, 146, 146),
					bgcolor: combineRgb(0, 0, 0),
					text: self.state.getBoard().toGlyphString(off, on),
					show_topbar: false,
				}
			},
		},
		ConwayMulti: {
			type: 'advanced',
			name: 'Setup a Conway-subset button',
			description: 'Setup of a button that represents part of the whole grid. ',
			options: [],
			callback: async (_feedback, context) => {
				const controlY = Number(await context.parseVariablesInString('$(this:row)'))
				const controlX = Number(await context.parseVariablesInString('$(this:column)'))
				const { y: bHeight, x: bWidth } = self.buttonGrid
				const span = { x: controlX * bWidth, y: controlY * bHeight, w: bWidth, h: bHeight }
				return {
					color: combineRgb(146, 146, 146),
					bgcolor: combineRgb(0, 0, 0),
					text: self.state.getBoard().toGlyphString(off, on, span),
					show_topbar: false,
				}
			},
		},
	})
}
