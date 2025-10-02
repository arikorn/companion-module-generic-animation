import { CompanionPresetDefinitions } from '@companion-module/base'
import { combineRgb } from '@companion-module/base'
import { AnimationInstance } from './main.js'
import { OnOff } from './actions.js'
//import { boardSizeChoices } from './config.js'

export function getPreset(_self: AnimationInstance): CompanionPresetDefinitions {
	const presets: CompanionPresetDefinitions = {}
	presets.GridButton = {
		category: '  Grid Button!',
		name: `Grid Button - Drag onto all buttons on one page (or drag once and use keyboard to copy to the rest).`,
		type: 'button',
		style: {
			text: '',
			size: 'auto',
			color: combineRgb(146, 146, 146),
			bgcolor: combineRgb(0, 0, 0),
		},
		previewStyle: {
			text: '',
			size: 'auto',
			bgcolor: combineRgb(80, 80, 80),
			color: combineRgb(220, 220, 220),
		},
		feedbacks: [
			{
				feedbackId: 'GridButton',
				options: {},
			},
		],
		steps: [
			{
				down: [
					{
						actionId: 'startGame',
						options: {
							action: OnOff.Toggle,
						},
					},
				],
				up: [],
			},
		],
	}

	presets.startGame = {
		category: ' Game Settings',
		name: 'Start/Stop Game',
		type: 'button',
		style: {
			text: 'Start Game',
			size: 'auto',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		previewStyle: {
			text: 'Start / Stop Game',
			size: 'auto',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		feedbacks: [
			{
				feedbackId: 'GameIsRunning',
				options: {},
				style: {
					text: 'Stop Game',
					color: combineRgb(0, 0, 0),
					bgcolor: combineRgb(146, 146, 0),
				},
			},
		],
		steps: [
			{
				down: [
					{
						actionId: 'startGame',
						options: {
							action: OnOff.Toggle,
						},
					},
				],
				up: [],
			},
		],
	}

	presets.gameStatus = {
		category: ' Game Settings',
		name: 'Game Status (display-only)',
		type: 'button',
		style: {
			text: 'Gen: $(animation:generation)\\nPop: $(animation:population)\\n$(animation:boardSize)',
			size: 'auto',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		feedbacks: [
			{
				feedbackId: 'GameIsRunning',
				options: {},
				style: {
					color: combineRgb(0, 0, 0),
					bgcolor: combineRgb(146, 146, 0),
				},
			},
			{
				feedbackId: 'BoardInTransition',
				options: {},
				style: {
					color: combineRgb(0, 0, 0),
					bgcolor: combineRgb(146, 0, 0),
				},
			},
		],
		steps: [],
	}

	// Don't add presets for boardsize/buttonGridSize for now -- user should just set it in config.
	//for (let boardSize of boardSizeChoices().map((obj)=>obj.id).filter((id)=>id.includes('fit'))) {
	//}

	presets.setRepeat = {
		category: ' Game Settings',
		name: 'Set Playlist Repeat',
		type: 'button',
		style: {
			text: 'Enable Repeat',
			size: 'auto',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		previewStyle: {
			text: 'Toggle Repeat',
			size: 'auto',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		feedbacks: [
			{
				feedbackId: 'RepeatEnabled',
				options: {},
				style: {
					text: 'Disable Repeat',
					color: combineRgb(0, 0, 0),
					bgcolor: combineRgb(146, 146, 0),
				},
			},
		],
		steps: [
			{
				down: [
					{
						actionId: 'setRepeat',
						options: {
							repeat: OnOff.Toggle,
						},
					},
				],
				up: [],
			},
		],
	}

	presets.setShuffle = {
		category: ' Game Settings',
		name: 'Set Playlist Shuffle',
		type: 'button',
		style: {
			text: 'Enable Shuffle',
			size: 'auto',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		previewStyle: {
			text: 'Toggle Shuffle',
			size: 'auto',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		feedbacks: [
			{
				feedbackId: 'ShuffleEnabled',
				options: {},
				style: {
					text: 'Disable Shuffle',
					color: combineRgb(0, 0, 0),
					bgcolor: combineRgb(146, 146, 0),
				},
			},
		],
		steps: [
			{
				down: [
					{
						actionId: 'setShuffle',
						options: {
							random: OnOff.Toggle,
						},
					},
				],
				up: [],
			},
		],
	}

	presets.setGameRate = {
		category: ' Game Settings',
		name: 'Set Update Rate',
		type: 'button',
		style: {
			text: 'Set Update Rate to 4',
			size: 'auto',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'setGameRate',
						options: {
							time: 4,
						},
					},
				],
				up: [],
			},
		],
	}

	presets.setShape = {
		category: 'Board Content',
		name: 'Set Board (Example)',
		type: 'button',
		style: {
			text: 'Set Shape to "pi"',
			size: 'auto',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'setShape',
						options: {
							category: 'pretty',
							pretty: 'pi',
							alignment: 'center',
							xOffset: 0,
							yOffset: 0,
							replace: true,
						},
					},
				],
				up: [],
			},
		],
	}

	const multi = [
		{ category: 'symmetry', symmetry: ['vertical24', 'H-H', 'JG sort of', 'doorbell'] },
		{
			category: 'long-lived',
			'long-lived': [
				'Herschel climber',
				'R-pentomino',
				'gliders and blocks 1500 gen',
				'acorn (methuselah)',
				'horiz5 x 5 ornamented',
			],
		},
	]

	for (const setting of multi) {
		presets[`setMultipleShapes_${setting.category}`] = {
			category: 'Board Content',
			name: `Set "${setting.category}" Playlist for Board (Example)`,
			type: 'button',
			style: {
				text: `Set "${setting.category}" Playlist`,
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			feedbacks: [],
			steps: [
				{
					down: [
						{
							actionId: 'setShapeQueue',
							options: {
								...setting,
								alignment: 'center',
								xOffset: 0,
								yOffset: 0,
								replace: true,
							},
						},
					],
					up: [],
				},
			],
		}
	}

	presets.setShapeFromText = {
		category: 'Board Content',
		name: 'Set Board from Text',
		type: 'button',
		style: {
			text: 'Set Board from text',
			size: 'auto',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		previewStyle: {
			text: 'Set Board from text',
			size: 'auto',
			bgcolor: combineRgb(255, 0, 255),
			color: combineRgb(255, 255, 255),
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'setShape',
						options: {
							category: 'Custom_text',
							Custom_text: 'Hello World',
							alignment: 'center',
							xOffset: 0,
							yOffset: 0,
							replace: true,
						},
					},
				],
				up: [],
			},
		],
	}

	presets.setShapeFromPNG = {
		category: 'Board Content',
		name: 'Set Board from PNG file',
		type: 'button',
		style: {
			text: 'Set Board from PNG',
			size: 'auto',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		previewStyle: {
			text: 'Set Board from PNG',
			size: 'auto',
			bgcolor: combineRgb(255, 0, 255),
			color: combineRgb(255, 255, 255),
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'setShapeFromPNG',
						options: {
							filename: '<full path to file>',
							threshold: -1,
						},
					},
				],
				up: [],
			},
		],
	}

	return presets
}
