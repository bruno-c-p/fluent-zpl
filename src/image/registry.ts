// src/images/registry.ts
import type { Token } from '../_types.js'
import { tokenizeZPL } from '../core/parse.js'

export interface AssetRef {
  name: string // "R:LOGO.GRF"
  bytesHash: string // e.g. sha256 hex of mono.bytes (or original RGBA)
}

export class ImageRegistry {
  private map = new Map<string, string>() // bytesHash -> GRF name

  has(hash: string): boolean {
    return this.map.has(hash)
  }
  get(hash: string): string | undefined {
    return this.map.get(hash)
  }
  put(hash: string, grfName: string) {
    this.map.set(hash, grfName)
  }

  /** Build only ^XG recall tokens (no ~DG) */
  recallAt(name: string, at: { x: number; y: number }): Token[] {
    return tokenizeZPL(`^FO${at.x},${at.y}^XG${name},1,1^FS`)
  }
}
