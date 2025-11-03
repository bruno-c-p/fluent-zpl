// src/index.ts
// Public API for @schie/fluent-zpl

// Core API
export { Label } from './core/label.js'

// Unit helpers
export { dot, inch, mm, toDots } from './_unit-helpers.js'

// Essential types for public API
export type {
  Barcode,
  BarcodeOpts,
  BoxOpts,
  DPI,
  LabelOptions,
  Orientation,
  RFIDOpts,
  TextOpts,
  Units
} from './_types.js'

// Image-related types
export type { ImageCachedOpts, ImageInlineOpts } from './image/api.js'
export type { DitherMode } from './image/encoder.js'
