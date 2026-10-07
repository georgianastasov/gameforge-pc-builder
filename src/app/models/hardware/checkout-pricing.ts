import { BuildPricing } from './build-pricing';

/** Shipping tiers offered in the checkout dialog (fees from the App Builder copy). */
export const SHIPPING_OPTIONS = [
  { id: 'ground', fee: 0, label: 'Complimentary Insured Ground', dispatch: '3 - 5 Business Days via Insured Rig Freight' },
  { id: 'express', fee: 65, label: 'Express Air Rig Dispatch', dispatch: '2 Business Days via Express Air Rig Dispatch' },
  { id: 'white-glove', fee: 140, label: 'White-Glove Hand Delivery & Desk Setup', dispatch: 'Scheduled White-Glove Delivery & Desk Setup' }
] as const;

/** Payment methods; wire transfer carries the advertised 1.5% instant discount. */
export const PAYMENT_METHODS = [
  { id: 'ach', discountRate: 0.015, label: 'Direct Wire Transfer / ACH' },
  { id: 'card', discountRate: 0, label: 'Credit Card' },
  { id: 'purchase-order', discountRate: 0, label: 'Corporate Purchase Order / Net 30' }
] as const;

export type ShippingId = (typeof SHIPPING_OPTIONS)[number]['id'];
export type PaymentId = (typeof PAYMENT_METHODS)[number]['id'];

export const SALES_TAX_RATE = 0.065;

export interface CheckoutPricing extends BuildPricing {
  /** Assembly tier plus optional thermal tuning. */
  servicesFee: number;
  paymentDiscount: number;
  /** Sales tax on hardware and services after the payment discount. */
  tax: number;
  shippingFee: number;
  finalTotal: number;
}

/** Rounds half-cents up; `toFixed(6)` first strips float noise (1079 * 0.015 = 16.184999…). */
const roundCents = (value: number) => Math.round(Number((value * 100).toFixed(6))) / 100;

export function getShippingOption(id: ShippingId | null) {
  return SHIPPING_OPTIONS.find(option => option.id === id) ?? null;
}

export function getPaymentMethod(id: PaymentId | null) {
  return PAYMENT_METHODS.find(method => method.id === id) ?? null;
}

/**
 * Final invoice: the payment discount applies to hardware and services,
 * tax applies to the discounted amount, shipping is neither discounted nor taxed.
 */
export function calculateCheckout(pricing: BuildPricing, shipping: ShippingId | null, payment: PaymentId | null): CheckoutPricing {
  const servicesFee = pricing.assemblyFee + pricing.thermalTuningFee;
  const merchandise = pricing.subtotal + servicesFee;
  const paymentDiscount = roundCents(merchandise * (getPaymentMethod(payment)?.discountRate ?? 0));
  const tax = roundCents((merchandise - paymentDiscount) * SALES_TAX_RATE);
  const shippingFee = getShippingOption(shipping)?.fee ?? 0;
  return {
    ...pricing,
    servicesFee,
    paymentDiscount,
    tax,
    shippingFee,
    finalTotal: roundCents(merchandise - paymentDiscount + tax + shippingFee)
  };
}
