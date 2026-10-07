import { Injectable } from '@angular/core';
import { HardwareCategory, HardwarePart } from '../models/hardware/hardware-part';
import { FlagshipPCHardwareCatalog } from '../static-data/flagship-pchardware-catalog';

/** Single source of hardware data for every page. */
@Injectable({
  providedIn: 'root'
})
export class FlagshipPCHardwareCatalogService {
  public readonly parts: readonly HardwarePart[] = FlagshipPCHardwareCatalog;

  private readonly partsById = new Map(this.parts.map(part => [part.id, part]));

  public getPartById(id: string | null): HardwarePart | null {
    return id ? this.partsById.get(id) ?? null : null;
  }

  public getPartsByCategory(category: HardwareCategory): HardwarePart[] {
    return this.parts.filter(part => part.category === category);
  }
}
