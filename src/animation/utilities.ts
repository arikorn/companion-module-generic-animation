// utility functions
import UPNG from 'upng-js'
import fs from 'fs'
import { Coord } from './grid.js'
import { shapeFromBitmap } from './shapes.js'

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

function imageDatatoArray(decodedPng: UPNG.Image, threshold: number, maxSize: Coord | null): Coord[] {
	const { width, height } = decodedPng
	if (maxSize === null) {
		maxSize = { x: width, y: height }
	}
	// Convert to RGBA8 format
	// UPNG.toRGBA8 returns an array of frames; for a static PNG, take the first frame.
	const imageData = UPNG.toRGBA8(decodedPng)[0]

	const pixelData = new Uint8Array(imageData) // Uint8Array of RGBA values

	const array2D: number[][] = [] // will be row-wise 2D
	for (let y = 0; y < Math.min(height, maxSize.y); y++) {
		const rowIdx = y * width * 4
		const rowData = pixelData.slice(rowIdx, rowIdx + width * 4)
		const rowGrayData = []
		for (let x = 0; x < Math.min(width, maxSize.x) * 4; x += 4) {
			// x = 0.299r + 0.587g + 0.114b (Human-vision weighted average)
			rowGrayData.push((0.299 * rowData[x] + 0.587 * rowData[x + 1] + 0.114 * rowData[x + 2]) * (rowData[x + 3] / 255))
		}
		array2D[y] = rowGrayData
	}
	if (threshold < 0) {
		// Compute a reasonable "midtone" value for the whole image
		const array1D = array2D.flat()
		const minVal = array1D.reduce((prev, curr) => Math.min(prev, curr), array1D[0])
		const maxVal = array1D.reduce((prev, curr) => Math.max(prev, curr), array1D[0])
		//const array1Dsorted = array1D.filter((val) => val > minVal).sort()
		//const medianValue = array1Dsorted[Math.floor(array1D.length / 2)]
		threshold = minVal + (maxVal - minVal) / 3
	}
	const bitmap = array2D.map((row) => row.map((val) => (val >= threshold ? 1 : 0)))
	return shapeFromBitmap(bitmap)
}

export function readPNG(filename: string, threshold: number, maxSize: Coord | null = null): Coord[] {
	const buffer = fs.readFileSync(filename)
	const pngBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
	const decodedPng = UPNG.decode(pngBuffer)

	return imageDatatoArray(decodedPng, threshold, maxSize)
}
