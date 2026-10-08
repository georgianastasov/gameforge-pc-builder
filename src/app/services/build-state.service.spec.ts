import { TestBed } from '@angular/core/testing';
import { BuildStateService } from './build-state.service';
import { EliteFlagshipPCTrioService } from './elite-flagship-pctrio.service';
import { FlagshipPCHardwareCatalogService } from './flagship-pchardware-catalog.service';
import { InventoryService } from './inventory.service';

describe('BuildStateService', () => {
  afterEach(() => localStorage.clear());

  let service: BuildStateService;
  let catalog: FlagshipPCHardwareCatalogService;
  let presets: EliteFlagshipPCTrioService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(BuildStateService);
    catalog = TestBed.inject(FlagshipPCHardwareCatalogService);
    presets = TestBed.inject(EliteFlagshipPCTrioService);
  });

  it('starts with the first featured preset fully loaded', () => {
    const [first] = presets.presets();
    expect(service.filledSlotCount()).toBe(8);
    expect(service.activePreset()?.id).toBe(first.id);
    expect(service.subtotal()).toBe(first.price);
  });

  it('every preset references valid parts in the matching slot', () => {
    for (const preset of presets.presets()) {
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

  it('prices the assembly options into the build total', () => {
    const subtotal = service.subtotal();
    service.assemblyTier.set('Extreme Benchmarking & Burn-in');
    service.precisionTuning.set(true);
    expect(service.pricing().total).toBe(subtotal + 149 + 79);
    service.resetOptions();
    expect(service.pricing().total).toBe(subtotal);
  });

  it('exposes a live compatibility analysis', () => {
    expect(service.analysis().health).toBe('pass');
    service.selectPart(catalog.getPartById('cpu-core-i7-14700k')!);
    expect(service.analysis().issues.map(issue => issue.id)).toContain('cpu-socket');
  });

  it('restores the saved build and options in a fresh service', () => {
    service.loadPreset('raptor');
    service.selectPart(catalog.getPartById('gpu-rtx-5080-fe')!);
    service.assemblyTier.set('Precision Stress-Testing');
    service.precisionTuning.set(true);
    expect(service.saveConfiguration()).toBe(true);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const restored = TestBed.inject(BuildStateService);
    expect(restored.selectedParts().CPU?.id).toBe('cpu-core-i7-14700k');
    expect(restored.selectedParts().GPU?.id).toBe('gpu-rtx-5080-fe');
    expect(restored.assemblyTier()).toBe('Precision Stress-Testing');
    expect(restored.precisionTuning()).toBe(true);
    expect(restored.pricing().total).toBe(service.pricing().total);
  });

  it('ignores corrupt or stale saved data', () => {
    localStorage.setItem('gameforge.savedBuild', '{not json');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    expect(TestBed.inject(BuildStateService).activePreset()?.id).toBe(presets.presets()[0].id);

    localStorage.setItem('gameforge.savedBuild', JSON.stringify({ version: 1, selection: { CPU: 'retired-part', GPU: 'cpu-ryzen7-9800x3d' } }));
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    expect(TestBed.inject(BuildStateService).filledSlotCount()).toBe(8);
  });

  it('starts a new build: empty slots, default options and no saved configuration', () => {
    service.precisionTuning.set(true);
    service.saveConfiguration();
    service.startNewBuild();
    expect(service.filledSlotCount()).toBe(0);
    expect(service.precisionTuning()).toBe(false);
    expect(service.analysis().isComplete).toBe(false);
    expect(localStorage.getItem('gameforge.savedBuild')).toBeNull();
  });
  it('reprices the build and presets when an admin changes a part price', () => {
    const cpu = service.selectedParts().CPU!;
    const before = service.subtotal();
    const presetBefore = presets.getPresetById('apex-titan')!.price;
    catalog.updatePrice(cpu.id, cpu.price + 100);
    expect(service.subtotal()).toBe(before + 100);
    expect(presets.getPresetById('apex-titan')!.price).toBe(presetBefore + 100);
  });

  it('keeps discontinued parts in the build but flags them as unavailable', () => {
    const gpu = service.selectedParts().GPU!;
    expect(service.unavailableParts()).toEqual([]);
    catalog.setDiscontinued(gpu.id, true);
    expect(service.selectedParts().GPU?.id).toBe(gpu.id);
    expect(service.unavailableParts()).toEqual([{ part: gpu, reason: 'Discontinued' }]);
  });

  it('flags parts that are out of stock', () => {
    const psu = service.selectedParts().PSU!;
    TestBed.inject(InventoryService).update(psu.id, { availabilityMode: 'hold' });
    expect(service.unavailableParts().map(({ part, reason }) => [part.id, reason])).toEqual([[psu.id, 'Out of Stock']]);
  });

  it('restores a saved build that contains a discontinued part', () => {
    service.loadPreset('raptor');
    service.saveConfiguration();
    catalog.setDiscontinued('cpu-core-i7-14700k', true);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const restored = TestBed.inject(BuildStateService);
    expect(restored.selectedParts().CPU?.id).toBe('cpu-core-i7-14700k');
    expect(restored.unavailableParts()[0].reason).toBe('Discontinued');
  });
});
