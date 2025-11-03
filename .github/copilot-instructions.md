# Copilot Instructions for @schie/fluent-zpl

This project is a TypeScript library for generating ZPL (Zebra Programming Language) commands using a fluent, immutable API pattern. The library is designed for creating printer labels with text, barcodes, graphics, and images.

## Project Status (November 2025)

**Latest Improvements:**

- ✅ Fixed ZPL compliance issues (font parameters now always included)
- ✅ Comprehensive test suite with 166 tests and 97.58% coverage
- ✅ RFID/EPC support for Zebra RFID-enabled printers
- ✅ ZPL validation framework to ensure all outputs are printer-compatible
- ✅ Real-world example tests with actual ZPL output verification
- ✅ Enhanced documentation and development guidelines

**Current Test Coverage:**

- 7 test suites, 166 tests, all passing
- 97.58% statement coverage, 91.48% branch coverage
- ZPL compliance validated across all features

## Project Structure

```
src/
├── index.ts              # Main exports
├── _types.ts            # Type definitions
├── _unit-helpers.ts     # Unit conversion utilities
├── core/
│   ├── emit.ts         # ZPL string generation
│   ├── label.ts        # Main Label class (fluent API)
│   └── parse.ts        # ZPL parsing and tokenization
└── image/
    ├── api.ts          # Image integration API
    ├── encoder.ts      # Image encoding (RGBA → monochrome → ZPL)
    └── registry.ts     # Image caching utilities
```

## Key Design Principles

### 1. Immutability

- All fluent methods return NEW Label instances
- Original instances are never modified
- Enables safe chaining and composition

### 2. Fluent API Pattern

```typescript
const label = Label.create({ w: 400, h: 600 })
  .text({ at: { x: 50, y: 100 }, text: 'Hello World' })
  .barcode({ at: { x: 50, y: 150 }, type: 'Code128', data: '123456' })
  .box({ at: { x: 10, y: 10 }, size: { w: 380, h: 580 } })
```

### 3. Unit-Aware Positioning

- Supports dots, millimeters, and inches
- DPI-aware conversions (203, 300, 600 DPI)
- Position calculations use `toDots(value, dpi, units)`

### 4. ZPL Compliance

- Generates valid ZPL commands according to specification
- Proper parameter formatting (e.g., font commands require height/width)
- Escapes special characters in text data (^ becomes ^^)

## Core Classes and APIs

### Label Class (`src/core/label.ts`)

Main fluent interface for building labels:

**Factory Methods:**

- `Label.create(options)` - Create new label
- `Label.parse(zpl)` - Parse existing ZPL

**Fluent Methods:**

- `text(opts)` - Add text field with font, rotation, wrapping
- `barcode(opts)` - Add barcode (Code128, QRCode, etc.)
- `box(opts)` - Add boxes/lines for graphics
- `caption(opts)` - Convenience method for simple text
- `qr(opts)` - Convenience method for QR codes
- `addressBlock(opts)` - Multi-line text blocks
- `imageInline(opts)` - Inline bitmap images (^GF)
- `image(opts)` - Cached bitmap images (~DG + ^XG)
- `rfid(opts)` - RFID field with EPC encoding
- `rfidRead(opts)` - RFID read commands
- `epc(opts)` - EPC encoding convenience method

**Output:**

- `toZPL()` - Generate final ZPL string

### Token System (`src/core/parse.ts` & `src/core/emit.ts`)

Lossless intermediate representation:

- Commands: `^XA`, `^FO50,100`, etc.
- Field Data: `^FD...^FS` blocks
- Raw text and binary data
- Enables round-trip parsing/emission

### Unit Helpers (`src/_unit-helpers.ts`)

Convert between measurement units:

```typescript
dot(100) // 100 dots
mm(25.4, 203) // 203 dots (1 inch at 203 DPI)
inch(1, 203) // 203 dots
toDots(50, 203, 'mm') // Convert based on units
```

### Image Processing (`src/image/`)

Convert RGBA images to ZPL bitmaps:

- Dithering: threshold, Floyd-Steinberg, ordered
- Formats: ^GF (inline), ~DG + ^XG (cached)
- Monochrome conversion with configurable thresholds

## ZPL Command Reference

### Essential Commands Generated

- `^XA` / `^XZ` - Label start/end
- `^LL` - Label length
- `^PO` - Print orientation (N/R/I/B)
- `^LH` - Label home position
- `^FO` - Field origin (positioning)
- `^A` - Font selection (family, orientation, height, width)
- `^FD` / `^FS` - Field data blocks
- `^FB` - Text field block (wrapping)
- `^BC`, `^BQ`, etc. - Barcode commands
- `^GB` - Graphic box/line
- `^GF` - Inline graphic field
- `~DG` - Download graphic
- `^XG` - Recall graphic
- `^RF` - RFID field positioning and operations
- `^RFW` - RFID write to memory banks
- `^RFR` - RFID read from memory banks

### Parameter Formats

- Coordinates: `^FO50,100` (x,y in dots)
- Font: `^AAN28,28` (family, orientation, height, width)
- Barcode: `^BCN,100,Y,N,N` (orientation, height, interpretation, check digit, etc.)
- Box: `^GB200,100,2,B,0` (width, height, thickness, fill, corner radius)

## Development Guidelines

### When Adding New Features:

1. Follow immutable pattern - return new Label instances
2. Add comprehensive tests in `__tests__/`
3. Validate generated ZPL format
4. Support unit conversions where applicable
5. Update TypeScript types in `_types.ts`

### Testing:

