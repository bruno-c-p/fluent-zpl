// src/core/emit.ts
// Serializer for tokens back to a ZPL string. Untouched tokens re-emit as-is.

import type { Token } from '../_types.js'

export function emit(tokens: Token[]): string {
  // NOTE: If you later support true binary output for ~DG/^GF, make this return Uint8Array.
  return tokens
    .map((t) => {
      switch (t.k) {
        case 'Cmd':
          return `${t.mark}${t.name}${t.params}`
        case 'FD':
          return `^FD${t.data}`
        case 'FS':
          return `^FS`
        case 'Bytes':
          return new TextDecoder().decode(t.buf)
        case 'Raw':
          return t.text
      }
    })
    .join('')
}
