import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { BoardFormFactor, CpuSocket, HardwareCategory, PerformanceTier } from '../models/hardware/hardware-part';
import { BOARD_FORM_FACTORS, CoolerType, CPU_SOCKETS, GPU_INTERFACES, PartDraft, PsuEfficiency, SPEC_FIELDS, specFieldsFor, STORAGE_INTERFACES } from '../models/hardware/part-draft';

export const RADIATOR_SIZES = [120, 240, 280, 360, 420] as const;

const text = (maxLength: number, required = true) =>
  new FormControl('', { nonNullable: true, validators: required ? [Validators.required, Validators.maxLength(maxLength), Validators.pattern(/\S/)] : [Validators.maxLength(maxLength)] });

const amount = (value: number | null, min: number, max: number, wholeNumber = true) =>
  new FormControl<number | null>(value, [Validators.required, Validators.min(min), Validators.max(max), ...(wholeNumber ? [Validators.pattern(/^\d+$/)] : [])]);

/** At least one checkbox in a group must be ticked. */
export function atLeastOneChecked(group: AbstractControl): ValidationErrors | null {
  return Object.values((group as FormGroup).controls).some(control => control.value === true) ? null : { required: true };
}

const checkboxGroup = <K extends string>(keys: readonly K[], checked: readonly K[]) =>
  new FormGroup(Object.fromEntries(keys.map(key => [key, new FormControl(checked.includes(key), { nonNullable: true })])) as Record<K, FormControl<boolean>>, atLeastOneChecked);

/** The Add Component form: common catalog fields plus every category-specific specification. */
export function createPartForm() {
  return new FormGroup({
    name: text(80),
    brand: text(40),
    category: new FormControl<HardwareCategory>('CPU', { nonNullable: true, validators: Validators.required }),
    performanceTier: new FormControl<PerformanceTier>('Enthusiast', { nonNullable: true, validators: Validators.required }),
    price: amount(null, 1, 20000, false),
    initialStock: amount(10, 0, 9999),
    benchmarkScore: amount(null, 0, 1000000),
    specsDetail: text(160),
    compatibilityNote: text(120, false),
    tdpWattage: amount(null, 0, 1000),
    socket: new FormControl<CpuSocket>('AM5', { nonNullable: true }),
    formFactor: new FormControl<BoardFormFactor>('ATX', { nonNullable: true }),
    interfaceType: new FormControl<string>(GPU_INTERFACES[0], { nonNullable: true, validators: Validators.required }),
    lengthMm: amount(null, 100, 500),
    coolerType: new FormControl<CoolerType>('aio', { nonNullable: true }),
    heightMm: amount(null, 30, 200),
    radiatorMm: new FormControl<number>(360, { nonNullable: true, validators: Validators.required }),
    coolingCapacityW: amount(null, 50, 500),
    supportedSockets: checkboxGroup(CPU_SOCKETS, CPU_SOCKETS),
    wattageCapacity: amount(null, 300, 2000),
    efficiency: new FormControl<PsuEfficiency>('Gold', { nonNullable: true }),
    supportedFormFactors: checkboxGroup(BOARD_FORM_FACTORS, ['ATX', 'Micro-ATX', 'Mini-ITX']),
    maxGpuLengthMm: amount(null, 150, 600),
    maxCoolerHeightMm: amount(null, 30, 250),
    maxRadiatorMm: new FormControl<number>(360, { nonNullable: true, validators: Validators.required })
  });
}

export type PartForm = ReturnType<typeof createPartForm>;

/** Interface options offered for the current category. */
export function interfaceOptionsFor(category: HardwareCategory): readonly string[] {
  return category === 'Storage' ? STORAGE_INTERFACES : category === 'GPU' ? GPU_INTERFACES : [];
}

/**
 * Enables only the specification controls that apply to the chosen category
 * (and cooler type), so hidden fields are neither shown nor validated.
 */
export function applyCategoryFields(form: PartForm): void {
  const { category, coolerType, interfaceType } = form.getRawValue();
  const active = new Set(specFieldsFor(category, coolerType));
  for (const field of SPEC_FIELDS) {
    const control = form.controls[field];
    if (active.has(field)) {
      control.enable({ emitEvent: false });
    } else {
      control.disable({ emitEvent: false });
    }
  }
  const interfaces = interfaceOptionsFor(category);
  if (interfaces.length && !interfaces.includes(interfaceType)) {
    form.controls.interfaceType.setValue(interfaces[0], { emitEvent: false });
  }
}

const checkedKeys = <K extends string>(group: Record<K, boolean>) => (Object.keys(group) as K[]).filter(key => group[key]);

/** Reads a valid form into a draft for `buildHardwarePart`. */
export function readPartDraft(form: PartForm): PartDraft {
  const value = form.getRawValue();
  return {
    name: value.name,
    brand: value.brand,
    category: value.category,
    performanceTier: value.performanceTier,
    price: value.price ?? 0,
    tdpWattage: value.tdpWattage ?? 0,
    benchmarkScore: value.benchmarkScore ?? 0,
    specsDetail: value.specsDetail,
    compatibilityNote: value.compatibilityNote,
    socket: value.socket,
    formFactor: value.formFactor,
    interfaceType: value.interfaceType,
    lengthMm: value.lengthMm ?? 0,
    coolerType: value.coolerType,
    heightMm: value.heightMm ?? 0,
    radiatorMm: value.radiatorMm,
    coolingCapacityW: value.coolingCapacityW ?? 0,
    supportedSockets: checkedKeys(value.supportedSockets),
    wattageCapacity: value.wattageCapacity ?? 0,
    efficiency: value.efficiency,
    supportedFormFactors: checkedKeys(value.supportedFormFactors),
    maxGpuLengthMm: value.maxGpuLengthMm ?? 0,
    maxCoolerHeightMm: value.maxCoolerHeightMm ?? 0,
    maxRadiatorMm: value.maxRadiatorMm
  };
}

