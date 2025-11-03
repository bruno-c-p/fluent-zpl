// src/_types.ts
// Shared types & unit helpers for @schie/fluent-zpl

/* =====================================
 *  Core Label Configuration
 * ===================================== */
export type Orientation = 'N' | 'R' | 'I' | 'B'
export type Units = 'dot' | 'mm' | 'in'
export type DPI = 203 | 300 | 600

export interface LabelOptions {
  /** Width of the label (in units or dots) */
  w: number
  /** Height of the label (in units or dots) */
  h: number
  /** Units for width/height values. Default: 'dot' */
  units?: Units
  /** Printer resolution. Default: 203 */
  dpi?: DPI
  /** Label home/origin (maps to ^LH) */
  origin?: { x: number; y: number }
  /** Print orientation (maps to ^PO) */
  orientation?: Orientation
}

/* =====================================
 *  Field / Element Types
 * ===================================== */

export type Barcode =
  | 'Code128'
  | 'Code39'
  | 'EAN13'
  | 'UPCA'
  | 'ITF'
  | 'PDF417'
  | 'QRCode'
  | 'DataMatrix'

export interface TextOpts {
  at: { x: number; y: number }
  text: string
  font?: { family?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | '0'; h?: number; w?: number }
  rotate?: Orientation
  wrap?: { width: number; lines?: number; spacing?: number; justify?: 'L' | 'C' | 'R' | 'J' }
}

export interface BarcodeOpts {
  at: { x: number; y: number }
  type: Barcode
  data: string
  height?: number
  module?: number
  rotate?: Orientation
}

export interface BoxOpts {
  at: { x: number; y: number }
  size: { w: number; h: number }
  border?: number
  fill?: 'B' | 'W'
}

export interface RFIDOpts {
  at: { x: number; y: number }
  /** EPC data to encode (hex string) */
  epc: string
  /** RFID positioning - distance from label edge in dots */
  position?: number
  /** Password for protected operations (hex string) */
  password?: string
  /** Memory bank to write to: EPC, TID, USER */
  bank?: 'EPC' | 'TID' | 'USER'
  /** Offset within memory bank */
  offset?: number
  /** Length of data to write */
  length?: number
}

export type CommandMark = '^' | '~'

/* =====================================
 *  Tokens (Lossless Intermediate Rep)
 * ===================================== */
export type Token =
  | { k: 'Cmd'; mark: CommandMark; name: string; params: string }
  | { k: 'FD'; data: string }
  | { k: 'FS' }
  | { k: 'Bytes'; buf: Uint8Array }
  | { k: 'Raw'; text: string }
