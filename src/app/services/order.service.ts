import { computed, inject, Injectable, signal } from '@angular/core';
import { BuildSelection } from '../models/hardware/build-preset';
import { AssemblyTier, calculatePricing } from '../models/hardware/build-pricing';
import { calculateCheckout, CheckoutPricing, PaymentId, ShippingId } from '../models/hardware/checkout-pricing';
import { HARDWARE_CATEGORIES, HardwareCategory } from '../models/hardware/hardware-part';
import { canShip, FulfillmentStage, initialOrderStatus, isFulfillmentStage, isPaymentStatus, PaymentStatus } from '../models/store/order-status';
import { CustomerOrderSeeds } from '../static-data/customer-orders';
import { EliteFlagshipPCTrioService } from './elite-flagship-pctrio.service';
import { FlagshipPCHardwareCatalogService } from './flagship-pchardware-catalog.service';
import { InventoryService } from './inventory.service';
import { readVersioned, writeVersioned } from './versioned-storage';

export interface OrderLine {
  category: HardwareCategory;
  partId: string;
  name: string;
  price: number;
}

/** Immutable record of what was ordered, captured at confirmation time; only its statuses change afterwards. */
export interface OrderSnapshot {
  id: string;
  placedAt: number;
  customerName: string;
  configurationName: string;
  selection: BuildSelection;
  lines: OrderLine[];
  assemblyTier: AssemblyTier;
  precisionTuning: boolean;
  shipping: ShippingId;
  payment: PaymentId;
  dispatch: string;
  pricing: CheckoutPricing;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStage;
}

export type NewOrder = Omit<OrderSnapshot, 'id' | 'placedAt' | 'paymentStatus' | 'fulfillmentStatus'>;

export interface OrderStatusChange {
  paymentStatus?: PaymentStatus;
  fulfillmentStatus?: FulfillmentStage;
}

const STORAGE_KEY = 'gameforge.orders';
const STORAGE_VERSION = 1;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Order history (seeded demo orders plus customer checkouts) and the most recent order for the confirmation state. */
@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly catalog = inject(FlagshipPCHardwareCatalogService);
  private readonly presets = inject(EliteFlagshipPCTrioService);
  private readonly inventory = inject(InventoryService);

  private readonly ordersState = signal<OrderSnapshot[]>(this.loadOrders());
  /** Every order, newest first. */
  public readonly orders = computed(() => [...this.ordersState()].sort((a, b) => b.placedAt - a.placedAt));

  private readonly lastOrderState = signal<OrderSnapshot | null>(null);
  public readonly lastOrder = this.lastOrderState.asReadonly();

  public placeOrder(order: NewOrder): OrderSnapshot {
    const placedAt = Date.now();
    const snapshot: OrderSnapshot = {
      ...structuredClone(order),
      id: OrderService.createOrderId(placedAt),
      placedAt,
      ...initialOrderStatus(order.payment)
    };
    this.save(orders => [snapshot, ...orders]);
    this.inventory.allocate(snapshot.lines.map(line => line.partId));
    this.lastOrderState.set(snapshot);
    return snapshot;
  }

  public clearLastOrder(): void {
    this.lastOrderState.set(null);
  }

  /** Applies a status change to the given orders; returns how many changed. */
  public updateStatus(ids: readonly string[], change: OrderStatusChange): number {
    const targets = new Set(ids);
    let changed = 0;
    this.save(orders => orders.map(order => {
      if (!targets.has(order.id)) {
        return order;
      }
      const next = { ...order, ...change };
      if (next.paymentStatus === order.paymentStatus && next.fulfillmentStatus === order.fulfillmentStatus) {
        return order;
      }
      changed++;
      return next;
    }));
    return changed;
  }

  /** Dispatches the funded, assembled orders among `ids`; returns how many shipped. */
  public shipOrders(ids: readonly string[]): number {
    const eligible = this.ordersState().filter(order => ids.includes(order.id) && canShip(order)).map(order => order.id);
    return eligible.length ? this.updateStatus(eligible, { fulfillmentStatus: 'Shipped' }) : 0;
  }

  /** Re-reads orders saved by another tab. */
  public reload(): void {
    this.ordersState.set(this.loadOrders());
  }

  private save(change: (orders: OrderSnapshot[]) => OrderSnapshot[]): void {
    this.ordersState.update(change);
    writeVersioned(STORAGE_KEY, STORAGE_VERSION, { orders: this.ordersState() });
  }

  private loadOrders(): OrderSnapshot[] {
    const stored = readVersioned(STORAGE_KEY, STORAGE_VERSION)?.['orders'];
    return Array.isArray(stored) ? stored.filter(isOrderSnapshot) : this.createSeedOrders(Date.now());
  }

  /** Prices each demo order from the live catalog, exactly as checkout would. */
  private createSeedOrders(now: number): OrderSnapshot[] {
    return CustomerOrderSeeds.flatMap((seed, index) => {
      const preset = this.presets.getPresetById(seed.presetId);
      if (!preset) {
        return [];
      }
      const selection: BuildSelection = { ...preset.parts, ...seed.swaps };
      const lines = HARDWARE_CATEGORIES.flatMap(category => {
        const part = this.catalog.getPartById(selection[category]);
        return part ? [{ category, partId: part.id, name: part.name, price: part.price }] : [];
      });
      const subtotal = lines.reduce((sum, line) => sum + line.price, 0);
      const placedAt = now - seed.daysAgo * DAY_MS - index * 37 * 60 * 1000;
      return [{
        id: `GF-${placedAt.toString(36)}-S${String(index + 1).padStart(3, '0')}`.toUpperCase(),
        placedAt,
        customerName: seed.customerName,
        configurationName: seed.swaps ? 'Custom GameForge Configuration' : preset.name,
        selection,
        lines,
        assemblyTier: seed.assemblyTier,
        precisionTuning: seed.precisionTuning,
        shipping: seed.shipping,
        payment: seed.payment,
        dispatch: '',
        pricing: calculateCheckout(calculatePricing(subtotal, seed.assemblyTier, seed.precisionTuning), seed.shipping, seed.payment),
        paymentStatus: seed.paymentStatus,
        fulfillmentStatus: seed.fulfillmentStatus
      } satisfies OrderSnapshot];
    });
  }

  /** e.g. GF-MBX2K9QF-7Q4D: base-36 timestamp plus a random suffix. */
  private static createOrderId(timestamp: number): string {
    const random = Math.floor(Math.random() * 36 ** 4).toString(36).padStart(4, '0');
    return `GF-${timestamp.toString(36)}-${random}`.toUpperCase();
  }
}

/** Shape check for orders restored from storage. */
function isOrderSnapshot(value: unknown): value is OrderSnapshot {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const order = value as Record<string, unknown>;
  const pricing = order['pricing'] as Record<string, unknown> | null;
  return typeof order['id'] === 'string'
    && typeof order['placedAt'] === 'number'
    && typeof order['customerName'] === 'string'
    && typeof order['configurationName'] === 'string'
    && Array.isArray(order['lines'])
    && !!order['selection'] && typeof order['selection'] === 'object'
    && !!pricing && typeof pricing === 'object' && typeof pricing['finalTotal'] === 'number'
    && isPaymentStatus(order['paymentStatus'])
    && isFulfillmentStage(order['fulfillmentStatus']);
}
