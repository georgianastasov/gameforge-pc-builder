import { TestBed } from '@angular/core/testing';
import { HardwarePart } from '../models/hardware/hardware-part';
import { FlagshipPCHardwareCatalog } from '../static-data/flagship-pchardware-catalog';
import { FlagshipPCHardwareCatalogService } from './flagship-pchardware-catalog.service';

const newGpu: HardwarePart = {
  id: 'gpu-rtx-5070-ti', name: 'NVIDIA GeForce RTX 5070 Ti', brand: 'NVIDIA', imageUrl: '/assets/hardware/gpu.svg', category: 'GPU',
  performanceTier: 'Enthusiast', socketOrFormFactor: 'PCIe 5.0 x16', lengthMm: 300, tdpWattage: 300, benchmarkScore: 27000,
  benchmarkSuite: '3DMark Time Spy Graphics', price: 749, specsDetail: '16GB GDDR7', compatibilityNote: ''
};

describe('FlagshipPCHardwareCatalogService', () => {
  let service: FlagshipPCHardwareCatalogService;

  const freshService = () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    return TestBed.inject(FlagshipPCHardwareCatalogService);
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(FlagshipPCHardwareCatalogService);
  });

  afterEach(() => localStorage.clear());

  it('lists the seeded catalog', () => {
    expect(service.parts().length).toBe(FlagshipPCHardwareCatalog.length);
    expect(service.getPartsByCategory('GPU').length).toBe(3);
  });

  it('adds parts and rejects duplicate ids', () => {
    service.addPart(newGpu);
    expect(service.getPartById(newGpu.id)).toEqual(newGpu);
    expect(service.getPartsByCategory('GPU').length).toBe(4);
    expect(() => service.addPart(newGpu)).toThrow();
  });

  it('applies price changes everywhere the part is read', () => {
    service.updatePrice('gpu-rtx-5090-fe', 1899);
    expect(service.getPartById('gpu-rtx-5090-fe')?.price).toBe(1899);
    expect(service.parts().find(part => part.id === 'gpu-rtx-5090-fe')?.price).toBe(1899);
    service.updatePrice('gpu-rtx-5090-fe', 0);
    expect(service.getPartById('gpu-rtx-5090-fe')?.price).toBe(1899);
  });

  it('hides discontinued parts from sale but still resolves them by id', () => {
    service.setDiscontinued('case-nzxt-h6-flow', true);
    expect(service.parts().some(part => part.id === 'case-nzxt-h6-flow')).toBe(false);
    expect(service.getPartById('case-nzxt-h6-flow')?.name).toBe('NZXT H6 Flow');
    expect(service.isDiscontinued('case-nzxt-h6-flow')).toBe(true);
    service.setDiscontinued('case-nzxt-h6-flow', false);
    expect(service.parts().some(part => part.id === 'case-nzxt-h6-flow')).toBe(true);
  });

  it('persists admin changes across instances', () => {
    service.addPart(newGpu);
    service.updatePrice(newGpu.id, 699);
    service.setDiscontinued('cpu-core-i7-14700k', true);

    const restored = freshService();
    expect(restored.getPartById(newGpu.id)?.price).toBe(699);
    expect(restored.isDiscontinued('cpu-core-i7-14700k')).toBe(true);
  });

  it('ignores malformed saved changes', () => {
    localStorage.setItem('gameforge.catalog', JSON.stringify({
      version: 1,
      added: [{ id: 'broken' }, { ...newGpu, category: 'Toaster' }],
      prices: { 'gpu-rtx-5090-fe': 'free', 'unknown-part': 10 },
      discontinued: ['unknown-part', 42]
    }));
    const restored = freshService();
    expect(restored.allParts().length).toBe(FlagshipPCHardwareCatalog.length);
    expect(restored.getPartById('gpu-rtx-5090-fe')?.price).toBe(1999);
    expect(restored.parts().length).toBe(FlagshipPCHardwareCatalog.length);
  });
});
