import { calculatePricing, isAssemblyTier, PRECISION_THERMAL_TUNING_FEE } from './build-pricing';

describe('calculatePricing', () => {
  it('includes standard validation at no cost', () => {
    expect(calculatePricing(1000, 'Standard Validation', false)).toEqual({ subtotal: 1000, assemblyFee: 0, thermalTuningFee: 0, total: 1000 });
  });

  it('adds the assembly tier and thermal tuning fees', () => {
    const pricing = calculatePricing(1000, 'Precision Stress-Testing', true);
    expect(pricing.assemblyFee).toBe(49);
    expect(pricing.thermalTuningFee).toBe(PRECISION_THERMAL_TUNING_FEE);
    expect(pricing.total).toBe(1000 + 49 + PRECISION_THERMAL_TUNING_FEE);
    expect(calculatePricing(1000, 'Extreme Benchmarking & Burn-in', false).total).toBe(1149);
  });

  it('recognises only known tiers', () => {
    expect(isAssemblyTier('Precision Stress-Testing')).toBe(true);
    expect(isAssemblyTier('Overnight Express')).toBe(false);
    expect(isAssemblyTier(undefined)).toBe(false);
  });
});
