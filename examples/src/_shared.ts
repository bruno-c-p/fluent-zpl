import { inch, mm } from '@schie/fluent-zpl';

export const barcode = '123456789012';
export const itemDescription = 'Sample Product Name Sample Product Name';
export const dimension1 = 'Medium';
export const dimension2 = 'Red';
export const epc = '3000C2D01234567890ABCDEE';
export const retail = '$29.99';

export const dpi = 300;

export const curryInch = (n: number) => inch(n, dpi);
export const curryMm = (n: number) => mm(n, dpi);

export const ppi = 96; // pixels per inch

export const inchToPixels = (n: number) => Math.floor(n * ppi);
