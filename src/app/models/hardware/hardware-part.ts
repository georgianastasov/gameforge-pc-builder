import { HighEndPcHardwareType } from '../flagship-pchardware-catalog/high-end-pc-hardware-type';

/** The eight hardware slots of a GameForge build, in assembly order. */
export const HARDWARE_CATEGORIES = ['CPU', 'GPU', 'Motherboard', 'RAM', 'Storage', 'Cooling', 'PSU', 'Case'] as const;

export type HardwareCategory = (typeof HARDWARE_CATEGORIES)[number];

/** URL form of a slot, used as `/components?slot=<slot>` (e.g. `gpu`). */
export function toSlotParam(category: HardwareCategory): string {
  return category.toLowerCase();
}

/** Resolves a `slot` query parameter back to its category; `null` when missing or unknown. */
export function parseSlotParam(value: string | null | undefined): HardwareCategory | null {
  const slot = value?.trim().toLowerCase();
  return HARDWARE_CATEGORIES.find(category => toSlotParam(category) === slot) ?? null;
}

export type PerformanceTier = 'Flagship' | 'Enthusiast' | 'Mainstream';

export type CpuSocket = 'AM5' | 'LGA1700';

export type BoardFormFactor = 'E-ATX' | 'ATX' | 'Micro-ATX' | 'Mini-ITX';

/**
 * A catalog part. Extends the App Builder generated type so existing
 * template bindings (name, brand, category, tdpWattage, ...) keep working,
 * and adds the fields needed for pricing, power and compatibility checks.
 */
export interface HardwarePart extends HighEndPcHardwareType {
  id: string;
  name: string;
  brand: string;
  imageUrl: string;
  category: HardwareCategory;
  performanceTier: PerformanceTier;
  socketOrFormFactor: string;
  /** Sustained power draw used for the system power budget (W). */
  tdpWattage: number;
  benchmarkScore: number;
  /** What `benchmarkScore` measures, e.g. "Cinebench R23 Multi". */
  benchmarkSuite: string;
  price: number;
  specsDetail: string;
  compatibilityNote: string;

  // Compatibility attributes (only set where they apply to the category).
  /** CPU / motherboard socket; coolers list every socket they mount on. */
  socket?: CpuSocket;
  supportedSockets?: CpuSocket[];
  memoryType?: 'DDR5';
  formFactor?: BoardFormFactor;
  supportedFormFactors?: BoardFormFactor[];
  /** GPU card length (mm). */
  lengthMm?: number;
  /** Air cooler height (mm). */
  heightMm?: number;
  /** AIO radiator size (mm). */
  radiatorMm?: number;
  /** Cooler thermal rating (W). */
  coolingCapacityW?: number;
  /** PSU rated output (W). */
  wattageCapacity?: number;
  maxGpuLengthMm?: number;
  maxCoolerHeightMm?: number;
  maxRadiatorMm?: number;
}
