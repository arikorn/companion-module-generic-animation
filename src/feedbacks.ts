import { combineRgb } from '@companion-module/base'
import type { AnimationInstance } from './main.js'

export function UpdateFeedbacks(self: AnimationInstance): void {
	self.setFeedbackDefinitions({
		GridButton: {
			type: 'advanced',
			name: 'Set a button to display part of the grid',
			description:
				'Setup of a button that presents part of the whole grid.' +
				"  The button uses it's current position to determine which part of the grid to show.",
			options: [],
			callback: async (_feedback, context) => {
				const controlY = Number(await context.parseVariablesInString('$(this:row)'))
				const controlX = Number(await context.parseVariablesInString('$(this:column)'))
				const { y: bHeight, x: bWidth } = self.buttonGrid
				const span = { x: controlX * bWidth, y: controlY * bHeight, w: bWidth, h: bHeight }
				return {
					text: self.animation.getBoard().toGlyphString(self.off, self.on, span),
					show_topbar: false,
				}
			},
		},
		GameIsRunning: {
			type: 'boolean',
			name: 'Game of Life is running',
			description: 'Change appearance if Game of Life is running.',
			options: [],
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 0, 128),
			},
			callback: async (_) => {
				return self.animation.isGameRunning()
			},
		},
		ShuffleEnabled: {
			type: 'boolean',
			name: 'Shuffle is enabled',
			description: 'Change appearance if shuffle is enabled.',
			options: [],
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(146, 146, 0),
			},
			callback: async (_) => {
				return self.animation.randomizeQueue
			},
		},
		RepeatEnabled: {
			type: 'boolean',
			name: 'Repeat is enabled',
			description: 'Change appearance if playlist repeat is enabled.',
			options: [],
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(146, 146, 0),
			},
			callback: async (_) => {
				return self.animation.repeatQueue
			},
		},
		WrapEnabled: {
			type: 'boolean',
			name: 'Wrap is enabled',
			description: 'Change appearance if the board is set to wrap-around.',
			options: [],
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(146, 146, 0),
			},
			callback: async (_) => {
				return self.animation.getWrap()
			},
		},
		BoardInTransition: {
			type: 'boolean',
			name: 'Board is in (wipe) transition',
			description: 'Change appearance if the board is being transitioned to a new "starting" board.',
			options: [],
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(146, 20, 0),
			},
			callback: async (_) => {
				return self.animation.isWiping()
			},
		},
	})
}
