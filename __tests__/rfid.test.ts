// RFID functionality tests

import { Label, RFIDBank } from '../src/index.js';

describe('RFID Functionality', () => {
  test('should create basic RFID field', () => {
    const result = Label.create({ w: 400, h: 600 }).rfid({
      epc: '3014257BF7194E4000001A85',
    });
    const zpl = result.toZPL();

    expect(zpl).toContain('^RFW,H^FD3014257BF7194E4000001A85^FS');
  });

  test('should create RFID field with custom parameters', () => {
    const result = Label.create({ w: 400, h: 600 }).rfid({
      epc: 'USERDATA123456',
      bank: RFIDBank.USER,
      offset: 4,
      length: 7,
    });
    const zpl = result.toZPL();

    expect(zpl).toContain('^RFW,U,4,7^FDUSERDATA123456^FS');
  });

  test('should create RFID read command', () => {
    const result = Label.create({ w: 400, h: 600 }).rfidRead({
      bank: RFIDBank.EPC,
      offset: 0,
      length: 8,
    });
    const zpl = result.toZPL();

    expect(zpl).toContain('^RFR,E,0,8^FD^FS');
  });

  test('should create RFID field with TID bank', () => {
    const result = Label.create({ w: 400, h: 600 }).rfid({
      epc: 'TID123456789',
      bank: RFIDBank.TID,
      offset: 2,
      length: 6,
    });
    const zpl = result.toZPL();

    expect(zpl).toContain('^RFW,T,2,6^FDTID123456789^FS');
  });

  test('should create RFID read command for USER bank', () => {
    const result = Label.create({ w: 400, h: 600 }).rfidRead({
      bank: RFIDBank.USER,
      offset: 4,
      length: 12,
    });
    const zpl = result.toZPL();

    expect(zpl).toContain('^RFR,U,4,12^FD^FS');
  });

  test('should create RFID read command for TID bank', () => {
    const result = Label.create({ w: 400, h: 600 }).rfidRead({
      bank: RFIDBank.TID,
      offset: 0,
      length: 6,
    });
    const zpl = result.toZPL();

    expect(zpl).toContain('^RFR,T,0,6^FD^FS');
  });

  test('should create RFID read command with default parameters', () => {
    const result = Label.create({ w: 400, h: 600 }).rfidRead({
      // Using defaults: bank defaults to EPC, offset defaults to 0, length defaults to 8
    });
    const zpl = result.toZPL();

    expect(zpl).toContain('^RFR,E,0,8^FD^FS');
  });

  test('rfidRead() still works when called without arguments', () => {
    const label = Label.create({ w: 400, h: 600 }) as any
    const result = label.rfidRead()
    expect(result.toZPL()).toContain('^RFR,E,0,8^FD^FS')
  })

  test('should create RFID host buffer read command', () => {
    const result = Label.create({ w: 400, h: 600 }).rfidRead({ bank: RFIDBank.HostBuffer })
    expect(result.toZPL()).toContain('^RFR,H^FD^FS')
  })

  test('should create RFID read command with partial defaults', () => {
    const result = Label.create({ w: 400, h: 600 }).rfidRead({
      bank: RFIDBank.USER,
      // offset and length will use defaults (0 and 8)
    });
    const zpl = result.toZPL();

    expect(zpl).toContain('^RFR,U,0,8^FD^FS');
  });

  test('should create EPC convenience method', () => {
    const result = Label.create({ w: 400, h: 600 }).epc({
      epc: '3014257BF7194E4000001A85',
    });
    const zpl = result.toZPL();

    expect(zpl).toContain('^RFW,H^FD3014257BF7194E4000001A85^FS');
  });

  test('should maintain ZPL structure', () => {
    const result = Label.create({ w: 400, h: 600 }).rfid({
      epc: '1234567890ABCDEF',
    });
    const zpl = result.toZPL();

    expect(zpl).toMatch(/^\^XA.*\^XZ$/);
    expect(zpl).toMatch(/\^RFW,H\^FD[A-F0-9]+\^FS/);
  });

  test('should reject HostBuffer writes', () => {
    expect(() =>
      Label.create({ w: 400, h: 600 }).rfid({
        epc: 'AA',
        bank: RFIDBank.HostBuffer,
      })
    ).toThrow('HostBuffer is read-only')
  })

  test('rfidRead() should fail on unsupported bank', () => {
    expect(() =>
      Label.create({ w: 400, h: 600 }).rfidRead({
        bank: 'INVALID' as RFIDBank,
      })
    ).toThrow('Unsupported RFID bank')
  })
});
