// src/images/api.ts
// Image API for @schie/fluent-zpl

// src/images/api.ts
import type { DPI, Token, Units } from '../_types.js'
import { toDots } from '../_unit-helpers.js'
import { tokenizeZPL } from '../core/parse.js'
import { encodeDG, encodeGF, monoFromRGBA, type DitherMode } from './encoder.js'

export interface ImageInlineOpts {
  at: { x: number; y: number } // in current label units
  rgba: Uint8Array | Uint8ClampedArray // interleaved RGBA
  width: number // px
  height: number // px
  mode?: DitherMode // default "threshold"
  threshold?: number // 0..255
  invert?: boolean
}

export interface ImageCachedOpts extends ImageInlineOpts {
  name: string // e.g. "R:LOGO.GRF" (device + name)
}

/** Build tokens for an inline ^GF image at a position (unit-aware). */
export function buildImageInlineTokens(
  cfg: { dpi: DPI; units: Units },
  opts: ImageInlineOpts
): Token[] {
  const mono = monoFromRGBA({
    rgba: opts.rgba,
    width: opts.width,
    height: opts.height,
    mode: opts.mode ?? 'threshold',
    threshold: opts.threshold,
    invert: opts.invert
  })
  const { gfCommand } = encodeGF(mono)
  const x = toDots(opts.at.x, cfg.dpi, cfg.units)
  const y = toDots(opts.at.y, cfg.dpi, cfg.units)
  const chunk = `^FO${x},${y}${gfCommand}^FS`
  return tokenizeZPL(chunk)
}

/**
 * Build tokens for a cached asset:
 *  - emits a ~DG payload (once per image call; caching can be layered on top)
 *  - emits a ^FO + ^XG recall at the requested position
 */
export function buildImageCachedTokens(
  cfg: { dpi: DPI; units: Units },
  opts: ImageCachedOpts
): Token[] {
  const mono = monoFromRGBA({
    rgba: opts.rgba,
    width: opts.width,
    height: opts.height,
    mode: opts.mode ?? 'threshold',
    threshold: opts.threshold,
    invert: opts.invert
  })
  const { dgCommand, xgCommand } = encodeDG(opts.name, mono)
  const x = toDots(opts.at.x, cfg.dpi, cfg.units)
  const y = toDots(opts.at.y, cfg.dpi, cfg.units)
  const chunk = `${dgCommand}^FO${x},${y}${xgCommand}^FS`
  return tokenizeZPL(chunk)
}
