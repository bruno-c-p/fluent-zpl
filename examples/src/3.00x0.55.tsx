// import './App.css'
import { FontFamily, Justify, Label } from '@schie/fluent-zpl';

import {
  barcode,
  curryInch,
  curryMm,
  dimension1,
  dimension2,
  epc,
  itemDescription,
} from './_shared';
import { TagCard } from './TagCard';

const wInch = 2.9921;
const hInch = 0.5512;

// For now, let's create a simple version without the actual image
const w = curryInch(wInch);
const h = curryInch(hInch);

const label = Label.create({ w, h })
  // .box({ at: { x: 0, y: 0 }, size: { w: Math.floor(w / 3), h } })
  // .box({ at: { x: Math.floor(w / 3), y: 0 }, size: { w: Math.floor(w / 3), h } })
  // .box({ at: { x: Math.floor((w / 3) * 2), y: 0 }, size: { w: Math.floor(w / 3), h } })
  .qr({
    at: { x: Math.floor(w / 3 + 20), y: 20 },
    text: barcode,
    magnification: 5,
  })
  .text({
    at: { x: Math.floor((w / 3) * 2) + 10, y: curryMm(2) },
    wrap: {
      width: Math.floor(w / 3 - 20),
      lines: 3,
      justify: Justify.Left,
    },
    font: { family: FontFamily.A, h: curryMm(1.5), w: curryMm(1.2) },
    text: itemDescription,
  })
  .text({
    at: { x: Math.floor((w * 2) / 3) + 10, y: Math.floor(h * 0.6) },
    font: { family: FontFamily.A, h: curryMm(1.2), w: curryMm(1.1) },
    text: dimension1,
    wrap: { width: Math.floor(w / 3 - 20) },
  })
  .text({
    at: { x: Math.floor((w * 2) / 3) + 10, y: Math.floor(h * 0.8) },
    font: { family: FontFamily.A, h: curryMm(1.2), w: curryMm(1.1) },
    text: dimension2,
    wrap: { width: Math.floor(w / 3 - 20) },
  })
  .text({
    at: { x: Math.floor(w / 3), y: h - 20 },
    font: { family: FontFamily.A, h: curryMm(1.2), w: curryMm(1) },
    text: epc,
    wrap: { width: Math.floor(w / 3), justify: Justify.Center },
  })
  .epc({
    epc,
  });

const zpl = label.toZPL();

export function Label300x55() {
  return (
    <TagCard
      title={`${wInch} x ${hInch} - Jewelry flag`}
      description="A compact label ideal for small products, offering essential information"
      zpl={zpl}
      widthInInches={wInch}
      heightInInches={hInch}
    />
  );
}
