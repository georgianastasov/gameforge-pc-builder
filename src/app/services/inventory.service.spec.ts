import { TestBed } from '@angular/core/testing';
import { stockStatus } from '../models/store/inventory';
import { FlagshipPCHardwareCatalogService } from './flagship-pchardware-catalog.service';
import { InventoryService } from './inventory.service';

describe('InventoryService', () => {
  let service: InventoryService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(InventoryService);
  });

  afterEach(() => localStorage.clear());

  it('has a stock record for every catalog part, all orderable at launch', () => {
    const catalog = TestBed.inject(FlagshipPCHardwareCatalogService);
    expect(service.inventory().length).toBe(catalog.allParts().length);
    expect(catalog.allParts().every(part => service.isOrderable(part.id))).toBe(true);
    expect(service.inventory().filter(record => stockStatus(record) === 'Low Stock').length).toBe(5);
  });

  it('derives availability from stock, threshold and the availability rule', () => {
    const id = 'gpu-rtx-5080-fe';
    service.update(id, { stockQuantity: 20, reorderThreshold: 5 });
    expect(service.status(id)).toBe('In Stock');
    service.update(id, { stockQuantity: 5 });
    expect(service.status(id)).toBe('Low Stock');
    service.update(id, { stockQuantity: 0 });
    expect(service.status(id)).toBe('Out of Stock');
    expect(service.isOrderable(id)).toBe(false);
    service.update(id, { availabilityMode: 'backorder' });
    expect(service.status(id)).toBe('Backordered');
    expect(service.isOrderable(id)).toBe(true);
    service.update(id, { stockQuantity: 50, availabilityMode: 'hold' });
    expect(service.status(id)).toBe('Out of Stock');
  });

  it('treats parts without a stock record as out of stock', () => {
    expect(service.status('never-stocked')).toBe('Out of Stock');
  });

  it('allocates ordered units without going below zero', () => {
    service.update('psu-corsair-rm850x', { stockQuantity: 1 });
    service.allocate(['psu-corsair-rm850x', 'psu-corsair-rm850x']);
    expect(service.record('psu-corsair-rm850x').stockQuantity).toBe(0);
  });

  it('rounds and clamps stock edits to whole units', () => {
    service.update('ram-vengeance-rgb-32', { stockQuantity: 12.6, reorderThreshold: -3 });
    expect(service.record('ram-vengeance-rgb-32')).toMatchObject({ stockQuantity: 13, reorderThreshold: 0 });
  });

  it('persists stock changes across instances', () => {
    service.update('case-o11-evo-xl', { stockQuantity: 0, availabilityMode: 'backorder' });
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    expect(TestBed.inject(InventoryService).status('case-o11-evo-xl')).toBe('Backordered');
  });
});
