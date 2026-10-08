import { TestBed } from '@angular/core/testing';
import { HARDWARE_CATEGORIES } from '../models/hardware/hardware-part';
import { EliteFlagshipPCTrioService } from './elite-flagship-pctrio.service';
import { FlagshipPCHardwareCatalogService } from './flagship-pchardware-catalog.service';

describe('EliteFlagshipPCTrioService', () => {
  let service: EliteFlagshipPCTrioService;
  let catalog: FlagshipPCHardwareCatalogService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(EliteFlagshipPCTrioService);
    catalog = TestBed.inject(FlagshipPCHardwareCatalogService);
  });

  afterEach(() => localStorage.clear());

  it('prices each preset as the sum of its parts', () => {
    for (const preset of service.presets()) {
      const expected = HARDWARE_CATEGORIES.reduce((sum, category) => sum + (catalog.getPartById(preset.parts[category])?.price ?? 0), 0);
      expect(preset.price).toBe(expected);
    }
  });

  it('keeps a preset intact when one of its parts is discontinued', () => {
    catalog.setDiscontinued('gpu-rtx-5090-fe', true);
    const titan = service.getPresetById('apex-titan')!;
    expect(titan.parts.GPU).toBe('gpu-rtx-5090-fe');
    expect(titan.price).toBeGreaterThan(0);
  });
});
