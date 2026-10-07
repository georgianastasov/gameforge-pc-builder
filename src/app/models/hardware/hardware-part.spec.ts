import { HARDWARE_CATEGORIES, parseSlotParam, toSlotParam } from './hardware-part';

describe('slot query parameter', () => {
  it('round-trips every hardware slot', () => {
    for (const category of HARDWARE_CATEGORIES) {
      expect(parseSlotParam(toSlotParam(category))).toBe(category);
    }
  });

  it('is case-insensitive and ignores surrounding whitespace', () => {
    expect(parseSlotParam(' GPU ')).toBe('GPU');
    expect(parseSlotParam('Motherboard')).toBe('Motherboard');
  });

  it('returns null for a missing or unknown slot', () => {
    expect(parseSlotParam(null)).toBeNull();
    expect(parseSlotParam(undefined)).toBeNull();
    expect(parseSlotParam('')).toBeNull();
    expect(parseSlotParam('monitor')).toBeNull();
  });
});
