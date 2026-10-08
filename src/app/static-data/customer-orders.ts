import { AssemblyTier } from '../models/hardware/build-pricing';
import { PaymentId, ShippingId } from '../models/hardware/checkout-pricing';
import { HardwareCategory } from '../models/hardware/hardware-part';
import { FulfillmentStage, PaymentStatus } from '../models/store/order-status';

/** A demo order: a preset (optionally with swapped parts) bought `daysAgo` days ago. */
export interface CustomerOrderSeed {
  customerName: string;
  presetId: string;
  swaps?: Partial<Record<HardwareCategory, string>>;
  assemblyTier: AssemblyTier;
  precisionTuning: boolean;
  shipping: ShippingId;
  payment: PaymentId;
  daysAgo: number;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStage;
}

/** Order history shown in the Admin Backoffice before any customer checks out. Prices come from the live catalog. */
export const CustomerOrderSeeds: readonly CustomerOrderSeed[] = [
  { customerName: 'Maya Okafor', presetId: 'apex-titan', assemblyTier: 'Extreme Benchmarking & Burn-in', precisionTuning: true, shipping: 'white-glove', payment: 'card', daysAgo: 1, paymentStatus: 'Paid', fulfillmentStatus: 'Assembly & Testing' },
  { customerName: 'Lucas Brennan', presetId: 'raptor', assemblyTier: 'Standard Validation', precisionTuning: false, shipping: 'ground', payment: 'ach', daysAgo: 2, paymentStatus: 'Pending', fulfillmentStatus: 'On Hold' },
  { customerName: 'Northwind Studios', presetId: 'vanguard', assemblyTier: 'Precision Stress-Testing', precisionTuning: false, shipping: 'express', payment: 'purchase-order', daysAgo: 4, paymentStatus: 'Pre-Authorized', fulfillmentStatus: 'Assembly & Testing' },
  { customerName: 'Priya Raman', presetId: 'vanguard', swaps: { GPU: 'gpu-rx-9070xt-nitro', Cooling: 'cool-arctic-lf3-280' }, assemblyTier: 'Standard Validation', precisionTuning: true, shipping: 'ground', payment: 'card', daysAgo: 6, paymentStatus: 'Paid', fulfillmentStatus: 'Shipped' },
  { customerName: 'Diego Alvarez', presetId: 'raptor', assemblyTier: 'Precision Stress-Testing', precisionTuning: false, shipping: 'express', payment: 'card', daysAgo: 9, paymentStatus: 'Paid', fulfillmentStatus: 'Shipped' },
  { customerName: 'Hannah Becker', presetId: 'apex-titan', swaps: { RAM: 'ram-vengeance-rgb-32' }, assemblyTier: 'Precision Stress-Testing', precisionTuning: false, shipping: 'express', payment: 'ach', daysAgo: 12, paymentStatus: 'Pending', fulfillmentStatus: 'On Hold' },
  { customerName: 'Kenji Watanabe', presetId: 'vanguard', assemblyTier: 'Standard Validation', precisionTuning: false, shipping: 'ground', payment: 'card', daysAgo: 16, paymentStatus: 'Paid', fulfillmentStatus: 'Delivered' },
  { customerName: 'Contoso Esports', presetId: 'raptor', assemblyTier: 'Extreme Benchmarking & Burn-in', precisionTuning: true, shipping: 'white-glove', payment: 'purchase-order', daysAgo: 21, paymentStatus: 'Paid', fulfillmentStatus: 'Delivered' },
  { customerName: 'Sofia Marchetti', presetId: 'apex-titan', assemblyTier: 'Standard Validation', precisionTuning: true, shipping: 'ground', payment: 'card', daysAgo: 27, paymentStatus: 'Paid', fulfillmentStatus: 'Delivered' },
  { customerName: 'Ethan Clarke', presetId: 'raptor', swaps: { Storage: 'ssd-samsung-990-pro-2tb' }, assemblyTier: 'Standard Validation', precisionTuning: false, shipping: 'ground', payment: 'card', daysAgo: 33, paymentStatus: 'Refunded', fulfillmentStatus: 'On Hold' },
  { customerName: 'Amara Nwosu', presetId: 'vanguard', assemblyTier: 'Precision Stress-Testing', precisionTuning: true, shipping: 'express', payment: 'ach', daysAgo: 38, paymentStatus: 'Paid', fulfillmentStatus: 'Delivered' },
  { customerName: 'Oliver Grant', presetId: 'apex-titan', assemblyTier: 'Extreme Benchmarking & Burn-in', precisionTuning: false, shipping: 'white-glove', payment: 'card', daysAgo: 45, paymentStatus: 'Paid', fulfillmentStatus: 'Delivered' },
  { customerName: 'Fabrikam Labs', presetId: 'vanguard', swaps: { PSU: 'psu-corsair-hx1200i' }, assemblyTier: 'Standard Validation', precisionTuning: false, shipping: 'ground', payment: 'purchase-order', daysAgo: 52, paymentStatus: 'Paid', fulfillmentStatus: 'Delivered' },
  { customerName: 'Chloe Dubois', presetId: 'raptor', assemblyTier: 'Standard Validation', precisionTuning: false, shipping: 'ground', payment: 'card', daysAgo: 58, paymentStatus: 'Paid', fulfillmentStatus: 'Delivered' }
];
