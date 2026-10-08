import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DOCUMENT, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IChipSelectEventArgs, IGX_CARD_DIRECTIVES, IGX_CHIPS_DIRECTIVES, IGX_DIALOG_DIRECTIVES, IGX_INPUT_GROUP_DIRECTIVES, IGX_SELECT_DIRECTIVES, IgxAvatarComponent, IgxBadgeComponent, IgxButtonDirective, IgxCheckboxComponent, IgxDialogComponent, IgxIconComponent, IgxSnackbarComponent } from '@infragistics/igniteui-angular';
import { CsvFileTypes, IgxCsvExporterOptions, IgxCsvExporterService, IRowSelectionEventArgs } from '@infragistics/igniteui-angular/grids/core';
import { IGX_GRID_DIRECTIVES, IgxGridComponent } from '@infragistics/igniteui-angular/grids/grid';
import { merge } from 'rxjs';
import { HardwareCategory } from '../models/hardware/hardware-part';
import { BOARD_FORM_FACTORS, buildHardwarePart, CPU_SOCKETS, createPartId, PERFORMANCE_TIERS, PSU_EFFICIENCIES } from '../models/hardware/part-draft';
import { AVAILABILITY_MODES, AvailabilityMode, STOCK_BADGE_TYPE, StockStatus } from '../models/store/inventory';
import { FULFILLMENT_BADGE_TYPE, FULFILLMENT_STAGES, FulfillmentStage, PAYMENT_BADGE_TYPE, PAYMENT_STATUSES, PaymentStatus } from '../models/store/order-status';
import { AdminAuthService } from '../services/admin-auth.service';
import { FlagshipPCHardwareCatalogService } from '../services/flagship-pchardware-catalog.service';
import { InventoryService } from '../services/inventory.service';
import { OrderService } from '../services/order.service';
import { summarizeBackoffice } from './admin-metrics';
import { ALL_BRANDS, brandsOf, CATEGORY_FILTER_LABELS, CATEGORY_LABELS, CATEGORY_ORDER, matchesCatalogCriteria, toCatalogRow, toInventoryRow } from './catalog-admin';
import { filterOrders, ORDER_QUEUES, OrderQueueId, queueCount, toOrderRow } from './order-queue';
import { applyCategoryFields, createPartForm, interfaceOptionsFor, PartForm, RADIATOR_SIZES, readPartDraft } from './part-form';

const wholeUnits = [Validators.required, Validators.min(0), Validators.max(9999), Validators.pattern(/^\d+$/)];

