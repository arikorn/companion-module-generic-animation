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
			text: '\\nRepeat', // 🔁 = 0x1F501 didn't render well
			size: 'auto',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
			png64: repeatIcon,
			pngalignment: 'center:top',
		},
		feedbacks: [
			{
				feedbackId: 'RepeatEnabled',
				options: {},
				style: {
					color: combineRgb(0, 0, 0),
					bgcolor: 0x999900, // or orange: combineRgb(202, 96, 0),
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
			text: '\\nShuffle', // 🔀\uFE0E\ renders poorly '🔀', and doesn't honor the variation selector.
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
			png64: shuffleIcon,
			pngalignment: 'center:top',
		},
		feedbacks: [
			{
				feedbackId: 'ShuffleEnabled',
				options: {},
				style: {
					color: combineRgb(0, 0, 0),
					bgcolor: 0x999900, // or orange: combineRgb(202, 96, 0),
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
		name: 'Set Update Rate Example',
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

	const single = [
		{ category: 'pretty', pretty: 'pi', name: 'pi' },
		{ category: 'continuous', continuous: 'glider gun protected on 88x40', name: 'glider gun (88x40)' },
		{ category: 'continuous', continuous: 'glider gun protected on 55x30', name: 'glider gun (55x30)' },
		{ category: 'continuous', continuous: 'double gun, protected on 88x40', name: 'double gun (88x40)' },
		{ category: 'continuous', continuous: 'double gun, protected on 55x30', name: 'double gun (55x30)' },
		{ category: 'continuous', continuous: 'freighter', name: 'freighter' },
		{ category: 'continuous', continuous: 'freighter x 3', name: 'freighter x 3' },
		//{ category: 'demo', continuous: 'Marquee, Life -> glider; 60x30', name: 'Marquee, Life -> glider; 60x30' },
	]

	for (const setting of single) {
		presets[`setShape_${setting.name}`] = {
			category: 'Playlists',
			name: `Set Board to "${setting.name}" (Example)`,
			type: 'button',
			style: {
				text: `Set Shape to "${setting.name}"`,
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
	const multi = [
		{
			category: 'classic',
			classic: [
				'B-heptomino',
				'R-pentomino',
				'Z-hexomino',
				'bunnies, transposed',
				'conway video',
				'dove',
				'rabbits',
				'time bomb',
			],
		},
		{ category: 'curiosity', curiosity: ['glider gun generator', 'blinker ship - grows'] },
		{
			category: 'glider generator',
			'glider generator': ['Herschel climber', 'glider gun', 'wing', 'wing x 2', 'wing x 3'],
		},
		{ category: 'symmetry', symmetry: ['vertical24', 'H-H', 'JG sort of', 'doorbell', 'pi'] },
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
		{
			category: 'medium-lived',
			'medium-lived': [
				'B-heptomino',
				'H-H',
				'H-H block',
				'bunnies',
				'bunnies, transposed',
				'house + mask',
				'indefinite3',
			],
		},
	]

	for (const setting of multi) {
		presets[`setMultipleShapes_${setting.category}`] = {
			category: 'Playlists',
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
		category: 'Playlists',
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
		category: 'Playlists',
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
						actionId: 'setShape',
						options: {
							category: 'PNG_file',
							PNG_file: '<full path to file>',
							threshold: -1,
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

	return presets
}

const shuffleIcon = `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`

const repeatIcon = `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
Cv+f2cMwkwmAAAAABJRU5ErkJggg==`