- Unit tests for individual functions (`unit-helpers.test.ts`)
- Integration tests for complete workflows (`main.test.ts`)
- ZPL validation tests to ensure compliance (`zpl-validation.test.ts`)
- Parser/emitter tests (`parser-emitter.test.ts`)
- Image processing tests (`image-encoder.test.ts`)
- Real-world example tests (`real-world-examples.test.ts`)
- RFID functionality tests (`rfid.test.ts`)
- Coverage targets: >95% statements, >90% branches

**Test Structure:**

```
__tests__/
├── main.test.ts                 # Core Label functionality (52 tests)
├── unit-helpers.test.ts         # Unit conversions (39 tests)
├── parser-emitter.test.ts       # ZPL parsing/emission (34 tests)
├── image-encoder.test.ts        # Image processing (13 tests)
├── rfid.test.ts                # RFID/EPC functionality (13 tests)
├── zpl-validation.test.ts       # ZPL compliance (25 tests)
└── real-world-examples.test.ts  # Real scenarios (3 tests)
```

### Code Style:

- Use TypeScript strict mode
- Prefer explicit types over `any`
- Document public APIs with JSDoc
- Use functional programming patterns
- Avoid side effects in pure functions

### ZPL Best Practices:

- Always wrap labels in `^XA...^XZ`
- Escape carets in text data: `^` → `^^`
- Include required parameters (font height/width - never leave empty)
- Use consistent coordinate systems (all positions in dots)
- Validate field positioning within label bounds
- Proper field data termination: `^FD<data>^FS`
- Font commands must include size: `^AAN28,28` not `^AAN,`
- Barcode data should be validated for type compatibility
- Use appropriate DPI settings for target printer

**ZPL Validation Checklist:**

- [ ] Label starts with `^XA` and ends with `^XZ`
- [ ] All `^FD` blocks are terminated with `^FS`
- [ ] Font commands include height and width parameters
- [ ] Coordinates are within label bounds
- [ ] Special characters are properly escaped
- [ ] Commands follow proper ZPL syntax

## Common Patterns

### Creating Complex Labels:

```typescript
const shippingLabel = Label.create({ w: 400, h: 600, units: 'dot', dpi: 203 })
  .text({
    at: { x: 50, y: 50 },
    text: 'PRIORITY MAIL',
    font: { family: 'B', h: 32, w: 32 }
  })
  .addressBlock({
    at: { x: 50, y: 120 },
    lines: ['From:', 'John Doe', '123 Main St', 'City, ST 12345'],
    lineHeight: 25,
    size: 20
  })
  .barcode({
    at: { x: 50, y: 350 },
    type: 'Code128',
    data: '1Z999AA1234567890',
    height: 100
  })
```

### Error Handling:

- Validate inputs at API boundaries
- Provide meaningful error messages
- Handle edge cases gracefully (empty text, zero dimensions)
- Maintain ZPL validity even with invalid inputs

### Performance:

- Token-based system minimizes string concatenation
- Lazy evaluation - ZPL generated only on `toZPL()`
- Immutable operations allow caching and memoization
- Unit conversions cached where possible

## Debugging and Troubleshooting

### Common Issues:

1. **Invalid ZPL Output**
   - Use `zpl-validation.test.ts` patterns to validate output
   - Check that font commands include height/width: `^AAN28,28`
   - Ensure proper field termination: `^FD<data>^FS`

2. **Unit Conversion Problems**
   - Use `toDots()` function for all positioning
   - Remember: 1 inch = 25.4mm
   - DPI affects mm/inch conversions but not dot values

3. **Text Rendering Issues**
   - Escape carets in text: `^` becomes `^^`
   - Check font family availability on target printer
   - Verify coordinates are within label bounds

4. **Barcode Problems**
   - Validate data format for barcode type
   - Check barcode height and module size
   - Ensure adequate quiet zones around barcodes

### Testing New Features:

```typescript
// Always test ZPL validity
const label = Label.create({ w: 400, h: 600 }).newFeature({
  /* options */
})
const zpl = label.toZPL()

// Basic validation
expect(zpl).toMatch(/^\^XA.*\^XZ$/)
expect(zpl).not.toMatch(/\^FD(?![^]*?\^FS)/) // No orphaned ^FD

// Use validation helper from zpl-validation.test.ts
validateBasicZPLStructure(zpl)
```

## API Examples by Use Case

### Shipping Labels:

```typescript
const shipping = Label.create({ w: 4, h: 6, units: 'in', dpi: 203 })
  .text({ at: { x: 0.5, y: 0.5 }, text: 'FEDEX', font: { family: 'B', h: 32, w: 32 } })
  .addressBlock({
    at: { x: 0.5, y: 1 },
    lines: ['John Doe', '123 Main St', 'City, ST 12345'],
    lineHeight: 25
  })
  .barcode({ at: { x: 0.5, y: 3 }, type: 'Code128', data: trackingNumber })
```

### Product Labels:

```typescript
const product = Label.create({ w: 100, h: 50, units: 'mm', dpi: 300 })
  .text({ at: { x: 5, y: 5 }, text: productName })
  .qr({ at: { x: 60, y: 10 }, text: productUrl })
  .text({ at: { x: 5, y: 35 }, text: `$${price}` })
```

### Inventory Tags:

```typescript
const inventory = Label.create({ w: 200, h: 100 })
  .box({ at: { x: 5, y: 5 }, size: { w: 190, h: 90 }, border: 2 })
  .text({ at: { x: 10, y: 20 }, text: 'SKU:', font: { family: 'B' } })
  .text({ at: { x: 50, y: 20 }, text: skuCode })
  .barcode({ at: { x: 10, y: 50 }, type: 'Code39', data: skuCode })
```
