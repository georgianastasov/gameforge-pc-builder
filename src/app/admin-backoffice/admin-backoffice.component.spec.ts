import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { IgxDialogComponent } from '@infragistics/igniteui-angular';
import { FlagshipPCHardwareCatalogService } from '../services/flagship-pchardware-catalog.service';
import { InventoryService } from '../services/inventory.service';
import { OrderService } from '../services/order.service';
import { CustomerOrderSeeds } from '../static-data/customer-orders';
import { AdminBackofficeComponent } from './admin-backoffice.component';

/** Stands in for the template's dialogs so actions can be called directly. */
const dialog = () => ({ open: vi.fn(), close: vi.fn() }) as unknown as IgxDialogComponent & { open: ReturnType<typeof vi.fn>; close: ReturnType<typeof vi.fn> };

describe('AdminBackofficeComponent', () => {
  let component: AdminBackofficeComponent;
  let fixture: ComponentFixture<AdminBackofficeComponent>;
  let catalog: FlagshipPCHardwareCatalogService;
  let inventory: InventoryService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [AdminBackofficeComponent],
      providers: [provideRouter([]), provideNoopAnimations()]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminBackofficeComponent);
    component = fixture.componentInstance;
    catalog = TestBed.inject(FlagshipPCHardwareCatalogService);
    inventory = TestBed.inject(InventoryService);
    fixture.detectChanges();
  });

  afterEach(() => localStorage.clear());

  it('renders the App Builder sections with KPIs derived from store state', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Admin Overview');
    expect(text).toContain('Orders Management');
    expect(text).toContain('Components Management');
    expect(text).toContain('Warehouse Stock & Availability');
    expect(component.overview().totalOrders).toBe(CustomerOrderSeeds.length);
    expect(component.overview().lowStockCount).toBe(5);
    expect(component.queueCounts().all).toBe(CustomerOrderSeeds.length);
  });

  it('filters orders by queue and search', () => {
    component.orderQueue.set('pending-payment');
    expect(component.orderRows().every(row => row.paymentStatus === 'Pending')).toBe(true);
    component.resetOrderFilters();
    component.orderSearch.set('maya');
    expect(component.orderRows().map(row => row.customerName)).toEqual(['Maya Okafor']);
  });

  it('dispatches only funded orders in assembly', () => {
    const orders = TestBed.inject(OrderService);
    const ready = orders.orders().find(o => o.paymentStatus === 'Paid' && o.fulfillmentStatus === 'Assembly & Testing')!;
    const onHold = orders.orders().find(o => o.fulfillmentStatus === 'On Hold')!;
    component.selectedOrderIds.set([ready.id, onHold.id]);
    component.processShipments();
    expect(orders.orders().find(o => o.id === ready.id)?.fulfillmentStatus).toBe('Shipped');
    expect(orders.orders().find(o => o.id === onHold.id)?.fulfillmentStatus).toBe('On Hold');
    expect(component.snackbarMessage()).toContain('1 order dispatched');
  });

  it('updates the status of the selected orders', () => {
    const orders = TestBed.inject(OrderService);
    const target = orders.orders().find(o => o.paymentStatus === 'Pending')!;
    component.selectedOrderIds.set([target.id]);
    const statusDialog = dialog();
    component.openStatusDialog(statusDialog);
    expect(component.statusForm.getRawValue()).toEqual({ paymentStatus: 'Pending', fulfillmentStatus: 'On Hold' });
    component.statusForm.setValue({ paymentStatus: 'Paid', fulfillmentStatus: 'Assembly & Testing' });
    component.saveOrderStatus(statusDialog);
    expect(orders.orders().find(o => o.id === target.id)).toMatchObject({ paymentStatus: 'Paid', fulfillmentStatus: 'Assembly & Testing' });
  });

  it('adds a component with its compatibility specifications and opening stock', () => {
    const addDialog = dialog();
    component.openAddDialog(addDialog);
    component.partForm.patchValue({ category: 'GPU' });
    component.partForm.patchValue({
      name: 'NVIDIA GeForce RTX 5070 Ti', brand: 'NVIDIA', price: 749, initialStock: 8, benchmarkScore: 26500,
      tdpWattage: 300, lengthMm: 300, specsDetail: '16GB GDDR7, 2.45 GHz boost'
    });
    fixture.detectChanges();
    component.addComponent(addDialog);

    const added = catalog.getPartById('gpu-nvidia-geforce-rtx-5070-ti');
    expect(added).toMatchObject({ category: 'GPU', lengthMm: 300, price: 749, socketOrFormFactor: 'PCIe 5.0 x16' });
    expect(catalog.parts().some(part => part.id === added?.id)).toBe(true);
    expect(inventory.record(added!.id).stockQuantity).toBe(8);
    expect(inventory.status(added!.id)).toBe('In Stock');
    expect(addDialog.close).toHaveBeenCalled();
  });

  it('does not add an incomplete component', () => {
    const addDialog = dialog();
    const before = catalog.allParts().length;
    component.openAddDialog(addDialog);
    component.partForm.patchValue({ name: 'Half-filled' });
    component.addComponent(addDialog);
    expect(catalog.allParts().length).toBe(before);
    expect(addDialog.close).not.toHaveBeenCalled();
    expect(component.showAddError('price')).toBe(true);
  });

  it('edits price, stock and availability of the selected part', () => {
    component.selectedPartIds.set(['gpu-rtx-5090-fe']);
    const editDialog = dialog();
    component.openEditDialog(editDialog);
    expect(component.editForm.getRawValue()).toMatchObject({ price: 1999, stockQuantity: 3, reorderThreshold: 5, availabilityMode: 'auto' });

    component.editForm.patchValue({ price: 1899, stockQuantity: 0, availabilityMode: 'backorder' });
    component.saveComponent(editDialog);
    expect(catalog.getPartById('gpu-rtx-5090-fe')?.price).toBe(1899);
    expect(inventory.status('gpu-rtx-5090-fe')).toBe('Backordered');
  });

  it('discontinues and restores the selected part without deleting it', () => {
    component.selectedPartIds.set(['case-nzxt-h6-flow']);
    component.toggleDiscontinued(dialog());
    expect(catalog.parts().some(part => part.id === 'case-nzxt-h6-flow')).toBe(false);
    expect(catalog.getPartById('case-nzxt-h6-flow')).not.toBeNull();
    expect(component.catalogRows().find(row => row.id === 'case-nzxt-h6-flow')?.listing).toBe('Discontinued');

    component.toggleDiscontinued(dialog());
    expect(catalog.parts().some(part => part.id === 'case-nzxt-h6-flow')).toBe(true);
  });

  it('mirrors grid row selection from rowSelectionChanging records', () => {
    component.onPartSelection({ newSelection: [{ id: 'gpu-rtx-5080-fe', name: 'RTX 5080' }] } as never, 'id');
    expect(component.selectedPart()?.id).toBe('gpu-rtx-5080-fe');
    component.onPartSelection({ newSelection: [{ partId: 'psu-corsair-rm850x' }] } as never, 'partId');
    expect(component.selectedPart()?.id).toBe('psu-corsair-rm850x');
    component.onOrderSelection({ newSelection: [{ id: 'GF-1' }, { id: 'GF-2' }] } as never);
    expect(component.selectedOrderIds()).toEqual(['GF-1', 'GF-2']);
  });

  it('never acts on a selection hidden by the filters', () => {
    component.selectedPartIds.set(['case-nzxt-h6-flow']);
    component.categoryFilter.set('GPU');
    expect(component.selectedPart()).toBeNull();

    const orders = TestBed.inject(OrderService).orders();
    component.selectedOrderIds.set([orders[0].id]);
    component.orderSearch.set('no customer matches this');
    expect(component.actionableOrderIds()).toEqual([]);
  });

  it('filters the catalog and warehouse grids together', () => {
    component.categoryFilter.set('PSU');
    expect(component.catalogRows().length).toBe(3);
    expect(component.inventoryRows().every(row => row.category === 'PSU')).toBe(true);
    component.resetCatalogFilters();
    component.brandFilter.set('Samsung');
    expect(component.catalogRows().map(row => row.brand)).toEqual(['Samsung', 'Samsung']);
  });
});
