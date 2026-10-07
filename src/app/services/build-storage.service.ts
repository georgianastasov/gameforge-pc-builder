import { inject, Injectable } from '@angular/core';
import { BuildSelection } from '../models/hardware/build-preset';
import { AssemblyTier, isAssemblyTier } from '../models/hardware/build-pricing';
import { HARDWARE_CATEGORIES } from '../models/hardware/hardware-part';
import { FlagshipPCHardwareCatalogService } from './flagship-pchardware-catalog.service';

export interface SavedBuild {
  selection: BuildSelection;
  presetId: string | null;
  assemblyTier: AssemblyTier;
  precisionTuning: boolean;
  savedAt: number;
}

const STORAGE_KEY = 'gameforge.savedBuild';
const STORAGE_VERSION = 1;

/** Persists the saved configuration in localStorage so it survives reloads. */
@Injectable({
  providedIn: 'root'
})
export class BuildStorageService {
  private readonly catalog = inject(FlagshipPCHardwareCatalogService);

  public save(build: SavedBuild): boolean {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, ...build }));
      return true;
    } catch {
      // Storage can be unavailable (private mode, quota, blocked site data).
      return false;
    }
  }

  /** Returns the saved build, or `null` when there is none or it can't be trusted. */
  public load(): SavedBuild | null {
    let raw: unknown;
    try {
      const json = localStorage.getItem(STORAGE_KEY);
      raw = json ? JSON.parse(json) : null;
    } catch {
      return null;
    }
    return this.validate(raw);
  }

  public clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing to clear when storage is unavailable.
    }
  }

  private validate(raw: unknown): SavedBuild | null {
    if (!raw || typeof raw !== 'object') {
      return null;
    }
    const data = raw as Record<string, unknown>;
    const stored = data['selection'];
    if (data['version'] !== STORAGE_VERSION || !stored || typeof stored !== 'object') {
      return null;
    }
    // Keep only ids that still exist in the catalog and belong to their slot.
    const selection = Object.fromEntries(HARDWARE_CATEGORIES.map(category => {
      const id = (stored as Record<string, unknown>)[category];
      const part = typeof id === 'string' ? this.catalog.getPartById(id) : null;
      return [category, part?.category === category ? part.id : null];
    })) as BuildSelection;
    if (Object.values(selection).every(id => id === null)) {
      return null;
    }
    return {
      selection,
      presetId: typeof data['presetId'] === 'string' ? data['presetId'] : null,
      assemblyTier: isAssemblyTier(data['assemblyTier']) ? data['assemblyTier'] : 'Standard Validation',
      precisionTuning: data['precisionTuning'] === true,
      savedAt: typeof data['savedAt'] === 'number' ? data['savedAt'] : 0
    };
  }
}
