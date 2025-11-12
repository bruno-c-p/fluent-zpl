// src/core/parse.ts
// Lossless(ish) tokenizer for ZPL streams.
// Captures commands, ^FD...^FS blocks, raw text, and leaves room for binary payloads.

import type { CommandMark, Token } from '../_types.js';

export function tokenizeZPL(input: string | Uint8Array): Token[] {
  const s = typeof input === 'string' ? input : new TextDecoder().decode(input);
  const out: Token[] = [];
  let i = 0;

  const pushRaw = (j: number) => {
    if (j > i) out.push({ k: 'Raw', text: s.slice(i, j) });
    i = j;
  };

  while (i < s.length) {
    const m = s.slice(i).match(/[\^~][A-Za-z]{1,2}/);
    if (!m || m.index === undefined) {
      pushRaw(s.length);
      break;
    }
    const j = i + m.index;
    pushRaw(j);

    const mark = m[0][0] as CommandMark;
    const name = m[0].slice(1);
    i = j + m[0].length;

    // ^FD ... ^FS  (ZPL allows multiline; we capture raw until ^FS)
    if (mark === '^' && name === 'FD') {
      const end = s.indexOf('^FS', i);
      const data = end === -1 ? s.slice(i) : s.slice(i, end);
      out.push({ k: 'FD', data });
      if (end !== -1) {
        out.push({ k: 'FS' });
        i = end + 3; // skip ^FS
      } else {
        // unterminated FD; keep rest as data and stop
        break;
      }
      continue;
    }

    // Generic command: capture params up to next ^ or ~ (or end)
    const next = s.slice(i).search(/[\^~][A-Za-z]{1,2}/);
    const params = next === -1 ? s.slice(i) : s.slice(i, i + next);
    out.push({ k: 'Cmd', mark, name, params });
    i = next === -1 ? s.length : i + next;
  }

  return out;
}

/**
 * Utility: find the index of the last ^XZ command.
 * If not found, returns tokens.length (append at end).
 */
export function findLastXZ(tokens: Token[]): number {
  for (let idx = tokens.length - 1; idx >= 0; idx--) {
    const t = tokens[idx];
    if (t.k === 'Cmd' && t.mark === '^' && t.name === 'XZ') return idx;
  }
  return tokens.length;
}
