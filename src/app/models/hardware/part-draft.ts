import { BoardFormFactor, CpuSocket, HardwareCategory, HardwarePart, PerformanceTier, toSlotParam } from './hardware-part';

export const PERFORMANCE_TIERS: readonly PerformanceTier[] = ['Flagship', 'Enthusiast', 'Mainstream'];
export const CPU_SOCKETS: readonly CpuSocket[] = ['AM5', 'LGA1700'];
export const BOARD_FORM_FACTORS: readonly BoardFormFactor[] = ['E-ATX', 'ATX', 'Micro-ATX', 'Mini-ITX'];
export const GPU_INTERFACES = ['PCIe 5.0 x16', 'PCIe 4.0 x16'] as const;
export const STORAGE_INTERFACES = ['M.2 2280 PCIe 5.0 x4', 'M.2 2280 PCIe 4.0 x4', '2.5" SATA III'] as const;
export const PSU_EFFICIENCIES = ['Bronze', 'Gold', 'Platinum', 'Titanium'] as const;

export type CoolerType = 'aio' | 'air';
export type PsuEfficiency = (typeof PSU_EFFICIENCIES)[number];

/** What `benchmarkScore` measures for each category, matching the seeded catalog. */
export const BENCHMARK_SUITES: Record<HardwareCategory, string> = {
  CPU: 'Cinebench R23 Multi',
  GPU: '3DMark Time Spy Graphics',
  Motherboard: 'GameForge Lab Index',
  RAM: 'Rated Speed (MT/s)',
  Storage: '3DMark Storage',
  Cooling: 'GameForge Lab Index',
  PSU: 'GameForge Lab Index',
  Case: 'GameForge Lab Index'
};

/** Everything an admin enters for a new part. Category-specific fields are ignored elsewhere. */
export interface PartDraft {
  name: string;
  brand: string;
  category: HardwareCategory;
  performanceTier: PerformanceTier;
  price: number;
  tdpWattage: number;
  benchmarkScore: number;
  specsDetail: string;
  compatibilityNote: string;
  socket: CpuSocket;
  formFactor: BoardFormFactor;
  interfaceType: string;
  lengthMm: number;
  coolerType: CoolerType;
  heightMm: number;
  radiatorMm: number;
  coolingCapacityW: number;
  supportedSockets: readonly CpuSocket[];
  wattageCapacity: number;
  efficiency: PsuEfficiency;
  supportedFormFactors: readonly BoardFormFactor[];
  maxGpuLengthMm: number;
  maxCoolerHeightMm: number;
  maxRadiatorMm: number;
}

/** Specification fields that only apply to some categories. */
export type SpecField = Exclude<keyof PartDraft, 'name' | 'brand' | 'category' | 'performanceTier' | 'price' | 'benchmarkScore' | 'specsDetail' | 'compatibilityNote'>;

export const SPEC_FIELDS: readonly SpecField[] = [
  'tdpWattage', 'socket', 'formFactor', 'interfaceType', 'lengthMm', 'coolerType', 'heightMm', 'radiatorMm', 'coolingCapacityW',
  'supportedSockets', 'wattageCapacity', 'efficiency', 'supportedFormFactors', 'maxGpuLengthMm', 'maxCoolerHeightMm', 'maxRadiatorMm'
];

/**
 * The specification fields the compatibility and power checks read for a category,
 * so the Add Component form only asks for what applies.
 */
export function specFieldsFor(category: HardwareCategory, coolerType: CoolerType = 'aio'): readonly SpecField[] {
  switch (category) {
    case 'CPU':
      return ['tdpWattage', 'socket'];
    case 'GPU':
      return ['tdpWattage', 'interfaceType', 'lengthMm'];
    case 'Motherboard':
      return ['tdpWattage', 'socket', 'formFactor'];
    case 'RAM':
      return ['tdpWattage'];
    case 'Storage':
      return ['tdpWattage', 'interfaceType'];
    case 'Cooling':
      return ['tdpWattage', 'coolerType', coolerType === 'aio' ? 'radiatorMm' : 'heightMm', 'coolingCapacityW', 'supportedSockets'];
    case 'PSU':
      return ['wattageCapacity', 'efficiency'];
    case 'Case':
      return ['tdpWattage', 'supportedFormFactors', 'maxGpuLengthMm', 'maxCoolerHeightMm', 'maxRadiatorMm'];
  }
}

