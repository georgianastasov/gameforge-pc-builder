import { computed, inject, Injectable } from '@angular/core';
import { BuildPreset } from '../models/hardware/build-preset';
import { HARDWARE_CATEGORIES } from '../models/hardware/hardware-part';
import { EliteFlagshipPCTrio } from '../static-data/elite-flagship-pctrio';
import { FlagshipPCHardwareCatalogService } from './flagship-pchardware-catalog.service';

/** Featured GameForge build presets, priced live from the shared catalog. */
@Injectable({
  providedIn: 'root'
})
export class EliteFlagshipPCTrioService {
  private readonly catalog = inject(FlagshipPCHardwareCatalogService);

  public readonly presets = computed<readonly BuildPreset[]>(() => EliteFlagshipPCTrio.map(preset => ({
    ...preset,
    price: HARDWARE_CATEGORIES.reduce((sum, category) => sum + (this.catalog.getPartById(preset.parts[category])?.price ?? 0), 0)
  })));

  public getPresetById(id: string): BuildPreset | null {
    return this.presets().find(preset => preset.id === id) ?? null;
  }
}
