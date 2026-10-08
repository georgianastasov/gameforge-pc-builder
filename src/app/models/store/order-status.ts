import { PaymentId } from '../hardware/checkout-pricing';

/** Values match the App Builder generated Payment Status filter. */
export const PAYMENT_STATUSES = [
  { id: 'Paid', label: 'Paid (Settled)' },
  { id: 'Pending', label: 'Payment Pending' },
  { id: 'Pre-Authorized', label: 'Pre-Authorized' },
  { id: 'Refunded', label: 'Refunded' }
] as const;

/** Values match the App Builder generated Fulfillment Stage filter. */
export const FULFILLMENT_STAGES = [
  { id: 'Assembly & Testing', label: 'Assembly & Testing' },
  { id: 'Shipped', label: 'Shipped & En Route' },
  { id: 'Delivered', label: 'Delivered' },
  { id: 'On Hold', label: 'On Hold (Clearance)' }
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]['id'];
export type FulfillmentStage = (typeof FULFILLMENT_STAGES)[number]['id'];

export const PAYMENT_BADGE_TYPE: Record<PaymentStatus, 'success' | 'warning' | 'info' | 'error'> = {
  'Paid': 'success',
  'Pending': 'warning',
  'Pre-Authorized': 'info',
  'Refunded': 'error'
};

export const FULFILLMENT_BADGE_TYPE: Record<FulfillmentStage, 'primary' | 'success' | 'warning' | 'info'> = {
  'Assembly & Testing': 'info',
  'Shipped': 'primary',
  'Delivered': 'success',
  'On Hold': 'warning'
};

export function isPaymentStatus(value: unknown): value is PaymentStatus {
  return PAYMENT_STATUSES.some(status => status.id === value);
}

export function isFulfillmentStage(value: unknown): value is FulfillmentStage {
  return FULFILLMENT_STAGES.some(stage => stage.id === value);
}

/**
 * Where a new order starts: cards settle immediately, purchase orders are
 * pre-authorized, and wire transfers wait on hold until the funds arrive.
 */
export function initialOrderStatus(payment: PaymentId): { paymentStatus: PaymentStatus; fulfillmentStatus: FulfillmentStage } {
  switch (payment) {
    case 'card':
      return { paymentStatus: 'Paid', fulfillmentStatus: 'Assembly & Testing' };
    case 'purchase-order':
      return { paymentStatus: 'Pre-Authorized', fulfillmentStatus: 'Assembly & Testing' };
    case 'ach':
      return { paymentStatus: 'Pending', fulfillmentStatus: 'On Hold' };
  }
}

/** Only funded orders that finished assembly can be dispatched. */
export function canShip(order: { paymentStatus: PaymentStatus; fulfillmentStatus: FulfillmentStage }): boolean {
  return order.fulfillmentStatus === 'Assembly & Testing' && (order.paymentStatus === 'Paid' || order.paymentStatus === 'Pre-Authorized');
}
