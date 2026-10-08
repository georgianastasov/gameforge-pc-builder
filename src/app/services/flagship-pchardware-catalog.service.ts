import { computed, Injectable, signal } from '@angular/core';
import { HARDWARE_CATEGORIES, HardwareCategory, HardwarePart } from '../models/hardware/hardware-part';
import { FlagshipPCHardwareCatalog } from '../static-data/flagship-pchardware-catalog';
import { readVersioned, writeVersioned } from './versioned-storage';

/** Admin changes layered over the seeded catalog. */
interface CatalogChanges {
  /** Parts added from the Admin Backoffice. */
  added: HardwarePart[];
  /** Price overrides by part id. */
  prices: Record<string, number>;
  /** Parts withdrawn from sale. They still resolve by id so presets, saved builds and orders keep working. */
  discontinued: string[];
}

const STORAGE_KEY = 'gameforge.catalog';
const STORAGE_VERSION = 1;

const NO_CHANGES: CatalogChanges = { added: [], prices: {}, discontinued: [] };

/** Single source of hardware data for every page, including admin catalog changes. */
@Injectable({
  providedIn: 'root'
})
export class FlagshipPCHardwareCatalogService {
  private readonly changes = signal<CatalogChanges>(loadChanges());

  /** Every part, including discontinued ones, with admin prices applied. */
  public readonly allParts = computed<readonly HardwarePart[]>(() => {
    const { added, prices } = this.changes();
    return [...FlagshipPCHardwareCatalog, ...added].map(part => Object.hasOwn(prices, part.id) ? { ...part, price: prices[part.id] } : part);
  });

  private readonly discontinuedIds = computed(() => new Set(this.changes().discontinued));

  /** Parts customers can browse and select. */
  public readonly parts = computed<readonly HardwarePart[]>(() => this.allParts().filter(part => !this.discontinuedIds().has(part.id)));

  private readonly partsById = computed(() => new Map(this.allParts().map(part => [part.id, part])));

  /** Resolves any part, discontinued or not, so existing builds and orders stay intact. */
  public getPartById(id: string | null): HardwarePart | null {
    return id ? this.partsById().get(id) ?? null : null;
  }

  public getPartsByCategory(category: HardwareCategory): HardwarePart[] {
    return this.parts().filter(part => part.category === category);
  }

  public isDiscontinued(id: string): boolean {
    return this.discontinuedIds().has(id);
  }

  public hasPart(id: string): boolean {
    return this.partsById().has(id);
  }

  public addPart(part: HardwarePart): void {
    if (this.hasPart(part.id)) {
      throw new Error(`A part with id "${part.id}" already exists.`);
    }
    this.update(changes => ({ ...changes, added: [...changes.added, part] }));
  }

  public updatePrice(id: string, price: number): void {
    if (!this.hasPart(id) || !(price > 0)) {
      return;
    }
    this.update(changes => ({ ...changes, prices: { ...changes.prices, [id]: price } }));
  }

  /** Withdraws a part from sale (or relists it). Nothing is deleted. */
  public setDiscontinued(id: string, discontinued: boolean): void {
    if (!this.hasPart(id) || this.isDiscontinued(id) === discontinued) {
      return;
    }
    this.update(changes => ({
      ...changes,
      discontinued: discontinued ? [...changes.discontinued, id] : changes.discontinued.filter(partId => partId !== id)
    }));
  }

  /** Re-reads changes saved by another tab. */
  public reload(): void {
    this.changes.set(loadChanges());
  }

  private update(change: (changes: CatalogChanges) => CatalogChanges): void {
    this.changes.update(change);
    writeVersioned(STORAGE_KEY, STORAGE_VERSION, this.changes());
  }
}

function loadChanges(): CatalogChanges {
  const stored = readVersioned(STORAGE_KEY, STORAGE_VERSION);
  if (!stored) {
    return NO_CHANGES;
  }
  const seededIds = new Set(FlagshipPCHardwareCatalog.map(part => part.id));
  const added = (Array.isArray(stored['added']) ? stored['added'] : [])
    .filter(isHardwarePart)
    .filter(part => !seededIds.has(part.id));
  const knownIds = new Set([...seededIds, ...added.map(part => part.id)]);
  const storedPrices = stored['prices'] && typeof stored['prices'] === 'object' ? stored['prices'] as Record<string, unknown> : {};
  const prices = Object.fromEntries(Object.entries(storedPrices)
    .filter((entry): entry is [string, number] => knownIds.has(entry[0]) && typeof entry[1] === 'number' && entry[1] > 0));
  const discontinued = (Array.isArray(stored['discontinued']) ? stored['discontinued'] : [])
    .filter((id): id is string => typeof id === 'string' && knownIds.has(id));
  return { added, prices, discontinued };
}

/** Shape check for parts restored from storage. */
function isHardwarePart(value: unknown): value is HardwarePart {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const part = value as Record<string, unknown>;
  return ['id', 'name', 'brand', 'imageUrl', 'performanceTier', 'socketOrFormFactor', 'benchmarkSuite', 'specsDetail', 'compatibilityNote']
    .every(key => typeof part[key] === 'string')
    && ['tdpWattage', 'benchmarkScore', 'price'].every(key => typeof part[key] === 'number')
    && HARDWARE_CATEGORIES.includes(part['category'] as HardwareCategory);
}