@Component({
  selector: 'app-admin-backoffice',
  imports: [IGX_INPUT_GROUP_DIRECTIVES, IGX_SELECT_DIRECTIVES, IGX_DIALOG_DIRECTIVES, IGX_CHIPS_DIRECTIVES, IGX_CARD_DIRECTIVES, IGX_GRID_DIRECTIVES, IgxBadgeComponent, IgxButtonDirective, IgxIconComponent, IgxAvatarComponent, IgxCheckboxComponent, IgxSnackbarComponent, FormsModule, ReactiveFormsModule, CurrencyPipe, DecimalPipe],
  templateUrl: './admin-backoffice.component.html',
  styleUrls: ['./admin-backoffice.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminBackofficeComponent {
  private readonly auth = inject(AdminAuthService);
  private readonly catalog = inject(FlagshipPCHardwareCatalogService);
  private readonly inventory = inject(InventoryService);
  private readonly orders = inject(OrderService);
  private readonly csvExporter = inject(IgxCsvExporterService);
  private readonly document = inject(DOCUMENT);
  private readonly ordersGrid = viewChild.required<IgxGridComponent>('ordersGrid');
  private readonly snackbar = viewChild.required<IgxSnackbarComponent>('snackbar');

  public readonly adminEmail = computed(() => this.auth.currentSession()?.email ?? '');

  // Option lists for the selects
  public readonly orderQueues = ORDER_QUEUES;
  public readonly paymentStatuses = PAYMENT_STATUSES;
  public readonly fulfillmentStages = FULFILLMENT_STAGES;
  public readonly categories = CATEGORY_ORDER;
  public readonly categoryFilterLabels = CATEGORY_FILTER_LABELS;
  public readonly categoryLabels = CATEGORY_LABELS;
  public readonly performanceTiers = PERFORMANCE_TIERS;
  public readonly cpuSockets = CPU_SOCKETS;
  public readonly boardFormFactors = BOARD_FORM_FACTORS;
  public readonly psuEfficiencies = PSU_EFFICIENCIES;
  public readonly radiatorSizes = RADIATOR_SIZES;
  public readonly availabilityModes = AVAILABILITY_MODES;
  public readonly allBrands = ALL_BRANDS;

  // Overview KPIs
  public readonly overview = computed(() => summarizeBackoffice(
    this.orders.orders(),
    this.inventory.inventory().filter(record => !this.catalog.isDiscontinued(record.partId)),
    Date.now()
  ));

  // Orders Management
  public readonly orderQueue = signal<OrderQueueId>('all');
  public readonly orderSearch = signal('');
  public readonly paymentFilter = signal<PaymentStatus | 'all' | undefined>(undefined);
  public readonly stageFilter = signal<FulfillmentStage | 'all' | undefined>(undefined);
  /** Row selection of the orders grid. */
  public readonly selectedOrderIds = signal<string[]>([]);

  public readonly orderRows = computed(() => filterOrders(this.orders.orders(), {
    queue: this.orderQueue(),
    search: this.orderSearch(),
    payment: this.paymentFilter(),
    stage: this.stageFilter()
  }).map(toOrderRow));

  /** Selected orders still visible under the current filters; actions only apply to these. */
  public readonly actionableOrderIds = computed(() => {
    const visible = new Set(this.orderRows().map(row => row.id));
    return this.selectedOrderIds().filter(id => visible.has(id));
  });

  public readonly queueCounts = computed(() => {
    const orders = this.orders.orders();
    return Object.fromEntries(ORDER_QUEUES.map(queue => [queue.id, queueCount(orders, queue.id)])) as Record<OrderQueueId, number>;
  });

  // Components Management and Warehouse Stock
  public readonly catalogSearch = signal('');
  public readonly categoryFilter = signal<HardwareCategory | 'all' | undefined>(undefined);
  public readonly brandFilter = signal<string | undefined>(undefined);
  public readonly brands = computed(() => brandsOf(this.catalog.allParts()));
  public readonly selectedPartIds = signal<string[]>([]);

  private readonly filteredParts = computed(() => {
    const criteria = { search: this.catalogSearch(), category: this.categoryFilter(), brand: this.brandFilter() };
    return this.catalog.allParts().filter(part => matchesCatalogCriteria(part, criteria));
  });

  public readonly catalogRows = computed(() => this.filteredParts().map(part => toCatalogRow(part, this.catalog.isDiscontinued(part.id))));

  public readonly inventoryRows = computed(() => this.filteredParts().map(part =>
    toInventoryRow(part, this.inventory.record(part.id), this.inventory.status(part.id), this.catalog.isDiscontinued(part.id))
  ));

  /** The part selected in either the catalog or the warehouse grid (they share a selection), if still visible. */
  public readonly selectedPart = computed(() => {
    const id = this.selectedPartIds()[0];
    return id && this.filteredParts().some(part => part.id === id) ? this.catalog.getPartById(id) : null;
  });
  public readonly selectedPartDiscontinued = computed(() => {
    const part = this.selectedPart();
    return part ? this.catalog.isDiscontinued(part.id) : false;
  });

  public readonly snackbarMessage = signal('Backoffice changes and inventory levels saved successfully.');

  // Add Component dialog
  public readonly partForm = createPartForm();
  public readonly addSubmitAttempted = signal(false);
  private readonly partFormValue = toSignal(this.partForm.valueChanges, { initialValue: this.partForm.getRawValue() });
  public readonly newPartCategory = computed(() => this.partFormValue().category ?? 'CPU');
  public readonly newPartCoolerType = computed(() => this.partFormValue().coolerType ?? 'aio');
  public readonly interfaceOptions = computed(() => interfaceOptionsFor(this.newPartCategory()));

  // Edit Hardware Component dialog
  public readonly editForm = new FormGroup({
    price: new FormControl<number | null>(null, [Validators.required, Validators.min(1), Validators.max(20000)]),
    stockQuantity: new FormControl<number | null>(null, wholeUnits),
    availabilityMode: new FormControl<AvailabilityMode>('auto', { nonNullable: true }),
    reorderThreshold: new FormControl<number | null>(null, wholeUnits)
  });
  public readonly editSubmitAttempted = signal(false);

  // Update Order Status dialog; `null` keeps each order's current value.
  public readonly statusForm = new FormGroup({
    paymentStatus: new FormControl<PaymentStatus | null>(null),
    fulfillmentStatus: new FormControl<FulfillmentStage | null>(null)
  });

  constructor() {
    applyCategoryFields(this.partForm);
    merge(this.partForm.controls.category.valueChanges, this.partForm.controls.coolerType.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => applyCategoryFields(this.partForm));
  }

  // Grid selection. The grid's `selectedRowsChange` output doesn't fire on user clicks in this
  // Ignite UI version, so selection is mirrored from `rowSelectionChanging` (whose rows are data records).
  public onOrderSelection(event: IRowSelectionEventArgs): void {
    this.selectedOrderIds.set(selectedKeys(event, 'id'));
  }

  public onPartSelection(event: IRowSelectionEventArgs, key: 'id' | 'partId'): void {
    this.selectedPartIds.set(selectedKeys(event, key));
  }

  // Grid cell badges
  public paymentBadge(status: PaymentStatus): string {
    return PAYMENT_BADGE_TYPE[status];
  }

  public fulfillmentBadge(stage: FulfillmentStage): string {
    return FULFILLMENT_BADGE_TYPE[stage];
  }

  public stockBadge(status: StockStatus): string {
    return STOCK_BADGE_TYPE[status];
  }

  // Overview actions

  /** Pulls in changes saved from another tab (e.g. a storefront order). */
  public syncInventory(): void {
    this.catalog.reload();
    this.inventory.reload();
    this.orders.reload();
    const { lowStockCount } = this.overview();
    this.notify(`Inventory synchronized: ${this.catalog.parts().length} listed parts, ${lowStockCount} at or below reorder threshold.`);
  }

  /** Every order with its financial and fulfillment state, regardless of grid filters. */
  public exportAudit(): void {
    const rows = this.orders.orders().map(order => ({
      orderId: order.id,
      placedAt: new Date(order.placedAt).toISOString(),
      customerName: order.customerName,
      configuration: order.configurationName,
      parts: order.lines.map(line => line.name).join('; '),
      subtotal: order.pricing.subtotal,
      services: order.pricing.servicesFee,
      discount: order.pricing.paymentDiscount,
      tax: order.pricing.tax,
      shipping: order.pricing.shippingFee,
      total: order.pricing.finalTotal,
      paymentMethod: order.payment,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus
    }));
    this.csvExporter.exportData(rows, new IgxCsvExporterOptions('gameforge-order-audit', CsvFileTypes.CSV));
    this.notify(`Exported an audit of ${rows.length} orders.`);
  }

  // Orders Management actions

  public onQueueChanging(event: IChipSelectEventArgs, queue: OrderQueueId): void {
    if (!event.originalEvent) {
      return;
    }
    // The chips mirror `orderQueue`; a click selects that queue and can't deselect it.
    event.cancel = true;
    this.orderQueue.set(queue);
  }

  public resetOrderFilters(): void {
    this.orderQueue.set('all');
    this.orderSearch.set('');
    this.paymentFilter.set(undefined);
    this.stageFilter.set(undefined);
  }

  /** Exports the orders grid as currently filtered and sorted. */
  public exportOrders(): void {
    this.csvExporter.export(this.ordersGrid(), new IgxCsvExporterOptions('gameforge-orders', CsvFileTypes.CSV));
    this.notify(`Exported ${this.orderRows().length} orders.`);
  }

  public processShipments(): void {
    const selected = this.actionableOrderIds();
    const shipped = this.orders.shipOrders(selected);
    const skipped = selected.length - shipped;
    this.notify(shipped
      ? `${shipped} ${shipped === 1 ? 'order' : 'orders'} dispatched.${skipped ? ` ${skipped} skipped: only paid or pre-authorized orders in assembly can ship.` : ''}`
      : 'Nothing shipped: only paid or pre-authorized orders in Assembly & Testing can ship.');
  }

  public openStatusDialog(dialog: IgxDialogComponent): void {
    const ids = this.actionableOrderIds();
    const single = ids.length === 1 ? this.orders.orders().find(order => order.id === ids[0]) : undefined;
    this.statusForm.reset({ paymentStatus: single?.paymentStatus ?? null, fulfillmentStatus: single?.fulfillmentStatus ?? null });
    dialog.open();
  }

  public saveOrderStatus(dialog: IgxDialogComponent): void {
    const { paymentStatus, fulfillmentStatus } = this.statusForm.getRawValue();
    const changed = this.orders.updateStatus(this.actionableOrderIds(), {
      ...(paymentStatus ? { paymentStatus } : {}),
      ...(fulfillmentStatus ? { fulfillmentStatus } : {})
    });
    dialog.close();
    this.notify(changed ? `Updated the status of ${changed} ${changed === 1 ? 'order' : 'orders'}.` : 'No order status changed.');
  }

  public printInvoices(): void {
    this.document.defaultView?.print();
  }

  // Components Management actions

  public resetCatalogFilters(): void {
    this.catalogSearch.set('');
    this.categoryFilter.set(undefined);
    this.brandFilter.set(undefined);
  }

  public openAddDialog(dialog: IgxDialogComponent): void {
    this.addSubmitAttempted.set(false);
    this.partForm.reset();
    applyCategoryFields(this.partForm);
    dialog.open();
  }

  public showAddError(control: keyof PartForm['controls']): boolean {
    const { invalid, touched } = this.partForm.controls[control];
    return invalid && (touched || this.addSubmitAttempted());
  }

  /** Adds the part to the catalog and opens its stock record; it goes on sale immediately. */
  public addComponent(dialog: IgxDialogComponent): void {
    this.addSubmitAttempted.set(true);
    this.partForm.markAllAsTouched();
    if (this.partForm.invalid) {
      return;
    }
    const draft = readPartDraft(this.partForm);
    const part = buildHardwarePart(draft, createPartId(draft, id => this.catalog.hasPart(id)));
    this.catalog.addPart(part);
    this.inventory.update(part.id, { stockQuantity: this.partForm.getRawValue().initialStock ?? 0 });
    this.selectedPartIds.set([part.id]);
    dialog.close();
    this.notify(`${part.name} added to the ${part.category} catalog and is now available in the storefront.`);
  }

  public openEditDialog(dialog: IgxDialogComponent): void {
    const part = this.selectedPart();
    if (!part) {
      return;
    }
    const record = this.inventory.record(part.id);
    this.editSubmitAttempted.set(false);
    this.editForm.reset({
      price: part.price,
      stockQuantity: record.stockQuantity,
      availabilityMode: record.availabilityMode,
      reorderThreshold: record.reorderThreshold
    });
    dialog.open();
  }

  public showEditError(control: 'price' | 'stockQuantity' | 'reorderThreshold'): boolean {
    const { invalid, touched } = this.editForm.controls[control];
    return invalid && (touched || this.editSubmitAttempted());
  }

  public saveComponent(dialog: IgxDialogComponent): void {
    const part = this.selectedPart();
    this.editSubmitAttempted.set(true);
    this.editForm.markAllAsTouched();
    if (!part || this.editForm.invalid) {
      return;
    }
    const { price, stockQuantity, availabilityMode, reorderThreshold } = this.editForm.getRawValue();
    this.catalog.updatePrice(part.id, price ?? part.price);
    this.inventory.update(part.id, { stockQuantity: stockQuantity ?? 0, reorderThreshold: reorderThreshold ?? 0, availabilityMode });
    dialog.close();
    this.notify(`${part.name} saved: ${this.inventory.status(part.id)}, ${stockQuantity} units at $${(price ?? part.price).toFixed(2)}.`);
  }

  /** Discontinues (or relists) the selected part; it stays resolvable for presets, saved builds and orders. */
  public toggleDiscontinued(dialog: IgxDialogComponent): void {
    const part = this.selectedPart();
    if (!part) {
      return;
    }
    const discontinue = !this.selectedPartDiscontinued();
    this.catalog.setDiscontinued(part.id, discontinue);
    dialog.close();
    this.notify(discontinue
      ? `${part.name} discontinued. It is hidden from the storefront; existing builds and orders keep it.`
      : `${part.name} is listed in the storefront again.`);
  }

  private notify(message: string): void {
    this.snackbarMessage.set(message);
    this.snackbar().open();
  }
}

/** Primary keys of the rows in a selection change; rows may arrive as records or as keys. */
function selectedKeys(event: IRowSelectionEventArgs, key: string): string[] {
  return event.newSelection.map((row: unknown) => row && typeof row === 'object' ? String((row as Record<string, unknown>)[key]) : String(row));
}
