/**
 * Opening warehouse stock per catalog part: [units on hand, reorder threshold].
 * Every seeded part ships in a featured preset, so all are orderable; five sit at
 * or below their reorder threshold.
 */
export const StoreInventory: Readonly<Record<string, readonly [stock: number, threshold: number]>> = {
  'cpu-ryzen9-9950x3d': [14, 6],
  'cpu-ryzen7-9800x3d': [4, 8],
  'cpu-core-i7-14700k': [22, 6],
  'gpu-rtx-5090-fe': [3, 5],
  'gpu-rtx-5080-fe': [11, 6],
  'gpu-rx-9070xt-nitro': [17, 6],
  'mb-rog-crosshair-x870e-hero': [9, 4],
  'mb-mag-x870-tomahawk': [16, 5],
  'mb-mag-z790-tomahawk': [12, 5],
  'ram-trident-z5-neo-64': [25, 8],
  'ram-vengeance-rgb-32': [38, 10],
  'ram-fury-renegade-32': [7, 8],
  'ssd-crucial-t705-2tb': [5, 6],
  'ssd-samsung-990-pro-2tb': [31, 10],
  'ssd-samsung-990-evo-plus-2tb': [27, 10],
  'cool-kraken-elite-360': [10, 5],
  'cool-noctua-nh-d15-g2': [19, 6],
  'cool-arctic-lf3-280': [23, 6],
  'psu-corsair-hx1200i': [8, 4],
  'psu-seasonic-vertex-gx1000': [13, 5],
  'psu-corsair-rm850x': [29, 8],
  'case-o11-evo-xl': [6, 3],
  'case-fractal-north': [4, 5],
  'case-nzxt-h6-flow': [18, 6]
};
