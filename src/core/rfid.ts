// src/core/rfid.ts
// Shared helpers for building RFID read/write token chunks

import type { RFIDOpts, RFIDReadOpts, Token } from '../_types.js';
import { RFIDBank } from '../_types.js';
import { tokenizeZPL } from './parse.js';

export function buildRFIDWriteTokens(o: RFIDOpts): Token[] {
  const bank = o.bank ?? RFIDBank.EPC;
  const offset = o.offset ?? 0;
  const length = o.length ?? Math.max(1, Math.ceil(o.epc.length / 2));

  let writeCmd = '';
  switch (bank) {
    case RFIDBank.EPC:
      writeCmd = '^RFW,H';
      break;
    case RFIDBank.USER:
      writeCmd = `^RFW,U,${offset},${length}`;
      break;
    case RFIDBank.TID:
      writeCmd = `^RFW,T,${offset},${length}`;
      break;
    case RFIDBank.HostBuffer:
      throw new Error('HostBuffer is read-only. Use rfidRead() to inspect the buffer.');
  }

  return tokenizeZPL(`${writeCmd}^FD${o.epc}^FS`);
}

export function buildRFIDReadTokens(o: RFIDReadOpts = {}): Token[] {
  const bank = o.bank ?? RFIDBank.EPC;

  if (bank === RFIDBank.HostBuffer) {
    return tokenizeZPL('^RFR,H^FD^FS');
  }

  const offset = o.offset ?? 0;
  const length = o.length ?? 8;
  const readCmd = `^RFR,${bankToCode(bank)},${offset},${length}`;

  return tokenizeZPL(`${readCmd}^FD^FS`);
}

const bankToCode = (bank: RFIDBank): string => {
  switch (bank) {
    case RFIDBank.EPC:
      return 'E';
    case RFIDBank.USER:
      return 'U';
    case RFIDBank.TID:
      return 'T';
    default:
      throw new Error(`Unsupported RFID bank for ^RFR: ${bank}`);
  }
};
