// Real-world ZPL validation examples
import { Label } from '../src/index.js'

describe('Real-world ZPL Examples', () => {
  test('should generate valid shipping label ZPL', () => {
    const label = Label.create({ w: 400, h: 600, dpi: 203, units: 'dot' })
      .text({
        at: { x: 50, y: 50 },
        text: 'FEDEX GROUND',
        font: { family: 'B', h: 28, w: 28 }
      })
      .box({
        at: { x: 10, y: 10 },
        size: { w: 380, h: 580 },
        border: 2
      })
      .text({
        at: { x: 50, y: 100 },
        text: 'SHIP TO:',
        font: { family: 'A', h: 20, w: 20 }
      })
      .addressBlock({
        at: { x: 50, y: 130 },
        lines: ['JOHN DOE', '123 MAIN STREET', 'ANYTOWN NY 12345-6789'],
        lineHeight: 25,
        size: 20
      })
      .barcode({
        at: { x: 50, y: 250 },
        type: 'Code128',
        data: '1234567890123',
        height: 80
      })
      .text({
        at: { x: 50, y: 350 },
        text: 'Tracking: 1234567890123',
        font: { family: 'A', h: 16, w: 16 }
      })

    const zpl = label.toZPL()

    // Basic ZPL structure validation
    expect(zpl).toMatch(/^\^XA.*\^XZ$/)

    // Should contain proper label setup
    expect(zpl).toContain('^LL600')

    // Should contain all text elements
    expect(zpl).toContain('FEDEX GROUND')
    expect(zpl).toContain('SHIP TO:')
    expect(zpl).toContain('JOHN DOE')
    expect(zpl).toContain('123 MAIN STREET')
    expect(zpl).toContain('ANYTOWN NY 12345-6789')
    expect(zpl).toContain('Tracking: 1234567890123')

    // Should contain graphics box
    expect(zpl).toContain('^GB380,580,2,B,0')

    // Should contain barcode
    expect(zpl).toContain('^BCN,80,Y,N,N')
    expect(zpl).toContain('^FD1234567890123^FS')

    // Validate all field origins are present
    const fieldOrigins = zpl.match(/\^FO\d+,\d+/g) || []
    expect(fieldOrigins.length).toBeGreaterThan(0)

    // Validate all field data blocks are properly terminated
    const fdBlocks = zpl.match(/\^FD[^]*?\^FS/g) || []
    expect(fdBlocks.length).toBeGreaterThan(0)
  })

  test('should generate valid product label with QR code', () => {
    const label = Label.create({ w: 300, h: 200, units: 'mm', dpi: 203 })
      .caption({
        at: { x: 10, y: 10 },
        text: 'PRODUCT LABEL',
        size: 24,
        family: 'B'
      })
      .text({
        at: { x: 10, y: 40 },
        text: 'SKU: ABC-123-XYZ',
        font: { family: 'A', h: 16, w: 16 }
      })
      .qr({
        at: { x: 180, y: 40 },
        text: 'https://example.com/product/ABC-123-XYZ',
        module: 3
      })
      .box({
        at: { x: 5, y: 5 },
        size: { w: 290, h: 190 },
        border: 1
      })
      .text({
        at: { x: 10, y: 160 },
        text: 'Price: $29.99',
        font: { family: 'B', h: 20, w: 20 }
      })

    const zpl = label.toZPL()

    // Basic structure validation
    expect(zpl).toMatch(/^\^XA.*\^XZ$/)

    // Should handle unit conversions (mm to dots)
    expect(zpl).toContain('^LL1598') // 200mm at 203 DPI ≈ 1598 dots

    // Should contain all elements
    expect(zpl).toContain('PRODUCT LABEL')
    expect(zpl).toContain('SKU: ABC-123-XYZ')
    expect(zpl).toContain('Price: $29.99')

    // Should contain QR code
    expect(zpl).toContain('^BQN,2,3')
    expect(zpl).toContain('https://example.com/product/ABC-123-XYZ')

    // Should contain border box
    expect(zpl).toContain('^GB') // Graphics box command
  })

  test('should handle complex text with special characters', () => {
    const label = Label.create({ w: 400, h: 300 })
      .text({
        at: { x: 50, y: 50 },
        text: 'Special chars: ^caret "quotes" & <brackets>',
        font: { family: 'A', h: 20, w: 20 }
      })
      .text({
        at: { x: 50, y: 100 },
        text: 'Accented: café résumé naïve',
        font: { family: 'A', h: 20, w: 20 }
      })
      .text({
        at: { x: 50, y: 150 },
        text: 'Numbers: $1,234.56 (100%)',
        font: { family: 'A', h: 20, w: 20 }
      })

    const zpl = label.toZPL()

    // Should properly escape carets
    expect(zpl).toContain('^^caret')

    // Should preserve other special characters
    expect(zpl).toContain('"quotes"')
    expect(zpl).toContain('&')
    expect(zpl).toContain('<brackets>')
    expect(zpl).toContain('café')
    expect(zpl).toContain('$1,234.56')
    expect(zpl).toContain('(100%)')
  })
})
