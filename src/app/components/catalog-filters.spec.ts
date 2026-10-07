import { FlagshipPCHardwareCatalog } from '../static-data/flagship-pchardware-catalog';
import { CatalogCriteria, filterCatalog, hasActiveCriteria } from './catalog-filters';

const NONE: CatalogCriteria = { search: '', category: undefined, tier: undefined, platform: undefined, quickFilters: [], sort: undefined };
const run = (criteria: Partial<CatalogCriteria>) => filterCatalog(FlagshipPCHardwareCatalog, { ...NONE, ...criteria });
const ids = (criteria: Partial<CatalogCriteria>) => run(criteria).map(part => part.id);

describe('filterCatalog', () => {
  it('returns the full catalog in original order with no criteria', () => {
    expect(run({})).toEqual([...FlagshipPCHardwareCatalog]);
    expect(hasActiveCriteria(NONE)).toBe(false);
  });

  it('searches name, manufacturer and specs with every term required', () => {
    expect(ids({ search: 'noctua' })).toEqual(['cool-noctua-nh-d15-g2']);
    expect(ids({ search: '  GDDR7 ' })).toEqual(['gpu-rtx-5090-fe', 'gpu-rtx-5080-fe']);
    expect(ids({ search: 'samsung pcie 4.0' })).toEqual(['ssd-samsung-990-pro-2tb', 'ssd-samsung-990-evo-plus-2tb']);
    expect(run({ search: 'zzz-no-match' })).toEqual([]);
  });

  it('filters by category and tier, treating "all" as no filter', () => {
    expect(run({ category: 'Cooling' }).every(part => part.category === 'Cooling')).toBe(true);
    expect(run({ category: 'all' }).length).toBe(FlagshipPCHardwareCatalog.length);
    expect(ids({ category: 'GPU', tier: 'Flagship' })).toEqual(['gpu-rtx-5090-fe']);
  });

  it('filters by socket / form factor', () => {
    expect(ids({ platform: 'lga1700', category: 'CPU' })).toEqual(['cpu-core-i7-14700k']);
    expect(run({ platform: 'am5' }).some(part => part.category === 'Cooling')).toBe(true);
    expect(run({ platform: 'atx' }).map(part => part.category)).not.toContain('GPU');
    expect(run({ platform: 'pcie5' }).map(part => part.id)).toContain('ssd-crucial-t705-2tb');
  });

  it('ORs type quick filters and ANDs metric quick filters', () => {
    const cpusAndGpus = run({ quickFilters: ['processors', 'gpus'] });
    expect(new Set(cpusAndGpus.map(part => part.category))).toEqual(new Set(['CPU', 'GPU']));
    expect(ids({ quickFilters: ['processors', 'high-benchmark'] })).toEqual(['cpu-ryzen9-9950x3d', 'cpu-core-i7-14700k']);
    expect(ids({ quickFilters: ['high-tdp', 'high-benchmark'] })).toEqual(['cpu-core-i7-14700k', 'gpu-rtx-5090-fe', 'gpu-rtx-5080-fe']);
  });

  it('sorts without mutating the source catalog', () => {
    const before = [...FlagshipPCHardwareCatalog];
    const byPrice = run({ sort: 'price-asc' }).map(part => part.price);
    expect(byPrice).toEqual([...byPrice].sort((a, b) => a - b));
    expect(run({ sort: 'benchmark-desc' })[0].id).toBe('gpu-rtx-5090-fe');
    expect(FlagshipPCHardwareCatalog).toEqual(before);
  });
});
