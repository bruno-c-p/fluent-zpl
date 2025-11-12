# Fluent ZPL Examples

A React + Vite playground that showcases how to use `@schie/fluent-zpl` to build production labels. Each card in the gallery renders a specific label size (1.75"×0.75", 3.00"×1.00", RFID tags, etc.), previews the generated ZPL, and lets you tweak sample data in real time.

- **Why this exists** – Quickly validate layouts against different DPI/settings without flashing firmware to a real printer.
- **What you get** – Ready-made label components in `examples/src/components`, a Tailwind/DaisyUI surface, and a web worker (`examples/src/zpl-web-worker.ts`) that keeps heavy ZPL rendering off the main thread.

## Prerequisites

- Node.js 20+
- Root repo dependencies installed (`npm install` at the project root)

## Getting Started

From the repository root:

```bash
npm run examples:install   # installs ./examples deps
npm run examples:dev       # starts Vite on http://localhost:5173
```

You can also run the scripts directly inside `examples/` with `npm install && npm run dev`.

### Available Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Start the Vite dev server with hot reloading |
| `npm run build` | Type-check (`tsc -b`) and produce a production bundle |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run the example app’s ESLint config |

## Project Tour

- `examples/src/App.tsx` – top-level layout, DPI toggles, and the label gallery grid.
- `examples/src/components/*.tsx` – one file per label size; each exports a `LabelDefinition` consumed by the gallery.
- `examples/src/components/TagCard.tsx` – renders the preview, sample data form, and copy/download buttons.
- `examples/src/zpl-web-worker.ts` – invokes `Label` builders in a worker to keep the UI responsive.
- `examples/src/_shared.ts` – shared helpers for unit conversions, demo payloads, and typography defaults.

## Creating a New Label Example

1. Duplicate an existing component in `examples/src/components`.
2. Update the metadata (`id`, `title`, `dimensions`), then build your label with the fluent API.
3. Add the component to `examples/src/components/index.ts` so the gallery picks it up.
4. Restart `npm run dev` (or let Vite hot reload) and verify the preview + ZPL output.

## Exporting / Sharing ZPL

Each card exposes:

- **Copy ZPL** – Copies the raw string to your clipboard for pasting into Zebra utilities or `lp`.
- **Download `.zpl`** – Saves the payload to disk for later transfer.

These controls reuse the same helpers you would call from Node/CLI, so they’re useful smoke tests before wiring up a printer pipeline.

## Troubleshooting

- If fonts/borders look off, check the DPI selector (top-right). The label builders respect the DPI you choose.
- Blank previews usually mean a syntax error in your fluent chain; check the dev console for stack traces from the worker.
- When adding heavy assets (images, RFID payloads), keep them inside the worker to avoid blocking React renders.

Have an idea for another showcase label or printer scenario? Add a new component and keep the gallery growing. The examples app is meant to be the quickest feedback loop before you commit ZPL to firmware.
