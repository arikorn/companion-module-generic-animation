// utility functions

// provide a random ordering of an array (or more technically, of 0:length-1)
export function randomOrder(length: number): number[] {
	const indexes = Array.from({ length: length }, (_, idx) => idx)

	// Fisher Yates method: https://www.w3schools.com/js/js_array_sort.asp#mark_random
	for (let i = indexes.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[indexes[i], indexes[j]] = [indexes[j], indexes[i]]
	}
	return indexes
}
