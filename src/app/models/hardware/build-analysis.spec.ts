import { FlagshipPCHardwareCatalog } from '../../static-data/flagship-pchardware-catalog';
import { EliteFlagshipPCTrio } from '../../static-data/elite-flagship-pctrio';
import { analyseBuild, analysePower, CheckId, SelectedParts } from './build-analysis';
import { HARDWARE_CATEGORIES, HardwareCategory, HardwarePart } from './hardware-part';

const part = (id: string): HardwarePart => {
  const found = FlagshipPCHardwareCatalog.find(p => p.id === id);
  if (!found) {
    throw new Error(`Unknown part ${id}`);
  }
  return found;
};

const presetParts = (presetId: string): SelectedParts => {
  const preset = EliteFlagshipPCTrio.find(p => p.id === presetId)!;
  return Object.fromEntries(HARDWARE_CATEGORIES.map(c => [c, part(preset.parts[c])])) as SelectedParts;
};

const withPart = (parts: SelectedParts, id: string): SelectedParts => {
  const p = part(id);
  return { ...parts, [p.category]: p };
};

const statusOf = (parts: SelectedParts, id: CheckId) => analyseBuild(parts).checks.find(c => c.id === id)?.status;

describe('analyseBuild', () => {
  it('passes every check for each featured preset', () => {
    for (const preset of EliteFlagshipPCTrio) {
      const analysis = analyseBuild(presetParts(preset.id));
      expect(analysis.issues).toEqual([]);
      expect(analysis.health).toBe('pass');
      expect(analysis.isComplete).toBe(true);
    }
  });

  it('sums power and reports PSU utilisation and headroom', () => {
    const power = analysePower(presetParts('apex-titan'));
    expect(power.drawW).toBe(825);
    expect(power.capacityW).toBe(1200);
    expect(power.utilisationPct).toBe(69);
    expect(power.headroomW).toBe(375);
    expect(power.efficiencyRating).toBe('Platinum');
    expect(power.status).toBe('pass');
  });

  it('flags an overloaded PSU as a failure and a high load as a warning', () => {
    // Raptor (655W) with an RTX 5090 draws 900W on an 850W PSU.
    const overloaded = withPart(presetParts('raptor'), 'gpu-rtx-5090-fe');
    expect(analysePower(overloaded).status).toBe('fail');
    expect(statusOf(overloaded, 'psu-capacity')).toBe('fail');
    // Vanguard with an RTX 5090 draws 760W on 1000W: 76%, still optimal; on 850W it's 89%.
    const highLoad = withPart(withPart(presetParts('vanguard'), 'gpu-rtx-5090-fe'), 'psu-corsair-rm850x');
    expect(analysePower(highLoad).status).toBe('warning');
  });

  it('detects a CPU and motherboard socket mismatch', () => {
    const parts = withPart(presetParts('apex-titan'), 'cpu-core-i7-14700k');
    expect(statusOf(parts, 'cpu-socket')).toBe('fail');
    expect(analyseBuild(parts).health).toBe('fail');
  });

  it('detects an air cooler that is too tall for the case', () => {
    const parts = withPart(presetParts('raptor'), 'cool-noctua-nh-d15-g2');
    expect(statusOf(parts, 'cooling-case')).toBe('fail');
    // The 253W i7 also exceeds the NH-D15 G2 rating.
    expect(statusOf(parts, 'cooler-cpu')).toBe('warning');
  });

  it('checks GPU length against the case bay', () => {
    const tooLong = { ...presetParts('vanguard'), GPU: { ...part('gpu-rtx-5080-fe'), lengthMm: 360 } };
    expect(statusOf(tooLong, 'gpu-clearance')).toBe('fail');
    const tight = { ...presetParts('vanguard'), GPU: { ...part('gpu-rtx-5080-fe'), lengthMm: 345 } };
    expect(statusOf(tight, 'gpu-clearance')).toBe('warning');
  });

  it('checks RAM type and board form factor', () => {
    const parts = presetParts('vanguard');
    const ddr4 = { ...parts, RAM: { ...parts.RAM!, memoryType: 'DDR4' as never } };
    expect(statusOf(ddr4, 'ram-board')).toBe('fail');
    const itxCase = { ...parts, Case: { ...parts.Case!, supportedFormFactors: ['Mini-ITX' as const] } };
    expect(statusOf(itxCase, 'board-case')).toBe('fail');
  });

  it('reports missing slots and leaves dependent checks pending', () => {
    const parts: SelectedParts = { ...presetParts('apex-titan'), Case: null, PSU: null };
    const analysis = analyseBuild(parts);
    expect(analysis.missingSlots).toEqual(['PSU', 'Case'] satisfies HardwareCategory[]);
    expect(analysis.isComplete).toBe(false);
    expect(statusOf(parts, 'slots')).toBe('fail');
    expect(statusOf(parts, 'gpu-clearance')).toBe('pending');
    expect(statusOf(parts, 'psu-capacity')).toBe('pending');
    expect(analysis.power.capacityW).toBeNull();
  });
});
