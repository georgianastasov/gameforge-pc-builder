import { computed, inject, Injectable, signal } from '@angular/core';
import { analyseBuild } from '../models/hardware/build-analysis';
import { BuildPreset, BuildSelection } from '../models/hardware/build-preset';
import { AssemblyTier, calculatePricing, DEFAULT_ASSEMBLY_TIER } from '../models/hardware/build-pricing';
import { BuildSlot } from '../models/hardware/build-slot';
import { HARDWARE_CATEGORIES, HardwareCategory, HardwarePart } from '../models/hardware/hardware-part';
import { BuildStorageService } from './build-storage.service';
import { EliteFlagshipPCTrioService } from './elite-flagship-pctrio.service';
import { FlagshipPCHardwareCatalogService } from './flagship-pchardware-catalog.service';

const SLOT_IMAGES: Record<HardwareCategory, string> = {
  CPU: '/assets/hardware/cpu.svg',
  GPU: '/assets/hardware/gpu.svg',
  Motherboard: '/assets/hardware/motherboard.svg',
  RAM: '/assets/hardware/ram.svg',
  Storage: '/assets/hardware/storage.svg',
  Cooling: '/assets/hardware/cooling.svg',
  PSU: '/assets/hardware/psu.svg',
  Case: '/assets/hardware/case.svg'
};

function emptySelection(): BuildSelection {
  return { CPU: null, GPU: null, Motherboard: null, RAM: null, Storage: null, Cooling: null, PSU: null, Case: null };
}

function toSlot(category: HardwareCategory, part: HardwarePart | null): BuildSlot {
  return {
    category,
    part,
    selectedComponentName: part?.name ?? 'No part selected',
    specsDetail: part?.specsDetail ?? `Choose a ${category} from the component catalog to fill this slot.`,
    wattage: part?.tdpWattage ?? 0,
    price: part?.price ?? 0,
    imageUrl: part?.imageUrl ?? SLOT_IMAGES[category]
  };
}

/** Shared, signal-based state for the rig being configured. */
@Injectable({
  providedIn: 'root'
})
export class BuildStateService {
  private readonly catalog = inject(FlagshipPCHardwareCatalogService);
  private readonly presetService = inject(EliteFlagshipPCTrioService);
  private readonly storage = inject(BuildStorageService);

  private readonly selection = signal<BuildSelection>(emptySelection());
  private readonly loadedPresetId = signal<string | null>(null);

  public readonly totalSlotCount = HARDWARE_CATEGORIES.length;

  /** Part ids per slot, e.g. for order snapshots. */
  public readonly currentSelection = this.selection.asReadonly();

  /** The selected part for each slot (`null` when empty). */
  public readonly selectedParts = computed<Record<HardwareCategory, HardwarePart | null>>(() => {
    const selection = this.selection();
    return Object.fromEntries(
      HARDWARE_CATEGORIES.map(category => [category, this.catalog.getPartById(selection[category])])
    ) as Record<HardwareCategory, HardwarePart | null>;
  });

  /** All eight slots in assembly order, shaped for the slot cards. */
  public readonly slots = computed<BuildSlot[]>(() => {
    const parts = this.selectedParts();
    return HARDWARE_CATEGORIES.map(category => toSlot(category, parts[category]));
  });

  public readonly filledSlotCount = computed(() => this.slots().filter(slot => slot.part).length);

  public readonly isComplete = computed(() => this.filledSlotCount() === this.totalSlotCount);

  public readonly subtotal = computed(() => this.slots().reduce((sum, slot) => sum + slot.price, 0));

  /** Assembly & testing options chosen in PC Builder; they are priced into `pricing`. */
  public readonly assemblyTier = signal<AssemblyTier>(DEFAULT_ASSEMBLY_TIER);
  public readonly precisionTuning = signal(false);

  /** Live power budget and compatibility report for the current selection. */
  public readonly analysis = computed(() => analyseBuild(this.selectedParts()));

  public readonly pricing = computed(() => calculatePricing(this.subtotal(), this.assemblyTier(), this.precisionTuning()));

  /** The preset last loaded, or `null` once the build has been changed. */
  public readonly activePreset = computed<BuildPreset | null>(() => {
    const id = this.loadedPresetId();
    return id ? this.presetService.getPresetById(id) : null;
  });

  constructor() {
    // Restore the saved configuration; otherwise start from the first featured preset.
    const saved = this.storage.load();
    if (saved) {
      this.selection.set(saved.selection);
      this.loadedPresetId.set(saved.presetId);
      this.assemblyTier.set(saved.assemblyTier);
      this.precisionTuning.set(saved.precisionTuning);
      return;
    }
    const [defaultPreset] = this.presetService.presets;
    if (defaultPreset) {
      this.loadPreset(defaultPreset.id);
    }
  }

  /** Persists the current build and options so they are restored after a reload. */
  public saveConfiguration(): boolean {
    return this.storage.save({
      selection: this.selection(),
      presetId: this.loadedPresetId(),
      assemblyTier: this.assemblyTier(),
      precisionTuning: this.precisionTuning(),
      savedAt: Date.now()
    });
  }

  /** Clears every slot and option and forgets the saved configuration. */
  public startNewBuild(): void {
    this.clearAll();
    this.resetOptions();
    this.storage.clear();
  }

  public resetOptions(): void {
    this.assemblyTier.set(DEFAULT_ASSEMBLY_TIER);
    this.precisionTuning.set(false);
  }

  public loadPreset(presetId: string): void {
    const preset = this.presetService.getPresetById(presetId);
    if (!preset) {
      return;
    }
    this.selection.set({ ...preset.parts });
    this.loadedPresetId.set(preset.id);
  }

  /** Puts a part into its category's slot, replacing whatever was there. */
  public selectPart(part: HardwarePart): void {
    this.selection.update(selection => ({ ...selection, [part.category]: part.id }));
    this.loadedPresetId.set(null);
  }

  public clearSlot(category: HardwareCategory): void {
    this.selection.update(selection => ({ ...selection, [category]: null }));
    this.loadedPresetId.set(null);
  }

  public clearAll(): void {
    this.selection.set(emptySelection());
    this.loadedPresetId.set(null);
  }

  public isSelected(part: HardwarePart): boolean {
    return this.selection()[part.category] === part.id;
  }
}
