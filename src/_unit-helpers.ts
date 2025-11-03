// src/_unit-helpers.ts
// unit helpers for @schie/fluent-zpl

import { DPI, Units } from './_types.js'

/* =====================================
 *  Unit Helpers
 * ===================================== */
export const dot = (n: number) => n
export const mm = (n: number, dpi: DPI = 203) => Math.round((n * dpi) / 25.4)
export const inch = (n: number, dpi: DPI = 203) => Math.round(n * dpi)

export const toDots = (n: number, dpi: DPI, units: Units): number => {
  switch (units) {
    case 'dot':
      return dot(n)
    case 'mm':
      return mm(n, dpi)
    case 'in':
      return inch(n, dpi)
    default:
      return n
  }
}
