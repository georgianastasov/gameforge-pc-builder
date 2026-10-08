import { calculatePricing } from '../models/hardware/build-pricing';
import { calculateCheckout } from '../models/hardware/checkout-pricing';
import { InventoryRecord } from '../models/store/inventory';
import { FulfillmentStage, PaymentStatus } from '../models/store/order-status';
import { OrderSnapshot } from '../services/order.service';
import { summarizeBackoffice } from './admin-metrics';
import { applyCategoryFields, createPartForm, readPartDraft } from './part-form';
import { filterOrders, queueCount } from './order-queue';

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 9, 8);

function order(id: string, customerName: string, total: number, daysAgo: number, paymentStatus: PaymentStatus, fulfillmentStatus: FulfillmentStage): OrderSnapshot {
  const pricing = { ...calculateCheckout(calculatePricing(total, 'Standard Validation', false), 'ground', 'card'), finalTotal: total };
  return {
    id, customerName, placedAt: NOW - daysAgo * DAY, configurationName: 'GameForge Raptor',
    selection: { CPU: null, GPU: null, Motherboard: null, RAM: null, Storage: null, Cooling: null, PSU: null, Case: null },
    lines: [], assemblyTier: 'Standard Validation', precisionTuning: false, shipping: 'ground', payment: 'card', dispatch: '',
    pricing, paymentStatus, fulfillmentStatus
  };
}

const orders = [
  order('GF-A', 'Maya Okafor', 3000, 1, 'Paid', 'Assembly & Testing'),
  order('GF-B', 'Lucas Brennan', 2000, 5, 'Pending', 'On Hold'),
  order('GF-C', 'Kenji Watanabe', 1000, 40, 'Paid', 'Delivered'),
  order('GF-D', 'Ethan Clarke', 5000, 45, 'Refunded', 'On Hold')
];

describe('order queue filters', () => {
  it('counts each queue', () => {
    expect(queueCount(orders, 'all')).toBe(4);
    expect(queueCount(orders, 'pending-payment')).toBe(1);
    expect(queueCount(orders, 'in-assembly')).toBe(1);
    expect(queueCount(orders, 'delivered')).toBe(1);
  });

  it('combines queue, search and status filters', () => {
    expect(filterOrders(orders, { queue: 'all', search: 'gf-c', payment: undefined, stage: undefined }).map(o => o.id)).toEqual(['GF-C']);
    expect(filterOrders(orders, { queue: 'all', search: 'brennan', payment: 'all', stage: 'all' }).map(o => o.id)).toEqual(['GF-B']);
    expect(filterOrders(orders, { queue: 'all', search: '', payment: 'Paid', stage: undefined }).map(o => o.id)).toEqual(['GF-A', 'GF-C']);
    expect(filterOrders(orders, { queue: 'in-assembly', search: '', payment: 'Pending', stage: undefined })).toEqual([]);
  });
});

describe('backoffice overview', () => {
  const stock = (partId: string, stockQuantity: number, reorderThreshold = 5): InventoryRecord => ({ partId, stockQuantity, reorderThreshold, availabilityMode: 'auto' });

  it('derives the KPI cards from orders and stock', () => {
    const overview = summarizeBackoffice(orders, [stock('a', 20), stock('b', 5), stock('c', 0)], NOW);
    expect(overview.totalOrders).toBe(4);
    // Two orders in the last 30 days vs two in the 30 before.
    expect(overview.ordersTrendPct).toBe(0);
    expect(overview.pendingOrders).toBe(3);
    expect(overview.onHoldOrders).toBe(2);
    // Refunds are excluded from revenue.
    expect(overview.grossRevenue).toBe(6000);
    expect(overview.averageOrderValue).toBe(2000);
    expect(overview.revenueTrendPct).toBe(400);
    expect(overview.lowStockCount).toBe(2);
    expect(overview.outOfStockCount).toBe(1);
  });

  it('reports no trend without a previous period', () => {
    expect(summarizeBackoffice(orders.slice(0, 2), [], NOW).ordersTrendPct).toBeNull();
  });
});

describe('add component form', () => {
  it('enables only the fields for the chosen category', () => {
    const form = createPartForm();
    applyCategoryFields(form);
    expect(form.controls.socket.enabled).toBe(true);
    expect(form.controls.lengthMm.enabled).toBe(false);

    form.controls.category.setValue('Cooling');
    form.controls.coolerType.setValue('air');
    applyCategoryFields(form);
    expect(form.controls.heightMm.enabled).toBe(true);
    expect(form.controls.radiatorMm.enabled).toBe(false);
    expect(form.controls.supportedSockets.enabled).toBe(true);
    expect(form.controls.socket.enabled).toBe(false);
  });

  it('defaults the interface to one valid for the category', () => {
    const form = createPartForm();
    form.controls.category.setValue('Storage');
    applyCategoryFields(form);
    expect(form.controls.interfaceType.value).toBe('M.2 2280 PCIe 5.0 x4');
  });

  it('is valid once the common and category fields are filled, and reads into a draft', () => {
    const form = createPartForm();
    form.patchValue({ category: 'Case', name: 'Lancool 217', brand: 'Lian Li', price: 109.99, initialStock: 12, benchmarkScore: 8200, specsDetail: 'Mesh front', tdpWattage: 6, maxGpuLengthMm: 380, maxCoolerHeightMm: 180 });
    applyCategoryFields(form);
    expect(form.valid).toBe(true);
    form.controls.supportedFormFactors.patchValue({ ATX: false, 'Micro-ATX': false, 'Mini-ITX': false });
    expect(form.valid).toBe(false);
    form.controls.supportedFormFactors.patchValue({ 'E-ATX': true });
    expect(readPartDraft(form)).toMatchObject({ category: 'Case', supportedFormFactors: ['E-ATX'], maxGpuLengthMm: 380, price: 109.99 });
  });
});
