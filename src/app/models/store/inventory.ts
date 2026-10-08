/** Customer-facing availability of a part. */
export type StockStatus = 'In Stock' | 'Low Stock' | 'Backordered' | 'Out of Stock';

/**
 * How availability is decided. `auto` follows stock levels; `backorder` keeps a
 * part orderable once it runs out; `hold` stops sales regardless of stock.
 */
export const AVAILABILITY_MODES = [
  { id: 'auto', label: 'In Stock / Low Stock (from stock levels)' },
  { id: 'backorder', label: 'Backordered (accept orders when sold out)' },
  { id: 'hold', label: 'Out of Stock (hold sales)' }
] as const;

export type AvailabilityMode = (typeof AVAILABILITY_MODES)[number]['id'];

export interface InventoryRecord {
  partId: string;
  stockQuantity: number;
  reorderThreshold: number;
  availabilityMode: AvailabilityMode;
}

export const DEFAULT_REORDER_THRESHOLD = 5;

export const STOCK_BADGE_TYPE: Record<StockStatus, 'success' | 'warning' | 'info' | 'error'> = {
  'In Stock': 'success',
  'Low Stock': 'warning',
  'Backordered': 'info',
  'Out of Stock': 'error'
};

export function isAvailabilityMode(value: unknown): value is AvailabilityMode {
  return AVAILABILITY_MODES.some(mode => mode.id === value);
}

export function stockStatus({ stockQuantity, reorderThreshold, availabilityMode }: InventoryRecord): StockStatus {
  if (availabilityMode === 'hold') {
    return 'Out of Stock';
  }
  if (stockQuantity <= 0) {
    return availabilityMode === 'backorder' ? 'Backordered' : 'Out of Stock';
  }
  return stockQuantity <= reorderThreshold ? 'Low Stock' : 'In Stock';
}

export function isOrderable(status: StockStatus): boolean {
  return status !== 'Out of Stock';
}

/** At or below the reorder threshold, including sold-out parts. */
export function needsReorder({ stockQuantity, reorderThreshold }: InventoryRecord): boolean {
  return stockQuantity <= reorderThreshold;
}
