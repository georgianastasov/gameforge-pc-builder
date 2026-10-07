import { HardwarePart } from '../models/hardware/hardware-part';

export const FlagshipPCHardwareCatalog: readonly HardwarePart[] = [
  // CPU
  {
    id: 'cpu-ryzen9-9950x3d', name: 'AMD Ryzen 9 9950X3D', brand: 'AMD', imageUrl: '/assets/pngs/components-1.png', category: 'CPU',
    performanceTier: 'Flagship', socketOrFormFactor: 'Socket AM5', socket: 'AM5', memoryType: 'DDR5',
    tdpWattage: 170, benchmarkScore: 42850, benchmarkSuite: 'Cinebench R23 Multi', price: 699,
    specsDetail: '16C/32T Zen 5, 5.7 GHz boost, 128MB L3 with 3D V-Cache, 170W TDP',
    compatibilityNote: 'Requires AM5 board and DDR5; 360mm AIO recommended'
  },
  {
    id: 'cpu-ryzen7-9800x3d', name: 'AMD Ryzen 7 9800X3D', brand: 'AMD', imageUrl: '/assets/pngs/components-2.png', category: 'CPU',
    performanceTier: 'Enthusiast', socketOrFormFactor: 'Socket AM5', socket: 'AM5', memoryType: 'DDR5',
    tdpWattage: 120, benchmarkScore: 23400, benchmarkSuite: 'Cinebench R23 Multi', price: 479,
    specsDetail: '8C/16T Zen 5, 5.2 GHz boost, 96MB L3 with 3D V-Cache, 120W TDP',
    compatibilityNote: 'Requires AM5 board and DDR5; dual-tower air sufficient'
  },
  {
    id: 'cpu-core-i7-14700k', name: 'Intel Core i7-14700K', brand: 'Intel', imageUrl: '/assets/pngs/components-3.png', category: 'CPU',
    performanceTier: 'Mainstream', socketOrFormFactor: 'Intel LGA1700', socket: 'LGA1700', memoryType: 'DDR5',
    tdpWattage: 253, benchmarkScore: 35800, benchmarkSuite: 'Cinebench R23 Multi', price: 399,
    specsDetail: '20C/28T (8P + 12E), 5.6 GHz boost, 33MB L3, 253W max turbo power',
    compatibilityNote: 'Requires LGA1700 board; 280mm+ AIO for sustained turbo'
  },

  // GPU
  {
    id: 'gpu-rtx-5090-fe', name: 'NVIDIA GeForce RTX 5090 Founders Edition', brand: 'NVIDIA', imageUrl: '/assets/pngs/components-4.png', category: 'GPU',
    performanceTier: 'Flagship', socketOrFormFactor: 'PCIe 5.0 x16', lengthMm: 304,
    tdpWattage: 575, benchmarkScore: 48600, benchmarkSuite: '3DMark Time Spy Graphics', price: 1999,
    specsDetail: '32GB GDDR7, 21,760 CUDA cores, 2.41 GHz boost, 12V-2x6 power, 575W TGP',
    compatibilityNote: '304mm dual-slot; 1000W+ ATX 3.1 PSU recommended'
  },
  {
    id: 'gpu-rtx-5080-fe', name: 'NVIDIA GeForce RTX 5080 Founders Edition', brand: 'NVIDIA', imageUrl: '/assets/pngs/components-5.png', category: 'GPU',
    performanceTier: 'Enthusiast', socketOrFormFactor: 'PCIe 5.0 x16', lengthMm: 304,
    tdpWattage: 360, benchmarkScore: 32300, benchmarkSuite: '3DMark Time Spy Graphics', price: 999,
    specsDetail: '16GB GDDR7, 10,752 CUDA cores, 2.62 GHz boost, 12V-2x6 power, 360W TGP',
    compatibilityNote: '304mm dual-slot; 850W+ PSU recommended'
  },
  {
    id: 'gpu-rx-9070xt-nitro', name: 'Sapphire Nitro+ Radeon RX 9070 XT', brand: 'Sapphire', imageUrl: '/assets/pngs/components-6.png', category: 'GPU',
    performanceTier: 'Mainstream', socketOrFormFactor: 'PCIe 5.0 x16', lengthMm: 315,
    tdpWattage: 330, benchmarkScore: 29700, benchmarkSuite: '3DMark Time Spy Graphics', price: 729,
    specsDetail: '16GB GDDR6, 64 RDNA 4 compute units, 3.06 GHz boost, 330W TBP',
    compatibilityNote: '315mm triple-fan, 3.5-slot; 850W+ PSU recommended'
  },

  // Motherboard
  {
    id: 'mb-rog-crosshair-x870e-hero', name: 'ASUS ROG Crosshair X870E Hero', brand: 'ASUS', imageUrl: '/assets/pngs/components-7.png', category: 'Motherboard',
    performanceTier: 'Flagship', socketOrFormFactor: 'Socket AM5 / ATX', socket: 'AM5', formFactor: 'ATX', memoryType: 'DDR5',
    tdpWattage: 45, benchmarkScore: 9600, benchmarkSuite: 'GameForge Lab Index', price: 699,
    specsDetail: 'X870E chipset, 18+2+2 110A VRM, PCIe 5.0 x16, 5x M.2 (2x Gen5), dual USB4, Wi-Fi 7',
    compatibilityNote: 'AM5 CPUs only; DDR5 up to 8000+ MT/s'
  },
  {
    id: 'mb-mag-x870-tomahawk', name: 'MSI MAG X870 Tomahawk WiFi', brand: 'MSI', imageUrl: '/assets/pngs/components-8.png', category: 'Motherboard',
    performanceTier: 'Enthusiast', socketOrFormFactor: 'Socket AM5 / ATX', socket: 'AM5', formFactor: 'ATX', memoryType: 'DDR5',
    tdpWattage: 40, benchmarkScore: 8400, benchmarkSuite: 'GameForge Lab Index', price: 289,
    specsDetail: 'X870 chipset, 14+2+1 80A VRM, PCIe 5.0 x16, 4x M.2 (1x Gen5), USB4, Wi-Fi 7',
    compatibilityNote: 'AM5 CPUs only; DDR5 up to 8000 MT/s'
  },
  {
    id: 'mb-mag-z790-tomahawk', name: 'MSI MAG Z790 Tomahawk WiFi', brand: 'MSI', imageUrl: '/assets/pngs/components-9.png', category: 'Motherboard',
    performanceTier: 'Mainstream', socketOrFormFactor: 'Intel LGA1700 / ATX', socket: 'LGA1700', formFactor: 'ATX', memoryType: 'DDR5',
    tdpWattage: 40, benchmarkScore: 7900, benchmarkSuite: 'GameForge Lab Index', price: 259,
    specsDetail: 'Z790 chipset, 16+1+1 90A VRM, PCIe 5.0 x16, 4x M.2 Gen4, Wi-Fi 6E',
    compatibilityNote: 'LGA1700 CPUs only; DDR5 up to 7200 MT/s'
  },

  // RAM
  {
    id: 'ram-trident-z5-neo-64', name: 'G.Skill Trident Z5 Neo RGB 64GB', brand: 'G.Skill', imageUrl: '/assets/pngs/components-10.png', category: 'RAM',
    performanceTier: 'Flagship', socketOrFormFactor: 'DDR5 DIMM', memoryType: 'DDR5',
    tdpWattage: 10, benchmarkScore: 6000, benchmarkSuite: 'Rated Speed (MT/s)', price: 219,
    specsDetail: '64GB (2x32GB) DDR5-6000 CL30-36-36-96, AMD EXPO, 1.40V',
    compatibilityNote: 'DDR5 only; 1:1 FCLK on AM5'
  },
  {
    id: 'ram-vengeance-rgb-32', name: 'Corsair Vengeance RGB 32GB', brand: 'Corsair', imageUrl: '/assets/pngs/components-1.png', category: 'RAM',
    performanceTier: 'Enthusiast', socketOrFormFactor: 'DDR5 DIMM', memoryType: 'DDR5',
    tdpWattage: 8, benchmarkScore: 6000, benchmarkSuite: 'Rated Speed (MT/s)', price: 119,
    specsDetail: '32GB (2x16GB) DDR5-6000 CL30-36-36-76, EXPO + XMP 3.0, 1.40V',
    compatibilityNote: 'DDR5 only; AM5 and LGA1700 validated'
  },
  {
    id: 'ram-fury-renegade-32', name: 'Kingston FURY Renegade 32GB', brand: 'Kingston', imageUrl: '/assets/pngs/components-2.png', category: 'RAM',
    performanceTier: 'Mainstream', socketOrFormFactor: 'DDR5 DIMM', memoryType: 'DDR5',
    tdpWattage: 8, benchmarkScore: 6400, benchmarkSuite: 'Rated Speed (MT/s)', price: 129,
    specsDetail: '32GB (2x16GB) DDR5-6400 CL32-39-39, Intel XMP 3.0, 1.40V',
    compatibilityNote: 'DDR5 only; tuned for Intel Z790'
  },

  // Storage
  {
    id: 'ssd-crucial-t705-2tb', name: 'Crucial T705 2TB', brand: 'Crucial', imageUrl: '/assets/pngs/components-3.png', category: 'Storage',
    performanceTier: 'Flagship', socketOrFormFactor: 'M.2 2280 PCIe 5.0 x4',
    tdpWattage: 10, benchmarkScore: 5850, benchmarkSuite: '3DMark Storage', price: 259,
    specsDetail: 'PCIe 5.0 NVMe, 14,500 MB/s read / 12,700 MB/s write, 1,200 TBW',
    compatibilityNote: 'Needs Gen5 M.2 slot for full speed; heatsink included'
  },
  {
    id: 'ssd-samsung-990-pro-2tb', name: 'Samsung 990 Pro 2TB', brand: 'Samsung', imageUrl: '/assets/pngs/components-4.png', category: 'Storage',
    performanceTier: 'Enthusiast', socketOrFormFactor: 'M.2 2280 PCIe 4.0 x4',
    tdpWattage: 8, benchmarkScore: 3900, benchmarkSuite: '3DMark Storage', price: 169,
    specsDetail: 'PCIe 4.0 NVMe, 7,450 MB/s read / 6,900 MB/s write, 1,200 TBW',
    compatibilityNote: 'Any M.2 2280 slot'
  },
  {
    id: 'ssd-samsung-990-evo-plus-2tb', name: 'Samsung 990 EVO Plus 2TB', brand: 'Samsung', imageUrl: '/assets/pngs/components-5.png', category: 'Storage',
    performanceTier: 'Mainstream', socketOrFormFactor: 'M.2 2280 PCIe 4.0 x4',
    tdpWattage: 6, benchmarkScore: 3300, benchmarkSuite: '3DMark Storage', price: 129,
    specsDetail: 'PCIe 4.0 x4 / 5.0 x2 NVMe, 7,250 MB/s read / 6,300 MB/s write, 1,200 TBW',
    compatibilityNote: 'Any M.2 2280 slot'
  },

  // Cooling
  {
    id: 'cool-kraken-elite-360', name: 'NZXT Kraken Elite 360 RGB', brand: 'NZXT', imageUrl: '/assets/pngs/components-6.png', category: 'Cooling',
    performanceTier: 'Flagship', socketOrFormFactor: '360mm AIO Liquid', supportedSockets: ['AM5', 'LGA1700'],
    radiatorMm: 360, coolingCapacityW: 300,
    tdpWattage: 15, benchmarkScore: 9300, benchmarkSuite: 'GameForge Lab Index', price: 279,
    specsDetail: '360mm radiator, 2.36" LCD pump head, 3x 120mm F120 RGB Core fans',
    compatibilityNote: 'Needs 360mm radiator mount'
  },
  {
    id: 'cool-noctua-nh-d15-g2', name: 'Noctua NH-D15 G2', brand: 'Noctua', imageUrl: '/assets/pngs/components-7.png', category: 'Cooling',
    performanceTier: 'Enthusiast', socketOrFormFactor: 'Dual-Tower Air', supportedSockets: ['AM5', 'LGA1700'],
    heightMm: 168, coolingCapacityW: 250,
    tdpWattage: 5, benchmarkScore: 8700, benchmarkSuite: 'GameForge Lab Index', price: 149,
    specsDetail: 'Dual-tower, 8 heatpipes, 2x NF-A14x25r G2 PWM fans, 168mm tall',
    compatibilityNote: 'Needs 168mm CPU cooler clearance'
  },
  {
    id: 'cool-arctic-lf3-280', name: 'Arctic Liquid Freezer III 280', brand: 'Arctic', imageUrl: '/assets/pngs/components-8.png', category: 'Cooling',
    performanceTier: 'Mainstream', socketOrFormFactor: '280mm AIO Liquid', supportedSockets: ['AM5', 'LGA1700'],
    radiatorMm: 280, coolingCapacityW: 270,
    tdpWattage: 12, benchmarkScore: 8500, benchmarkSuite: 'GameForge Lab Index', price: 99,
    specsDetail: '280mm radiator, 38mm thick, 2x P14 PWM fans, VRM fan, LGA1700 contact frame',
    compatibilityNote: 'Needs 280mm radiator mount'
  },

  // PSU
  {
    id: 'psu-corsair-hx1200i', name: 'Corsair HX1200i', brand: 'Corsair', imageUrl: '/assets/pngs/components-9.png', category: 'PSU',
    performanceTier: 'Flagship', socketOrFormFactor: 'ATX 3.1 / 1200W', wattageCapacity: 1200,
    tdpWattage: 0, benchmarkScore: 9200, benchmarkSuite: 'GameForge Lab Index', price: 269,
    specsDetail: '1200W, 80+ Platinum, fully modular, native 12V-2x6, 10-year warranty',
    compatibilityNote: 'ATX PSU bay; covers 575W GPUs with headroom'
  },
  {
    id: 'psu-seasonic-vertex-gx1000', name: 'Seasonic Vertex GX-1000', brand: 'Seasonic', imageUrl: '/assets/pngs/components-10.png', category: 'PSU',
    performanceTier: 'Enthusiast', socketOrFormFactor: 'ATX 3.0 / 1000W', wattageCapacity: 1000,
    tdpWattage: 0, benchmarkScore: 8600, benchmarkSuite: 'GameForge Lab Index', price: 199,
    specsDetail: '1000W, 80+ Gold, fully modular, native 12VHPWR, 12-year warranty',
    compatibilityNote: 'ATX PSU bay'
  },
  {
    id: 'psu-corsair-rm850x', name: 'Corsair RM850x', brand: 'Corsair', imageUrl: '/assets/pngs/components-1.png', category: 'PSU',
    performanceTier: 'Mainstream', socketOrFormFactor: 'ATX 3.1 / 850W', wattageCapacity: 850,
    tdpWattage: 0, benchmarkScore: 8100, benchmarkSuite: 'GameForge Lab Index', price: 139,
    specsDetail: '850W, 80+ Gold, fully modular, native 12V-2x6, 10-year warranty',
    compatibilityNote: 'ATX PSU bay; keep total draw under 680W'
  },

  // Case
  {
    id: 'case-o11-evo-xl', name: 'Lian Li O11 Dynamic EVO XL', brand: 'Lian Li', imageUrl: '/assets/pngs/components-2.png', category: 'Case',
    performanceTier: 'Flagship', socketOrFormFactor: 'Full Tower / E-ATX', supportedFormFactors: ['E-ATX', 'ATX', 'Micro-ATX', 'Mini-ITX'],
    maxGpuLengthMm: 460, maxCoolerHeightMm: 167, maxRadiatorMm: 420,
    tdpWattage: 0, benchmarkScore: 9100, benchmarkSuite: 'GameForge Lab Index', price: 229,
    specsDetail: 'Dual-chamber, tempered glass, 460mm GPU, up to 3x 420mm radiators, no fans included',
    compatibilityNote: 'Fits 460mm GPUs and 167mm air coolers'
  },
  {
    id: 'case-fractal-north', name: 'Fractal Design North', brand: 'Fractal Design', imageUrl: '/assets/pngs/components-3.png', category: 'Case',
    performanceTier: 'Enthusiast', socketOrFormFactor: 'Mid Tower / ATX', supportedFormFactors: ['ATX', 'Micro-ATX', 'Mini-ITX'],
    maxGpuLengthMm: 355, maxCoolerHeightMm: 170, maxRadiatorMm: 360,
    tdpWattage: 4, benchmarkScore: 8300, benchmarkSuite: 'GameForge Lab Index', price: 139,
    specsDetail: 'Walnut front panel, mesh side, 355mm GPU, 170mm cooler, 2x 140mm fans included',
    compatibilityNote: 'Fits 355mm GPUs and 170mm air coolers'
  },
  {
    id: 'case-nzxt-h6-flow', name: 'NZXT H6 Flow', brand: 'NZXT', imageUrl: '/assets/pngs/components-4.png', category: 'Case',
    performanceTier: 'Mainstream', socketOrFormFactor: 'Mid Tower / ATX', supportedFormFactors: ['ATX', 'Micro-ATX', 'Mini-ITX'],
    maxGpuLengthMm: 365, maxCoolerHeightMm: 163, maxRadiatorMm: 360,
    tdpWattage: 6, benchmarkScore: 8000, benchmarkSuite: 'GameForge Lab Index', price: 119,
    specsDetail: 'Dual-chamber, panoramic glass, 365mm GPU, 163mm cooler, 3x 120mm fans included',
    compatibilityNote: 'Fits 365mm GPUs and 163mm air coolers'
  }
];
