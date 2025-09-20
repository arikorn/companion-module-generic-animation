import { combineRgb } from '@companion-module/base'
import type { LowresScreensaverInstance } from './main.js'

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
					text: self.state.getBoard().toGlyphString(self.off, self.on),
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
					text: self.state.getBoard().toGlyphString(self.off, self.on, span),
					show_topbar: false,
				}
			},
		},
	})
}
