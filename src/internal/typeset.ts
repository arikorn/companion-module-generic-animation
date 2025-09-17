const letters = new Map()

export function typeset(text: string): number[][] {
	let result: Array<Array<number>> = Array.from({ length: 5 }, () => [])
	let line = 0
	for (const c of text) {
		if (c === '\n') {
			result = result.concat(Array.from({ length: 2 }, () => [])) // space between lines
			result = result.concat(Array.from({ length: 5 }, () => [])) // new line
			line += 7
			continue
		}
		const letter = letters.get(c.toUpperCase())
		if (letter === undefined) {
			console.log(`Unknown letter: '${c}' in:\n'${text}'`)
			continue
		}
		for (let idx = line; idx < result.length; idx++) {
			if (result[idx].length > 0) {
				result[idx] = result[idx].concat([0]) // add space before next letter
			}
			result[idx] = result[idx].concat(letter[idx - line])
		}
	}
	return result
}

letters.set(' ', [
	[0, 0],
	[0, 0],
	[0, 0],
	[0, 0],
	[0, 0],
])

letters.set("'", [[1], [1], [0], [0], [0]])

// 5 pixel-high letters.  7x5 may be nicer...
letters.set('A', [
	[0, 1, 1, 0],
	[1, 0, 0, 1],
	[1, 1, 1, 1],
	[1, 0, 0, 1],
	[1, 0, 0, 1],
])
letters.set('B', [
	[1, 1, 1, 0],
	[1, 0, 0, 1],
	[1, 1, 1, 0],
	[1, 0, 0, 1],
	[1, 1, 1, 0],
])
letters.set('C', [
	[0, 1, 1, 1],
	[1, 0, 0, 0],
	[1, 0, 0, 0],
	[1, 0, 0, 0],
	[0, 1, 1, 1],
])

letters.set('D', [
	[1, 1, 1, 0],
	[1, 0, 0, 1],
	[1, 0, 0, 1],
	[1, 0, 0, 1],
	[1, 1, 1, 0],
])
letters.set('E', [
	[1, 1, 1],
	[1, 0, 0],
	[1, 1, 1],
	[1, 0, 0],
	[1, 1, 1],
])
letters.set('F', [
	[1, 1, 1],
	[1, 0, 0],
	[1, 1, 1],
	[1, 0, 0],
	[1, 0, 0],
])
letters.set('G', [
	[0, 1, 1, 0],
	[1, 0, 0, 0],
	[1, 0, 1, 1],
	[1, 0, 0, 1],
	[0, 1, 1, 0],
])
letters.set('H', [
	[1, 0, 0, 1],
	[1, 0, 0, 1],
	[1, 1, 1, 1],
	[1, 0, 0, 1],
	[1, 0, 0, 1],
])
letters.set('I', [
	[1, 1, 1],
	[0, 1, 0],
	[0, 1, 0],
	[0, 1, 0],
	[1, 1, 1],
])
letters.set('J', [
	[0, 1, 1],
	[0, 0, 1],
	[0, 0, 1],
	[0, 0, 1],
	[1, 1, 0],
])
letters.set('K', [
	[1, 0, 0, 1],
	[1, 0, 1, 0],
	[1, 1, 0, 0],
	[1, 0, 1, 0],
	[1, 0, 0, 1],
])
letters.set('L', [
	[1, 0, 0],
	[1, 0, 0],
	[1, 0, 0],
	[1, 0, 0],
	[1, 1, 1],
])
letters.set('M', [
	[1, 1, 0, 1, 1],
	[1, 0, 1, 0, 1],
	[1, 0, 0, 0, 1],
	[1, 0, 0, 0, 1],
	[1, 0, 0, 0, 1],
])
letters.set('N', [
	[1, 0, 0, 0, 1],
	[1, 1, 0, 0, 1],
	[1, 0, 1, 0, 1],
	[1, 0, 0, 1, 1],
	[1, 0, 0, 0, 1],
])
letters.set('O', [
	[0, 1, 1, 0],
	[1, 0, 0, 1],
	[1, 0, 0, 1],
	[1, 0, 0, 1],
	[0, 1, 1, 0],
])
letters.set('P', [
	[1, 1, 1, 0],
	[1, 0, 0, 1],
	[1, 1, 1, 0],
	[1, 0, 0, 0],
	[1, 0, 0, 0],
])
letters.set('Q', [
	[0, 1, 1, 1, 0],
	[1, 0, 0, 0, 1],
	[1, 0, 0, 0, 1],
	[1, 0, 0, 1, 0],
	[0, 1, 1, 0, 1],
])

letters.set('R', [
	[1, 1, 1, 0],
	[1, 0, 0, 1],
	[1, 1, 1, 1],
	[1, 0, 1, 0],
	[1, 0, 0, 1],
])
letters.set('S', [
	[0, 1, 1, 1],
	[1, 0, 0, 0],
	[0, 1, 1, 0],
	[0, 0, 0, 1],
	[1, 1, 1, 0],
])
letters.set('T', [
	[1, 1, 1],
	[0, 1, 0],
	[0, 1, 0],
	[0, 1, 0],
	[0, 1, 0],
])
letters.set('U', [
	[1, 0, 0, 1],
	[1, 0, 0, 1],
	[1, 0, 0, 1],
	[1, 0, 0, 1],
	[0, 1, 1, 0],
])
letters.set('V', [
	[1, 0, 0, 0, 1],
	[1, 0, 0, 0, 1],
	[1, 0, 0, 0, 1],
	[0, 1, 0, 1, 0],
	[0, 0, 1, 0, 0],
])

letters.set('W', [
	[1, 0, 0, 0, 1],
	[1, 0, 0, 0, 1],
	[1, 0, 0, 0, 1],
	[1, 0, 1, 0, 1],
	[0, 1, 0, 1, 0],
])
letters.set('X', [
	[1, 0, 0, 0, 1],
	[0, 1, 0, 1, 0],
	[0, 0, 1, 0, 0],
	[0, 1, 0, 1, 0],
	[1, 0, 0, 0, 1],
])
letters.set('Y', [
	[1, 0, 0, 0, 1],
	[0, 1, 0, 1, 0],
	[0, 0, 1, 0, 0],
	[0, 0, 1, 0, 0],
	[0, 0, 1, 0, 0],
])
letters.set('Z', [
	[1, 1, 1],
	[0, 0, 1],
	[0, 1, 0],
	[1, 0, 0],
	[1, 1, 1],
])
