import { TestBed } from '@angular/core/testing';
import { BuildStateService } from './build-state.service';
import { EliteFlagshipPCTrioService } from './elite-flagship-pctrio.service';
import { FlagshipPCHardwareCatalogService } from './flagship-pchardware-catalog.service';

describe('BuildStateService', () => {
  let service: BuildStateService;
  let catalog: FlagshipPCHardwareCatalogService;
  let presets: EliteFlagshipPCTrioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BuildStateService);
    catalog = TestBed.inject(FlagshipPCHardwareCatalogService);
    presets = TestBed.inject(EliteFlagshipPCTrioService);
  });

  it('starts with the first featured preset fully loaded', () => {
    const [first] = presets.presets;
    expect(service.filledSlotCount()).toBe(8);
    expect(service.activePreset()?.id).toBe(first.id);
    expect(service.subtotal()).toBe(first.price);
  });

  it('every preset references valid parts in the matching slot', () => {
    for (const preset of presets.presets) {
      for (const [category, partId] of Object.entries(preset.parts)) {
        expect(catalog.getPartById(partId)?.category).toBe(category);
      }
    }
  });

  it('loads a preset and recomputes the subtotal', () => {
    const raptor = presets.getPresetById('raptor')!;
    service.loadPreset(raptor.id);
    expect(service.selectedParts().CPU?.id).toBe('cpu-core-i7-14700k');
    expect(service.subtotal()).toBe(raptor.price);
  });

  it('replaces the part in a slot and drops the preset link', () => {
    const gpu = catalog.getPartById('gpu-rx-9070xt-nitro')!;
    const before = service.subtotal();
    const replaced = service.selectedParts().GPU!;
    service.selectPart(gpu);
    expect(service.selectedParts().GPU).toBe(gpu);
    expect(service.subtotal()).toBe(before - replaced.price + gpu.price);
    expect(service.activePreset()).toBeNull();
  });

  it('clears slots and updates the filled count', () => {
    service.clearSlot('Case');
    expect(service.filledSlotCount()).toBe(7);
    expect(service.isComplete()).toBe(false);
    service.clearAll();
    expect(service.filledSlotCount()).toBe(0);
    expect(service.subtotal()).toBe(0);
  });
});