const socketLabel = (socket: CpuSocket) => socket === 'AM5' ? 'Socket AM5' : 'Intel LGA1700';

/** Largest board a case accepts, in BOARD_FORM_FACTORS order. */
const largestFormFactor = (formFactors: readonly BoardFormFactor[]) =>
  BOARD_FORM_FACTORS.find(formFactor => formFactors.includes(formFactor)) ?? 'ATX';

/** The catalog's "Socket / Form Factor" label, derived from the specification fields. */
export function socketOrFormFactorFor(draft: PartDraft): string {
  switch (draft.category) {
    case 'CPU':
      return socketLabel(draft.socket);
    case 'Motherboard':
      return `${socketLabel(draft.socket)} / ${draft.formFactor}`;
    case 'GPU':
    case 'Storage':
      return draft.interfaceType;
    case 'RAM':
      return 'DDR5 DIMM';
    case 'Cooling':
      return draft.coolerType === 'aio' ? `${draft.radiatorMm}mm AIO Liquid` : 'Tower Air';
    case 'PSU':
      return `ATX 3.1 / ${draft.wattageCapacity}W`;
    case 'Case': {
      const largest = largestFormFactor(draft.supportedFormFactors);
      return `${largest === 'E-ATX' ? 'Full Tower' : 'Mid Tower'} / ${largest}`;
    }
  }
}

/** Lower-case, dash-separated slug used in generated part ids. */
export function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'part';
}

/** A unique id such as `gpu-rtx-5070-ti`, suffixed when it already exists. */
export function createPartId(draft: Pick<PartDraft, 'category' | 'name'>, isTaken: (id: string) => boolean): string {
  const base = `${toSlotParam(draft.category)}-${slugify(draft.name)}`;
  let id = base;
  for (let n = 2; isTaken(id); n++) {
    id = `${base}-${n}`;
  }
  return id;
}

/**
 * Builds a catalog part with exactly the attributes the power and compatibility
 * checks need for its category, so new parts are verified like the seeded ones.
 */
export function buildHardwarePart(draft: PartDraft, id: string): HardwarePart {
  const { category } = draft;
  const specsDetail = draft.specsDetail.trim();
  const part: HardwarePart = {
    id,
    name: draft.name.trim(),
    brand: draft.brand.trim(),
    imageUrl: `/assets/hardware/${toSlotParam(category)}.svg`,
    category,
    performanceTier: draft.performanceTier,
    socketOrFormFactor: socketOrFormFactorFor(draft),
    tdpWattage: category === 'PSU' ? 0 : draft.tdpWattage,
    benchmarkScore: draft.benchmarkScore,
    benchmarkSuite: BENCHMARK_SUITES[category],
    price: draft.price,
    specsDetail,
    compatibilityNote: draft.compatibilityNote.trim()
  };

  switch (category) {
    case 'CPU':
      return { ...part, socket: draft.socket, memoryType: 'DDR5' };
    case 'Motherboard':
      return { ...part, socket: draft.socket, formFactor: draft.formFactor, memoryType: 'DDR5' };
    case 'RAM':
      return { ...part, memoryType: 'DDR5' };
    case 'GPU':
      return { ...part, lengthMm: draft.lengthMm };
    case 'Cooling':
      return {
        ...part,
        supportedSockets: [...draft.supportedSockets],
        coolingCapacityW: draft.coolingCapacityW,
        ...(draft.coolerType === 'aio' ? { radiatorMm: draft.radiatorMm } : { heightMm: draft.heightMm })
      };
    case 'PSU': {
      // The power report reads the efficiency rating from the "80+ <rating>" text.
      const rating = `80+ ${draft.efficiency}`;
      return {
        ...part,
        wattageCapacity: draft.wattageCapacity,
        specsDetail: specsDetail.includes(rating) ? specsDetail : [`${draft.wattageCapacity}W, ${rating}`, specsDetail].filter(Boolean).join(', ')
      };
    }
    case 'Case':
      return {
        ...part,
        supportedFormFactors: [...draft.supportedFormFactors],
        maxGpuLengthMm: draft.maxGpuLengthMm,
        maxCoolerHeightMm: draft.maxCoolerHeightMm,
        maxRadiatorMm: draft.maxRadiatorMm
      };
    default:
      return part;
  }
}
