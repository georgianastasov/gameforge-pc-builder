import { HardwareCategory, HardwarePart, PerformanceTier } from '../models/hardware/hardware-part';
import { AVAILABILITY_MODES, AvailabilityMode, InventoryRecord, StockStatus } from '../models/store/inventory';

/** Filter labels from the App Builder Category select, in its order. */
export const CATEGORY_FILTER_LABELS: Record<HardwareCategory, string> = {
  CPU: 'Processors (CPU)',
  GPU: 'Graphics Cards (GPU)',
  Motherboard: 'Motherboards',
  RAM: 'Memory (RAM)',
  Storage: 'Storage (NVMe SSD)',
  PSU: 'Power Supplies (PSU)',
  Cooling: 'Cooling Solutions',
  Case: 'Chassis (Cases)'
};

/** Labels from the App Builder Add Component dialog. */
export const CATEGORY_LABELS: Record<HardwareCategory, string> = {
  CPU: 'Processor (CPU)',
  GPU: 'Graphics Card (GPU)',
  Motherboard: 'Motherboard',
  RAM: 'Memory (RAM)',
  Storage: 'Storage (NVMe SSD)',
  PSU: 'Power Supply (PSU)',
  Cooling: 'Cooling Solution',
  Case: 'Chassis / Case'
};

export const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS) as HardwareCategory[];

export type ListingStatus = 'Listed' | 'Discontinued';

export interface CatalogCriteria {
  search: string;
  category: HardwareCategory | 'all' | undefined;
  brand: string | undefined;
}

/** One row of the Components Management grid. */
export interface CatalogRow {
  id: string;
  imageUrl: string;
  name: string;
  brand: string;
  category: HardwareCategory;
  performanceTier: PerformanceTier;
  price: number;
  listing: ListingStatus;
}

/** One row of the Warehouse Stock grid. */
export interface InventoryRow {
  partId: string;
  componentName: string;
  category: HardwareCategory;
  stockQuantity: number;
  reorderThreshold: number;
  availabilityStatus: StockStatus;
  availabilityRule: string;
  listing: ListingStatus;
}

export const ALL_BRANDS = 'all';

export function brandsOf(parts: readonly HardwarePart[]): string[] {
  return [...new Set(parts.map(part => part.brand))].sort((a, b) => a.localeCompare(b));
}

export function matchesCatalogCriteria(part: HardwarePart, { search, category, brand }: CatalogCriteria): boolean {
  const term = search.trim().toLowerCase();
  return (!term || [part.name, part.brand, part.id, part.socketOrFormFactor].some(value => value.toLowerCase().includes(term)))
    && (!category || category === 'all' || part.category === category)
    && (!brand || brand === ALL_BRANDS || part.brand === brand);
}

export function toCatalogRow(part: HardwarePart, discontinued: boolean): CatalogRow {
  return {
    id: part.id,
    imageUrl: part.imageUrl,
    name: part.name,
    brand: part.brand,
    category: part.category,
    performanceTier: part.performanceTier,
    price: part.price,
    listing: discontinued ? 'Discontinued' : 'Listed'
  };
}

export function availabilityRuleLabel(mode: AvailabilityMode): string {
  return mode === 'auto' ? 'Automatic' : AVAILABILITY_MODES.find(m => m.id === mode)?.label.split(' (')[0] ?? mode;
}

export function toInventoryRow(part: HardwarePart, record: InventoryRecord, status: StockStatus, discontinued: boolean): InventoryRow {
  return {
    partId: part.id,
    componentName: part.name,
    category: part.category,
    stockQuantity: record.stockQuantity,
    reorderThreshold: record.reorderThreshold,
    availabilityStatus: status,
    availabilityRule: availabilityRuleLabel(record.availabilityMode),
    listing: discontinued ? 'Discontinued' : 'Listed'
  };
}
