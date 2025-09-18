import { combineRgb } from '@companion-module/base'
import type { LowresScreensaverInstance } from './main.js'

export const on = '⬛'
export const off = '⬜'

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
			],
			callback: async (feedback, context) => {
				const controlY = Number(await context.parseVariablesInString('$(this:row)'))
				const controlX = Number(await context.parseVariablesInString('$(this:column)'))
				const opt = feedback.options.X_Y
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
			description: 'Change button text',
			options: [],
			callback: async (_feedback) => {
				//const controlY = Number(await context.parseVariablesInString('$(this:row)'))
				//const controlX = Number(await context.parseVariablesInString('$(this:column)'))
				// const textVal = Array.from({ length: self.boardSize[0] }, () => new Array(self.boardSize[1]).fill(off)) //.join('\n')
				// for (let x = 0; x < self.boardSize[0]; x++) {
				// 	textVal[x][x] = on
				// }

				return {
					color: combineRgb(146, 146, 146),
					bgcolor: combineRgb(0, 0, 0),
					text: self.state.getBoard().toGlyphString(off, on), // textVal.map((val) => val.join('')).join('\n'),
					show_topbar: false,
				}
			},
		},
	})
}
