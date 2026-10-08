import { FlagshipPCHardwareCatalog } from '../../static-data/flagship-pchardware-catalog';
import { analyseBuild, analysePower, SelectedParts } from './build-analysis';
import { HARDWARE_CATEGORIES, HardwarePart } from './hardware-part';
import { buildHardwarePart, createPartId, PartDraft, specFieldsFor } from './part-draft';

const draft = (overrides: Partial<PartDraft>): PartDraft => ({
  name: 'Test Part', brand: 'GameForge', category: 'CPU', performanceTier: 'Enthusiast', price: 499, tdpWattage: 120,
  benchmarkScore: 30000, specsDetail: 'Test specification', compatibilityNote: '', socket: 'AM5', formFactor: 'ATX',
  interfaceType: 'PCIe 5.0 x16', lengthMm: 300, coolerType: 'aio', heightMm: 160, radiatorMm: 360, coolingCapacityW: 280,
  supportedSockets: ['AM5', 'LGA1700'], wattageCapacity: 1000, efficiency: 'Gold', supportedFormFactors: ['ATX', 'Micro-ATX'],
  maxGpuLengthMm: 400, maxCoolerHeightMm: 165, maxRadiatorMm: 360,
  ...overrides
});

const seeded = (id: string) => FlagshipPCHardwareCatalog.find(part => part.id === id)!;

/** The Vanguard preset with one slot swapped. */
function vanguardWith(part: HardwarePart): SelectedParts {
  const parts: Record<string, HardwarePart> = {
    CPU: seeded('cpu-ryzen7-9800x3d'), GPU: seeded('gpu-rtx-5080-fe'), Motherboard: seeded('mb-mag-x870-tomahawk'), RAM: seeded('ram-vengeance-rgb-32'),
    Storage: seeded('ssd-samsung-990-pro-2tb'), Cooling: seeded('cool-noctua-nh-d15-g2'), PSU: seeded('psu-seasonic-vertex-gx1000'), Case: seeded('case-fractal-north')
  };
  return Object.fromEntries(HARDWARE_CATEGORIES.map(c => [c, c === part.category ? part : parts[c]])) as SelectedParts;
}

describe('part drafts', () => {
  it('asks only for the specifications each category is checked on', () => {
    expect(specFieldsFor('CPU')).toEqual(['tdpWattage', 'socket']);
    expect(specFieldsFor('PSU')).toEqual(['wattageCapacity', 'efficiency']);
    expect(specFieldsFor('Cooling', 'air')).toContain('heightMm');
    expect(specFieldsFor('Cooling', 'air')).not.toContain('radiatorMm');
    expect(specFieldsFor('Case')).toEqual(expect.arrayContaining(['supportedFormFactors', 'maxGpuLengthMm', 'maxCoolerHeightMm', 'maxRadiatorMm']));
  });

  it('creates unique slug ids', () => {
    const taken = new Set(['gpu-rtx-5070-ti']);
    expect(createPartId({ category: 'GPU', name: 'RTX 5070 Ti!' }, id => taken.has(id))).toBe('gpu-rtx-5070-ti-2');
    expect(createPartId({ category: 'Case', name: 'Lancool 217' }, () => false)).toBe('case-lancool-217');
  });

  it('builds a CPU with only CPU attributes', () => {
    const cpu = buildHardwarePart(draft({ category: 'CPU', socket: 'LGA1700' }), 'cpu-test');
    expect(cpu).toMatchObject({ socket: 'LGA1700', memoryType: 'DDR5', socketOrFormFactor: 'Intel LGA1700', imageUrl: '/assets/hardware/cpu.svg' });
    expect(cpu.lengthMm).toBeUndefined();
    expect(cpu.supportedSockets).toBeUndefined();
  });

  it('builds parts the compatibility checks evaluate like seeded ones', () => {
    const lga1700Cpu = buildHardwarePart(draft({ category: 'CPU', socket: 'LGA1700' }), 'cpu-test');
    expect(analyseBuild(vanguardWith(lga1700Cpu)).checks.find(c => c.id === 'cpu-socket')?.status).toBe('fail');

    const longGpu = buildHardwarePart(draft({ category: 'GPU', lengthMm: 360 }), 'gpu-test');
    expect(analyseBuild(vanguardWith(longGpu)).checks.find(c => c.id === 'gpu-clearance')?.status).toBe('fail');

    const tallCooler = buildHardwarePart(draft({ category: 'Cooling', coolerType: 'air', heightMm: 180 }), 'cool-test');
    expect(tallCooler.radiatorMm).toBeUndefined();
    expect(analyseBuild(vanguardWith(tallCooler)).checks.find(c => c.id === 'cooling-case')?.status).toBe('fail');

    const itxCase = buildHardwarePart(draft({ category: 'Case', supportedFormFactors: ['Mini-ITX'] }), 'case-test');
    expect(itxCase.socketOrFormFactor).toBe('Mid Tower / Mini-ITX');
    expect(analyseBuild(vanguardWith(itxCase)).checks.find(c => c.id === 'board-case')?.status).toBe('fail');

    const goodBoard = buildHardwarePart(draft({ category: 'Motherboard', socket: 'AM5', formFactor: 'ATX' }), 'mb-test');
    expect(analyseBuild(vanguardWith(goodBoard)).health).toBe('pass');
  });

  it('builds PSUs the power report can read', () => {
    const psu = buildHardwarePart(draft({ category: 'PSU', wattageCapacity: 750, efficiency: 'Platinum', specsDetail: 'Fully modular', tdpWattage: 99 }), 'psu-test');
    expect(psu).toMatchObject({ tdpWattage: 0, wattageCapacity: 750, socketOrFormFactor: 'ATX 3.1 / 750W', specsDetail: '750W, 80+ Platinum, Fully modular' });
    const power = analysePower(vanguardWith(psu));
    expect(power.capacityW).toBe(750);
    expect(power.efficiencyRating).toBe('Platinum');
  });
});
