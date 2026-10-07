import { Injectable, signal } from '@angular/core';
import { BuildSelection } from '../models/hardware/build-preset';
import { AssemblyTier } from '../models/hardware/build-pricing';
import { CheckoutPricing, PaymentId, ShippingId } from '../models/hardware/checkout-pricing';
import { HardwareCategory } from '../models/hardware/hardware-part';

export interface OrderLine {
  category: HardwareCategory;
  partId: string;
  name: string;
  price: number;
}

/** Immutable record of what was ordered, captured at confirmation time. */
export interface OrderSnapshot {
  id: string;
  placedAt: number;
  configurationName: string;
  selection: BuildSelection;
  lines: OrderLine[];
  assemblyTier: AssemblyTier;
  precisionTuning: boolean;
  shipping: ShippingId;
  payment: PaymentId;
  dispatch: string;
  pricing: CheckoutPricing;
}

export type NewOrder = Omit<OrderSnapshot, 'id' | 'placedAt'>;

/** Places orders and remembers the most recent one for the confirmation state. */
@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly lastOrderState = signal<OrderSnapshot | null>(null);
  public readonly lastOrder = this.lastOrderState.asReadonly();

  public placeOrder(order: NewOrder): OrderSnapshot {
    const placedAt = Date.now();
    const snapshot: OrderSnapshot = {
      ...structuredClone(order),
      id: OrderService.createOrderId(placedAt),
      placedAt
    };
    this.lastOrderState.set(snapshot);
    return snapshot;
  }

  public clearLastOrder(): void {
    this.lastOrderState.set(null);
  }

  /** e.g. GF-MBX2K9QF-7Q4D: base-36 timestamp plus a random suffix. */
  private static createOrderId(timestamp: number): string {
    const random = Math.floor(Math.random() * 36 ** 4).toString(36).padStart(4, '0');
    return `GF-${timestamp.toString(36)}-${random}`.toUpperCase();
  }
}
