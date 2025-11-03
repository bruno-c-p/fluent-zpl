// src/index.ts
// Public API for @schie/fluent-zpl

// Core API
export { Label } from './core/label.js'

// Unit helpers
export { dot, inch, mm, toDots } from './_unit-helpers.js'

// Essential types for public API
export type {
  BarcodeOpts,
  BoxOpts,
  DPI,
  LabelOptions,
  Orientation,
  RFIDOpts,
  TextOpts,
  Units
} from './_types.js'
