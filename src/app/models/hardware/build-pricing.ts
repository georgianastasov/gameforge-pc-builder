/**
 * Assembly & testing tiers offered in PC Builder. Ids match the existing
 * select item values. Fees follow the App Builder copy: assembly is
 * complimentary and the 48-hour thermal stress test is $49 (Build Summary).
 */
export const ASSEMBLY_TIERS = [
  { id: 'Standard Validation', fee: 0 },
  { id: 'Precision Stress-Testing', fee: 49 },
  { id: 'Extreme Benchmarking & Burn-in', fee: 149 }
] as const;

export type AssemblyTier = (typeof ASSEMBLY_TIERS)[number]['id'];

export const DEFAULT_ASSEMBLY_TIER: AssemblyTier = 'Standard Validation';

/** Bespoke thermal repasting and fan-curve calibration. */
export const PRECISION_THERMAL_TUNING_FEE = 79;

export interface BuildPricing {
  subtotal: number;
  assemblyFee: number;
  thermalTuningFee: number;
  total: number;
}

export function isAssemblyTier(value: unknown): value is AssemblyTier {
  return ASSEMBLY_TIERS.some(tier => tier.id === value);
}

export function calculatePricing(subtotal: number, tier: AssemblyTier, precisionTuning: boolean): BuildPricing {
  const assemblyFee = ASSEMBLY_TIERS.find(t => t.id === tier)?.fee ?? 0;
  const thermalTuningFee = precisionTuning ? PRECISION_THERMAL_TUNING_FEE : 0;
  return { subtotal, assemblyFee, thermalTuningFee, total: subtotal + assemblyFee + thermalTuningFee };
}
