import { computed, inject, Injectable, signal } from '@angular/core';
import { DEFAULT_REORDER_THRESHOLD, InventoryRecord, isAvailabilityMode, isOrderable, StockStatus, stockStatus } from '../models/store/inventory';
import { StoreInventory } from '../static-data/store-inventory';
import { FlagshipPCHardwareCatalogService } from './flagship-pchardware-catalog.service';
import { readVersioned, writeVersioned } from './versioned-storage';

const STORAGE_KEY = 'gameforge.inventory';
const STORAGE_VERSION = 1;

export type InventoryUpdate = Partial<Omit<InventoryRecord, 'partId'>>;

/** Warehouse stock per catalog part; drives storefront availability. */
@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private readonly catalog = inject(FlagshipPCHardwareCatalogService);
  private readonly records = signal<Record<string, InventoryRecord>>(loadRecords());

  /** One record per catalog part, discontinued ones included. */
  public readonly inventory = computed<InventoryRecord[]>(() => {
    const records = this.records();
    return this.catalog.allParts().map(part => records[part.id] ?? emptyRecord(part.id));
  });

  private readonly statusById = computed(() => new Map(this.inventory().map(record => [record.partId, stockStatus(record)])));

  public record(partId: string): InventoryRecord {
    return this.records()[partId] ?? emptyRecord(partId);
  }

  /** Parts without a stock record (none were ever received) are out of stock. */
  public status(partId: string): StockStatus {
    return this.statusById().get(partId) ?? 'Out of Stock';
  }

  public isOrderable(partId: string): boolean {
    return isOrderable(this.status(partId));
  }

  public update(partId: string, change: InventoryUpdate): void {
    const current = this.record(partId);
    const next: InventoryRecord = {
      partId,
      stockQuantity: wholeUnits(change.stockQuantity ?? current.stockQuantity),
      reorderThreshold: wholeUnits(change.reorderThreshold ?? current.reorderThreshold),
      availabilityMode: change.availabilityMode ?? current.availabilityMode
    };
    this.save(records => ({ ...records, [partId]: next }));
  }

  /** Takes one unit of each ordered part from stock (never below zero; backorders ship later). */
  public allocate(partIds: readonly string[]): void {
    this.save(records => {
      const next = { ...records };
      for (const partId of partIds) {
        const current = next[partId] ?? emptyRecord(partId);
        next[partId] = { ...current, stockQuantity: Math.max(0, current.stockQuantity - 1) };
      }
      return next;
    });
  }

  /** Re-reads stock saved by another tab. */
  public reload(): void {
    this.records.set(loadRecords());
  }

  private save(change: (records: Record<string, InventoryRecord>) => Record<string, InventoryRecord>): void {
    this.records.update(change);
    writeVersioned(STORAGE_KEY, STORAGE_VERSION, { records: this.records() });
  }
}

const wholeUnits = (value: number) => Math.max(0, Math.round(Number.isFinite(value) ? value : 0));

function emptyRecord(partId: string): InventoryRecord {
  return { partId, stockQuantity: 0, reorderThreshold: DEFAULT_REORDER_THRESHOLD, availabilityMode: 'auto' };
}

function seedRecords(): Record<string, InventoryRecord> {
  return Object.fromEntries(Object.entries(StoreInventory).map(([partId, [stockQuantity, reorderThreshold]]) =>
    [partId, { partId, stockQuantity, reorderThreshold, availabilityMode: 'auto' } satisfies InventoryRecord]));
}

/** Saved stock, falling back to the seed for anything missing or malformed. */
function loadRecords(): Record<string, InventoryRecord> {
  const records = seedRecords();
  const stored = readVersioned(STORAGE_KEY, STORAGE_VERSION)?.['records'];
  if (!stored || typeof stored !== 'object') {
    return records;
  }
  for (const [partId, value] of Object.entries(stored as Record<string, unknown>)) {
    const record = value as Partial<InventoryRecord> | null;
    if (record && typeof record.stockQuantity === 'number' && typeof record.reorderThreshold === 'number' && isAvailabilityMode(record.availabilityMode)) {
      records[partId] = { partId, stockQuantity: wholeUnits(record.stockQuantity), reorderThreshold: wholeUnits(record.reorderThreshold), availabilityMode: record.availabilityMode };
    }
  }
  return records;
}
