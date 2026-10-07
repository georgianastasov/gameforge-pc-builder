import { HardwareCategory, HardwarePart, PerformanceTier } from '../models/hardware/hardware-part';

export type CategoryFilter = 'all' | HardwareCategory;
export type TierFilter = 'all' | PerformanceTier;
export type PlatformFilter = 'all' | 'am5' | 'lga1700' | 'pcie5' | 'atx';
export type SortOption = 'benchmark-desc' | 'price-asc' | 'price-desc' | 'tdp-asc';
export type QuickFilterId = 'processors' | 'gpus' | 'ddr5' | 'high-tdp' | 'high-benchmark';

export interface CatalogCriteria {
  search: string;
  category: CategoryFilter | undefined;
  tier: TierFilter | undefined;
  platform: PlatformFilter | undefined;
  quickFilters: readonly QuickFilterId[];
  sort: SortOption | undefined;
}

const PLATFORM_MATCHERS: Record<Exclude<PlatformFilter, 'all'>, (part: HardwarePart) => boolean> = {
  // Coolers count when they ship with a mount for the socket.
  am5: part => part.socket === 'AM5' || !!part.supportedSockets?.includes('AM5'),
  lga1700: part => part.socket === 'LGA1700' || !!part.supportedSockets?.includes('LGA1700'),
  pcie5: part => /PCIe 5\.0/.test(`${part.socketOrFormFactor} ${part.specsDetail}`),
  // ATX boards, ATX PSUs and cases that take an ATX board.
  atx: part => /\bATX\b/.test(part.socketOrFormFactor)
};

/**
 * Quick filters are faceted: "type" chips widen the result (OR), while
 * "metric" chips narrow it (AND), so Processors + GPUs shows both and
 * Processors + Benchmark > 30,000 shows only fast CPUs.
 */
const QUICK_FILTERS: Record<QuickFilterId, { facet: 'type' | 'metric'; matches: (part: HardwarePart) => boolean }> = {
  processors: { facet: 'type', matches: part => part.category === 'CPU' },
  gpus: { facet: 'type', matches: part => part.category === 'GPU' && /PCIe 5\.0/.test(part.socketOrFormFactor) },
  ddr5: { facet: 'type', matches: part => part.category === 'RAM' && part.memoryType === 'DDR5' && part.benchmarkScore >= 6000 },
  'high-tdp': { facet: 'metric', matches: part => part.tdpWattage > 250 },
  'high-benchmark': { facet: 'metric', matches: part => part.benchmarkScore > 30000 }
};

const SORTERS: Record<SortOption, (a: HardwarePart, b: HardwarePart) => number> = {
  'benchmark-desc': (a, b) => b.benchmarkScore - a.benchmarkScore,
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  'tdp-asc': (a, b) => a.tdpWattage - b.tdpWattage
};

function searchableText(part: HardwarePart): string {
  return [
    part.name, part.brand, part.category, part.performanceTier, part.socketOrFormFactor,
    part.specsDetail, part.memoryType, part.formFactor, part.socket, ...(part.supportedSockets ?? [])
  ].join(' ').toLowerCase();
}

function matchesSearch(part: HardwarePart, search: string): boolean {
  const terms = search.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) {
    return true;
  }
  const text = searchableText(part);
  return terms.every(term => text.includes(term));
}

function matchesQuickFilters(part: HardwarePart, ids: readonly QuickFilterId[]): boolean {
  const typeFilters = ids.filter(id => QUICK_FILTERS[id].facet === 'type');
  const metricFilters = ids.filter(id => QUICK_FILTERS[id].facet === 'metric');
  return (!typeFilters.length || typeFilters.some(id => QUICK_FILTERS[id].matches(part)))
    && metricFilters.every(id => QUICK_FILTERS[id].matches(part));
}

/** Applies every active criterion; returns a new array and never mutates `parts`. */
export function filterCatalog(parts: readonly HardwarePart[], criteria: CatalogCriteria): HardwarePart[] {
  const { search, category, tier, platform, quickFilters, sort } = criteria;
  const result = parts.filter(part =>
    matchesSearch(part, search)
    && (!category || category === 'all' || part.category === category)
    && (!tier || tier === 'all' || part.performanceTier === tier)
    && (!platform || platform === 'all' || PLATFORM_MATCHERS[platform](part))
    && matchesQuickFilters(part, quickFilters)
  );
  return sort ? result.sort(SORTERS[sort]) : result;
}

export function hasActiveCriteria(criteria: CatalogCriteria): boolean {
  const isSet = (value: string | undefined) => !!value && value !== 'all';
  return !!criteria.search.trim() || isSet(criteria.category) || isSet(criteria.tier)
    || isSet(criteria.platform) || criteria.quickFilters.length > 0;
}
