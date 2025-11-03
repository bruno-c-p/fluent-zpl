// RFID functionality tests

import { Label } from '../src/index.js'

describe('RFID Functionality', () => {
  let label: Label

  beforeEach(() => {
    label = Label.create({ w: 400, h: 600 })
  })

  describe('rfid()', () => {
    test('should create RFID field with EPC encoding', () => {
      const result = label.rfid({
        at: { x: 50, y: 100 },
        epc: '3014257BF7194E4000001A85',
        position: 0
      })
      const zpl = result.toZPL()

      expect(zpl).toContain('^RF50,100,0,1,00000000')
      expect(zpl).toContain('^FD^RFW,E,0,12,3014257BF7194E4000001A85^FS')
    })

    test('should create RFID field with custom password', () => {
      const result = label.rfid({
        at: { x: 100, y: 200 },
        epc: '1234567890ABCDEF',
        password: 'DEADBEEF'
      })
      const zpl = result.toZPL()

      expect(zpl).toContain('^RF100,200,0,1,DEADBEEF')
      expect(zpl).toContain('^RFW,E,0,8,1234567890ABCDEF')
    })

    test('should support USER memory bank', () => {
      const result = label.rfid({
        at: { x: 75, y: 150 },
        epc: 'USERDATA123456',
        bank: 'USER',
        offset: 4,
        length: 7
      })
      const zpl = result.toZPL()

      expect(zpl).toContain('^RFW,U,4,7,USERDATA123456')
    })

    test('should support TID memory bank', () => {
      const result = label.rfid({
        at: { x: 25, y: 75 },
        epc: 'TID123456789',
        bank: 'TID',
        offset: 0,
        length: 6
      })
      const zpl = result.toZPL()

      expect(zpl).toContain('^RFW,T,0,6,TID123456789')
    })
  })

  describe('rfidRead()', () => {
    test('should create RFID read command for EPC', () => {
      const result = label.rfidRead({
        at: { x: 50, y: 100 }
      })
      const zpl = result.toZPL()

      expect(zpl).toContain('^RF50,100,0,0,00000000')
      expect(zpl).toContain('^FD^RFR,E,0,8^FS')
    })

    test('should create RFID read command with custom parameters', () => {
      const result = label.rfidRead({
        at: { x: 100, y: 200 },
        bank: 'USER',
        offset: 2,
        length: 16,
        password: 'CAFEBABE'
      })
      const zpl = result.toZPL()

      expect(zpl).toContain('^RF100,200,0,0,CAFEBABE')
      expect(zpl).toContain('^RFR,U,2,16')
    })

    test('should read TID memory bank', () => {
      const result = label.rfidRead({
        at: { x: 0, y: 0 },
        bank: 'TID',
        offset: 0,
        length: 12
      })
      const zpl = result.toZPL()

      expect(zpl).toContain('^RFR,T,0,12')
    })
  })

  describe('epc()', () => {
    test('should be convenience method for EPC encoding', () => {
      const result = label.epc({
        at: { x: 50, y: 100 },
        epc: '3014257BF7194E4000001A85'
      })
      const zpl = result.toZPL()

      expect(zpl).toContain('^RF50,100,0,1,00000000')
      expect(zpl).toContain('^RFW,E,0,12,3014257BF7194E4000001A85')
    })

    test('should support custom position and password', () => {
      const result = label.epc({
        at: { x: 200, y: 300 },
        epc: '1234ABCD5678EFGH',
        position: 10,
        password: '12345678'
      })
      const zpl = result.toZPL()

      expect(zpl).toContain('^RF200,300,0,1,12345678')
      expect(zpl).toContain('^RFW,E,0,8,1234ABCD5678EFGH')
    })
  })

  describe('Unit Conversions with RFID', () => {
    test('should convert mm coordinates to dots for RFID fields', () => {
      const labelMM = Label.create({ w: 100, h: 150, units: 'mm', dpi: 203 })
      const result = labelMM.rfid({
        at: { x: 25, y: 50 }, // 25mm, 50mm
        epc: '123456789ABCDEF0'
      })
      const zpl = result.toZPL()

      // 25mm at 203 DPI ≈ 200 dots, 50mm ≈ 400 dots
      expect(zpl).toContain('^RF200,400')
    })

    test('should convert inch coordinates to dots for RFID fields', () => {
      const labelIN = Label.create({ w: 4, h: 6, units: 'in', dpi: 203 })
      const result = labelIN.epc({
        at: { x: 1, y: 2 }, // 1 inch, 2 inches
        epc: 'FEDCBA9876543210'
      })
      const zpl = result.toZPL()

      // 1 inch at 203 DPI = 203 dots, 2 inches = 406 dots
      expect(zpl).toContain('^RF203,406')
    })
  })

  describe('Complex RFID Labels', () => {
    test('should create label with both visual and RFID elements', () => {
      const result = label
        .text({
          at: { x: 50, y: 50 },
          text: 'RFID ENABLED LABEL',
          font: { family: 'B', h: 24, w: 24 }
        })
        .barcode({
          at: { x: 50, y: 100 },
          type: 'Code128',
          data: '1234567890',
          height: 80
        })
        .epc({
          at: { x: 50, y: 200 },
          epc: '3014257BF7194E4000001A85'
        })
        .text({
          at: { x: 50, y: 250 },
          text: 'EPC: 3014257BF7194E4000001A85',
          font: { family: 'A', h: 16, w: 16 }
        })

      const zpl = result.toZPL()

      // Should contain all elements
      expect(zpl).toContain('RFID ENABLED LABEL')
      expect(zpl).toContain('^BCN,80,Y,N,N')
      expect(zpl).toContain('^RF50,200,0,1,00000000')
      expect(zpl).toContain('^RFW,E,0,12,3014257BF7194E4000001A85')
      expect(zpl).toContain('EPC: 3014257BF7194E4000001A85')
    })
  })

  describe('ZPL Structure Validation', () => {
    test('should maintain proper ZPL structure with RFID fields', () => {
      const result = label.epc({
        at: { x: 50, y: 100 },
        epc: '1234567890ABCDEF'
      })
      const zpl = result.toZPL()

      // Basic ZPL structure
      expect(zpl).toMatch(/^\^XA.*\^XZ$/)
      expect(zpl).toContain('^LL600')

      // RFID field properly formatted
      expect(zpl).toMatch(/\^RF\d+,\d+,\d+,\d+,[A-F0-9]{8}/)
      expect(zpl).toContain('^FD')
      expect(zpl).toContain('^FS')
    })
  })
})
