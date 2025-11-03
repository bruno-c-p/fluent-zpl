// Image functionality tests - comprehensive coverage for image encoding

import {
  encodeDG,
  encodeGF,
  monoFromRGBA,
  type DitherMode,
  type MonoBitmap
} from '../src/image/encoder.js'

describe('Image Encoder', () => {
  describe('monoFromRGBA()', () => {
    test('should convert RGBA to monochrome with threshold mode', () => {
      // Create a 2x2 RGBA image: white, black, gray, white
      const rgba = new Uint8Array([
        255,
        255,
        255,
        255, // White pixel
        0,
        0,
        0,
        255, // Black pixel
        128,
        128,
        128,
        255, // Gray pixel
        255,
        255,
        255,
        255 // White pixel
      ])

      const mono = monoFromRGBA({
        rgba,
        width: 2,
        height: 2,
        mode: 'threshold',
        threshold: 200
      })

      expect(mono.width).toBe(2)
      expect(mono.height).toBe(2)
      expect(mono.bytesPerRow).toBe(1) // ceil(2/8) = 1
      expect(mono.bytes.length).toBe(2) // 1 byte per row * 2 rows
    })

    test('should handle different dither modes', () => {
      const rgba = new Uint8Array([
        128,
        128,
        128,
        255,
        128,
        128,
        128,
        255, // Gray pixels
        128,
        128,
        128,
        255,
        128,
        128,
        128,
        255 // Gray pixels
      ])

      const modes: DitherMode[] = ['none', 'threshold', 'fs', 'ordered']

      modes.forEach((mode) => {
        const mono = monoFromRGBA({
          rgba,
          width: 2,
          height: 2,
          mode,
          threshold: 128
        })

        expect(mono.width).toBe(2)
        expect(mono.height).toBe(2)
        expect(mono.bytesPerRow).toBe(1)
      })
    })

    test('should handle inversion', () => {
      // Create black and white pixels
      const rgba = new Uint8Array([
        0,
        0,
        0,
        255, // Black pixel
        255,
        255,
        255,
        255 // White pixel
      ])

      const normal = monoFromRGBA({
        rgba,
        width: 2,
        height: 1,
        invert: false
      })

      const inverted = monoFromRGBA({
        rgba,
        width: 2,
        height: 1,
        invert: true
      })

      // Inverted should be different from normal
      expect(normal.bytes[0]).not.toBe(inverted.bytes[0])
    })

    test('should handle different image sizes', () => {
      // Test various sizes to ensure proper byte packing
      const testSizes = [
        { width: 1, height: 1 },
        { width: 8, height: 1 },
        { width: 9, height: 1 },
        { width: 16, height: 1 },
        { width: 17, height: 2 }
      ]

      testSizes.forEach(({ width, height }) => {
        const rgba = new Uint8Array(width * height * 4).fill(255) // All white

        const mono = monoFromRGBA({
          rgba,
          width,
          height
        })

        expect(mono.width).toBe(width)
        expect(mono.height).toBe(height)
        expect(mono.bytesPerRow).toBe(Math.ceil(width / 8))
        expect(mono.bytes.length).toBe(mono.bytesPerRow * height)
      })
    })

    test('should handle edge case with empty image', () => {
      const rgba = new Uint8Array(0)

      const mono = monoFromRGBA({
        rgba,
        width: 0,
        height: 0
      })

      expect(mono.width).toBe(0)
      expect(mono.height).toBe(0)
      expect(mono.bytesPerRow).toBe(0)
      expect(mono.bytes.length).toBe(0)
    })

    test('should handle various threshold values', () => {
      const rgba = new Uint8Array([
        100,
        100,
        100,
        255, // Dark gray
        150,
        150,
        150,
        255 // Light gray
      ])

      const lowThreshold = monoFromRGBA({
        rgba,
        width: 2,
        height: 1,
        threshold: 50
      })

      const highThreshold = monoFromRGBA({
        rgba,
        width: 2,
        height: 1,
        threshold: 200
      })

      // Different thresholds should potentially produce different results
      expect(lowThreshold.bytes).toBeDefined()
      expect(highThreshold.bytes).toBeDefined()
    })
  })

  describe('encodeGF()', () => {
    test('should encode monochrome bitmap to ^GF command', () => {
      const mono: MonoBitmap = {
        width: 8,
        height: 2,
        bytesPerRow: 1,
        bytes: new Uint8Array([0xff, 0x00]) // First row all black, second row all white
      }

      const result = encodeGF(mono)

      expect(result.hex).toBe('FF00')
      expect(result.totalBytes).toBe(2)
      expect(result.bytesPerRow).toBe(1)
      expect(result.gfCommand).toBe('^GFA,2,2,1,FF00')
    })

    test('should handle single pixel', () => {
      const mono: MonoBitmap = {
        width: 1,
        height: 1,
        bytesPerRow: 1,
        bytes: new Uint8Array([0x80]) // Single black pixel (MSB)
      }

      const result = encodeGF(mono)

      expect(result.hex).toBe('80')
      expect(result.gfCommand).toBe('^GFA,1,1,1,80')
    })

    test('should handle empty bitmap', () => {
      const mono: MonoBitmap = {
        width: 0,
        height: 0,
        bytesPerRow: 0,
        bytes: new Uint8Array(0)
      }

      const result = encodeGF(mono)

      expect(result.hex).toBe('')
      expect(result.totalBytes).toBe(0)
      expect(result.gfCommand).toBe('^GFA,0,0,0,')
    })

    test('should handle various bitmap sizes', () => {
      // Test different sizes to ensure proper hex encoding
      const testCases = [
        { bytes: new Uint8Array([0x00]), expected: '00' },
        { bytes: new Uint8Array([0xff]), expected: 'FF' },
        { bytes: new Uint8Array([0x0f, 0xf0]), expected: '0FF0' },
        { bytes: new Uint8Array([0xab, 0xcd, 0xef]), expected: 'ABCDEF' }
      ]

      testCases.forEach(({ bytes, expected }) => {
        const mono: MonoBitmap = {
          width: bytes.length * 8,
          height: 1,
          bytesPerRow: bytes.length,
          bytes
        }

        const result = encodeGF(mono)
        expect(result.hex).toBe(expected)
      })
    })
  })

  describe('encodeDG()', () => {
    test('should encode monochrome bitmap to ~DG and ^XG commands', () => {
      const mono: MonoBitmap = {
        width: 8,
        height: 2,
        bytesPerRow: 1,
        bytes: new Uint8Array([0xff, 0x00])
      }

      const result = encodeDG('R:LOGO.GRF', mono)

      expect(result.hex).toBe('FF00')
      expect(result.totalBytes).toBe(2)
      expect(result.bytesPerRow).toBe(1)
      expect(result.dgCommand).toBe('~DGR:LOGO.GRF,2,1,FF00')
      expect(result.xgCommand).toBe('^XGR:LOGO.GRF,1,1')
    })

    test('should handle different asset names', () => {
      const mono: MonoBitmap = {
        width: 4,
        height: 1,
        bytesPerRow: 1,
        bytes: new Uint8Array([0xf0])
      }

      const names = ['R:TEST.GRF', 'E:LOGO.GRF', 'B:ICON.GRF']

      names.forEach((name) => {
        const result = encodeDG(name, mono)
        expect(result.dgCommand).toContain(name)
        expect(result.xgCommand).toContain(name)
      })
    })

    test('should handle empty asset name', () => {
      const mono: MonoBitmap = {
        width: 4,
        height: 1,
        bytesPerRow: 1,
        bytes: new Uint8Array([0xf0])
      }

      const result = encodeDG('', mono)

      // The encoder adds a default name format when empty
      expect(result.dgCommand).toMatch(/~DG.*,1,1,F0/)
      expect(result.xgCommand).toMatch(/\^XG.*,1,1/)
    })

    test('should produce consistent results with encodeGF for hex', () => {
      const mono: MonoBitmap = {
        width: 16,
        height: 2,
        bytesPerRow: 2,
        bytes: new Uint8Array([0xab, 0xcd, 0xef, 0x01])
      }

      const gfResult = encodeGF(mono)
      const dgResult = encodeDG('R:TEST.GRF', mono)

      expect(dgResult.hex).toBe(gfResult.hex)
      expect(dgResult.totalBytes).toBe(gfResult.totalBytes)
      expect(dgResult.bytesPerRow).toBe(gfResult.bytesPerRow)
    })
  })
})
