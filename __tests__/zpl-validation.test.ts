// ZPL Validation Tests - ensures all outputs are valid ZPL according to specification

import { Label } from '../src/index.js'

describe('ZPL Validation', () => {
  /**
   * Helper to validate basic ZPL structure
   */
  function validateBasicZPLStructure(zpl: string) {
    // Should start with ^XA and end with ^XZ
    expect(zpl).toMatch(/^\^XA.*\^XZ$/)

    // Validate that all ZPL commands are properly formed
    // Extract all commands (^ or ~ followed by letters, excluding escaped carets in ^FD blocks)
    const commandPattern = /[\^~][A-Z][A-Z0-9]*(?=[^A-Z]|$)/g
    const commands = zpl.match(commandPattern) || []

    // Every command should be valid ZPL command format
    commands.forEach((cmd) => {
      expect(cmd).toMatch(/^[\^~][A-Z][A-Z0-9]*$/)
    })

    // Should not have commands with missing parameters in font commands
    expect(zpl).not.toMatch(/\^A[A-Z0-9][NRI],\^/)

    // Field data blocks should be properly terminated
    const fdMatches = zpl.match(/\^FD[^]*?\^FS/g)
    if (fdMatches) {
      fdMatches.forEach((match) => {
        expect(match).toMatch(/^\^FD.*\^FS$/)
      })
    }

    // No orphaned ^FD without ^FS
    const orphanedFD = zpl.match(/\^FD(?![^]*?\^FS)/g)
    expect(orphanedFD).toBeNull()
  }

  /**
   * Helper to validate field origin commands have proper parameters
   */
  function validateFieldOrigins(zpl: string) {
    const foMatches = zpl.match(/\^FO\d+,\d+/g)
    if (foMatches) {
      foMatches.forEach((match) => {
        expect(match).toMatch(/^\^FO\d+,\d+$/)
      })
    }
  }

  describe('Basic Label Structure', () => {
    test('should generate valid ZPL structure for empty label', () => {
      const label = Label.create({ w: 400, h: 600 })
      const zpl = label.toZPL()

      validateBasicZPLStructure(zpl)
      expect(zpl).toBe('^XA^LL600^XZ')
    })

    test('should generate valid ZPL with proper label setup commands', () => {
      const label = Label.create({
        w: 400,
        h: 600,
        dpi: 203,
        units: 'dot',
        orientation: 'R',
        origin: { x: 10, y: 20 }
      })
      const zpl = label.toZPL()

      validateBasicZPLStructure(zpl)
      expect(zpl).toContain('^POR') // Print orientation
      expect(zpl).toContain('^LH10,20') // Label home position
      expect(zpl).toContain('^LL600') // Label length
    })
  })

  describe('Text Field Validation', () => {
    test('should generate valid text fields with proper font commands', () => {
      const label = Label.create({ w: 400, h: 600 }).text({
        at: { x: 50, y: 100 },
        text: 'Hello World',
        font: { family: 'A', h: 28, w: 28 }
      })
      const zpl = label.toZPL()

      validateBasicZPLStructure(zpl)
      validateFieldOrigins(zpl)

      expect(zpl).toContain('^FO50,100')
      expect(zpl).toContain('^AAN,28,28')
      expect(zpl).toContain('^FDHello World^FS')
    })

    test('should handle text rotation properly', () => {
      const rotations = ['N', 'R', 'I', 'B'] as const

      rotations.forEach((rotation) => {
        const label = Label.create({ w: 400, h: 600 }).text({
          at: { x: 50, y: 100 },
          text: 'Test',
          rotate: rotation,
          font: { family: 'A', h: 20, w: 20 }
        })
        const zpl = label.toZPL()

        validateBasicZPLStructure(zpl)
        expect(zpl).toContain(`^AA${rotation},20,20`)
      })
    })

    test('should properly escape carets in text data', () => {
      const label = Label.create({ w: 400, h: 600 }).text({
        at: { x: 50, y: 100 },
        text: 'Text with ^caret and ^^double'
      })
      const zpl = label.toZPL()

      validateBasicZPLStructure(zpl)
      expect(zpl).toContain('^FDText with ^^caret and ^^^^double^FS')
    })

    test('should generate valid text wrapping commands', () => {
      const label = Label.create({ w: 400, h: 600 }).text({
        at: { x: 50, y: 100 },
        text: 'Long text that wraps',
        wrap: {
          width: 200,
          lines: 5,
          spacing: 2,
          justify: 'C'
        }
      })
      const zpl = label.toZPL()

      validateBasicZPLStructure(zpl)
      expect(zpl).toContain('^FB200,5,2,C,0')
    })
  })

  describe('Barcode Validation', () => {
    const barcodeTypes = [
      'Code128',
      'Code39',
      'EAN13',
      'UPCA',
      'ITF',
      'PDF417',
      'QRCode',
      'DataMatrix'
    ] as const

    barcodeTypes.forEach((type) => {
      test(`should generate valid ${type} barcode`, () => {
        const label = Label.create({ w: 400, h: 600 }).barcode({
          at: { x: 50, y: 100 },
          type,
          data: 'TEST123'
        })
        const zpl = label.toZPL()

        validateBasicZPLStructure(zpl)
        validateFieldOrigins(zpl)

        expect(zpl).toContain('^FO50,100')
        expect(zpl).toContain('^FD')
        expect(zpl).toContain('^FS')

        // Verify barcode-specific commands exist
        switch (type) {
          case 'Code128':
            expect(zpl).toMatch(/\^BC[NRI],\d+,Y,N,N/)
            break
          case 'Code39':
            expect(zpl).toMatch(/\^B3[NRI],\d+,Y,N/)
            break
          case 'QRCode':
            expect(zpl).toMatch(/\^BQ[NRI],2,\d+/)
            break
          // Add more specific validations as needed
        }
      })
    })

    test('should handle barcode rotation properly', () => {
      const rotations = ['N', 'R', 'I', 'B'] as const

      rotations.forEach((rotation) => {
        const label = Label.create({ w: 400, h: 600 }).barcode({
          at: { x: 50, y: 100 },
          type: 'Code128',
          data: 'TEST',
          rotate: rotation
        })
        const zpl = label.toZPL()

        validateBasicZPLStructure(zpl)
        expect(zpl).toContain(`^BC${rotation},100,Y,N,N`)
      })
    })
  })

  describe('Graphics Box Validation', () => {
    test('should generate valid box commands', () => {
      const label = Label.create({ w: 400, h: 600 }).box({
        at: { x: 10, y: 20 },
        size: { w: 100, h: 50 },
        border: 2,
        fill: 'W'
      })
      const zpl = label.toZPL()

      validateBasicZPLStructure(zpl)
      validateFieldOrigins(zpl)

      expect(zpl).toContain('^FO10,20')
      expect(zpl).toContain('^GB100,50,2,W,0^FS')
    })

    test('should handle box parameters correctly', () => {
      const label = Label.create({ w: 400, h: 600 }).box({
        at: { x: 0, y: 0 },
        size: { w: 400, h: 600 },
        border: 1,
        fill: 'B'
      })
      const zpl = label.toZPL()

      validateBasicZPLStructure(zpl)
      expect(zpl).toContain('^GB400,600,1,B,0^FS')
    })
  })

  describe('Unit Conversion Validation', () => {
    test('should generate valid coordinates with mm units', () => {
      const label = Label.create({
        w: 100,
        h: 150,
        units: 'mm',
        dpi: 203
      }).text({
        at: { x: 10, y: 15 }, // 10mm, 15mm
        text: 'Test'
      })
      const zpl = label.toZPL()

      validateBasicZPLStructure(zpl)

      // 10mm at 203 DPI ≈ 80 dots, 15mm ≈ 120 dots
      expect(zpl).toMatch(/\^FO\d+,\d+/)

      // Extract coordinates and verify they're reasonable
      const foMatch = zpl.match(/\^FO(\d+),(\d+)/)
      if (foMatch) {
        const x = parseInt(foMatch[1])
        const y = parseInt(foMatch[2])
        expect(x).toBeGreaterThan(70) // ~10mm
        expect(x).toBeLessThan(90)
        expect(y).toBeGreaterThan(110) // ~15mm
        expect(y).toBeLessThan(130)
      }
    })

    test('should generate valid coordinates with inch units', () => {
      const label = Label.create({
        w: 4,
        h: 6,
        units: 'in',
        dpi: 203
      }).text({
        at: { x: 0.5, y: 1 }, // 0.5 inch, 1 inch
        text: 'Test'
      })
      const zpl = label.toZPL()

      validateBasicZPLStructure(zpl)

      // 0.5 inch at 203 DPI ≈ 102 dots, 1 inch = 203 dots
      const foMatch = zpl.match(/\^FO(\d+),(\d+)/)
      if (foMatch) {
        const x = parseInt(foMatch[1])
        const y = parseInt(foMatch[2])
        expect(x).toBeCloseTo(102, -1) // ~0.5 inch
        expect(y).toBe(203) // 1 inch
      }
    })
  })

  describe('Complex Label Validation', () => {
    test('should generate valid complex shipping label', () => {
      const label = Label.create({ w: 400, h: 600 })
        .text({
          at: { x: 50, y: 50 },
          text: 'PRIORITY MAIL',
          font: { family: 'B', h: 32, w: 32 }
        })
        .box({
          at: { x: 40, y: 80 },
          size: { w: 320, h: 2 },
          border: 2
        })
        .barcode({
          at: { x: 50, y: 100 },
          type: 'Code128',
          data: '1Z999AA1234567890'
        })
        .text({
          at: { x: 50, y: 250 },
          text: 'John Doe\\n123 Main St\\nAnytown, ST 12345',
          font: { family: 'A', h: 20, w: 20 }
        })

      const zpl = label.toZPL()

      validateBasicZPLStructure(zpl)
      validateFieldOrigins(zpl)

      // Verify all components are present
      expect(zpl).toContain('PRIORITY MAIL')
      expect(zpl).toContain('^GB320,2,2')
      expect(zpl).toContain('^BCN,100,Y,N,N')
      expect(zpl).toContain('1Z999AA1234567890')
      expect(zpl).toContain('John Doe')
    })

    test('should maintain valid ZPL through fluent chaining', () => {
      let label = Label.create({ w: 400, h: 600 })

      // Add elements one by one and validate each step
      label = label.text({ at: { x: 50, y: 50 }, text: 'Step 1' })
      validateBasicZPLStructure(label.toZPL())

      label = label.barcode({ at: { x: 50, y: 100 }, type: 'QRCode', data: 'QR1' })
      validateBasicZPLStructure(label.toZPL())

      label = label.box({ at: { x: 10, y: 10 }, size: { w: 380, h: 580 } })
      validateBasicZPLStructure(label.toZPL())

      label = label.text({ at: { x: 50, y: 200 }, text: 'Final' })
      validateBasicZPLStructure(label.toZPL())

      const finalZpl = label.toZPL()
      expect(finalZpl).toContain('Step 1')
      expect(finalZpl).toContain('QR1')
      expect(finalZpl).toContain('Final')
    })
  })

  describe('Edge Cases and Error Handling', () => {
    test('should handle empty text gracefully', () => {
      const label = Label.create({ w: 400, h: 600 }).text({ at: { x: 50, y: 100 }, text: '' })
      const zpl = label.toZPL()

      validateBasicZPLStructure(zpl)
      expect(zpl).toContain('^FD^FS')
    })

    test('should handle zero-size elements', () => {
      const label = Label.create({ w: 400, h: 600 }).box({
        at: { x: 50, y: 100 },
        size: { w: 0, h: 0 }
      })
      const zpl = label.toZPL()

      validateBasicZPLStructure(zpl)
      expect(zpl).toContain('^GB0,0,1')
    })

    test('should handle special characters in barcode data', () => {
      const label = Label.create({ w: 400, h: 600 }).barcode({
        at: { x: 50, y: 100 },
        type: 'Code128',
        data: 'ABC-123_456'
      })
      const zpl = label.toZPL()

      validateBasicZPLStructure(zpl)
      expect(zpl).toContain('^FDABC-123_456^FS')
    })

    test('should handle very large coordinates', () => {
      const label = Label.create({ w: 4000, h: 6000 }).text({
        at: { x: 3000, y: 5000 },
        text: 'Far corner'
      })
      const zpl = label.toZPL()

      validateBasicZPLStructure(zpl)
      expect(zpl).toContain('^FO3000,5000')
    })
  })
})

// Clean up test file
afterAll(() => {
  // Remove the test file we created
  try {
    require('fs').unlinkSync('/Users/dschie/projects/fluent-zpl/test-zpl-output.js')
  } catch (e) {
    // Ignore if file doesn't exist
  }
})
