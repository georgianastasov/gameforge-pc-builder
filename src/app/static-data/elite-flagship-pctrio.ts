import { BuildPreset } from '../models/hardware/build-preset';

/** Preset definitions; `price` is filled in from the catalog by the service. */
export const EliteFlagshipPCTrio: readonly Omit<BuildPreset, 'price'>[] = [
  {
    id: 'apex-titan',
    name: 'GameForge Apex Titan',
    tier: 'Flagship // 4K Ultra & Creator',
    imageUrl: '/assets/pngs/home-1.png',
    benchmarkScore: 44800,
    specsSummary: 'Ryzen 9 9950X3D, RTX 5090 32GB, X870E Hero, 64GB DDR5-6000 CL30, 2TB PCIe 5.0, 360mm AIO, 1200W Platinum',
    parts: {
      CPU: 'cpu-ryzen9-9950x3d',
      GPU: 'gpu-rtx-5090-fe',
      Motherboard: 'mb-rog-crosshair-x870e-hero',
      RAM: 'ram-trident-z5-neo-64',
      Storage: 'ssd-crucial-t705-2tb',
      Cooling: 'cool-kraken-elite-360',
      PSU: 'psu-corsair-hx1200i',
      Case: 'case-o11-evo-xl'
    }
  },
  {
    id: 'vanguard',
    name: 'GameForge Vanguard',
    tier: 'Enthusiast // 1440p High Refresh',
    imageUrl: '/assets/pngs/home-2.png',
    benchmarkScore: 30900,
    specsSummary: 'Ryzen 7 9800X3D, RTX 5080 16GB, X870 Tomahawk, 32GB DDR5-6000 CL30, 2TB 990 Pro, NH-D15 G2, 1000W Gold',
    parts: {
      CPU: 'cpu-ryzen7-9800x3d',
      GPU: 'gpu-rtx-5080-fe',
      Motherboard: 'mb-mag-x870-tomahawk',
      RAM: 'ram-vengeance-rgb-32',
      Storage: 'ssd-samsung-990-pro-2tb',
      Cooling: 'cool-noctua-nh-d15-g2',
      PSU: 'psu-seasonic-vertex-gx1000',
      Case: 'case-fractal-north'
    }
  },
  {
    id: 'raptor',
    name: 'GameForge Raptor',
    tier: 'Mainstream // Esports & Streaming',
    imageUrl: '/assets/pngs/home-3.png',
    benchmarkScore: 27600,
    specsSummary: 'Core i7-14700K, Radeon RX 9070 XT 16GB, Z790 Tomahawk, 32GB DDR5-6400, 2TB 990 EVO Plus, 280mm AIO, 850W Gold',
    parts: {
      CPU: 'cpu-core-i7-14700k',
      GPU: 'gpu-rx-9070xt-nitro',
      Motherboard: 'mb-mag-z790-tomahawk',
      RAM: 'ram-fury-renegade-32',
      Storage: 'ssd-samsung-990-evo-plus-2tb',
      Cooling: 'cool-arctic-lf3-280',
      PSU: 'psu-corsair-rm850x',
      Case: 'case-nzxt-h6-flow'
    }
  }
];
