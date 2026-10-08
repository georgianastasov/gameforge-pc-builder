import { TestBed } from '@angular/core/testing';
import { calculatePricing } from '../models/hardware/build-pricing';
import { calculateCheckout } from '../models/hardware/checkout-pricing';
import { CustomerOrderSeeds } from '../static-data/customer-orders';
import { InventoryService } from './inventory.service';
import { NewOrder, OrderService } from './order.service';

const order = (payment: NewOrder['payment'] = 'card'): NewOrder => ({
  customerName: 'Alex Morgan',
  configurationName: 'GameForge Raptor',
  selection: { CPU: 'cpu-core-i7-14700k', GPU: null, Motherboard: null, RAM: null, Storage: null, Cooling: null, PSU: null, Case: null },
  lines: [{ category: 'CPU', partId: 'cpu-core-i7-14700k', name: 'Intel Core i7-14700K', price: 399 }],
  assemblyTier: 'Standard Validation',
  precisionTuning: false,
  shipping: 'ground',
  payment,
  dispatch: '3 - 5 Business Days',
  pricing: calculateCheckout(calculatePricing(399, 'Standard Validation', false), 'ground', payment)
});

describe('OrderService', () => {
  let service: OrderService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderService);
  });

  afterEach(() => localStorage.clear());

  it('creates a snapshot with a GameForge order id', () => {
    const snapshot = service.placeOrder(order());
    expect(snapshot.id).toMatch(/^GF-[0-9A-Z]+-[0-9A-Z]{4}$/);
    expect(snapshot.placedAt).toBeGreaterThan(0);
    expect(service.lastOrder()).toBe(snapshot);
  });

  it('keeps the snapshot independent of later changes to the input', () => {
    const input = order();
    const snapshot = service.placeOrder(input);
    input.selection.CPU = 'cpu-ryzen9-9950x3d';
    input.lines[0].price = 1;
    expect(snapshot.selection.CPU).toBe('cpu-core-i7-14700k');
    expect(snapshot.lines[0].price).toBe(399);
  });

  it('clears the last order', () => {
    service.placeOrder(order());
    service.clearLastOrder();
    expect(service.lastOrder()).toBeNull();
  });

  it('seeds the demo order history priced from the catalog', () => {
    const orders = service.orders();
    expect(orders.length).toBe(CustomerOrderSeeds.length);
    for (const seeded of orders) {
      expect(seeded.lines.length).toBe(8);
      expect(seeded.pricing.subtotal).toBe(seeded.lines.reduce((sum, line) => sum + line.price, 0));
      expect(seeded.pricing.finalTotal).toBeGreaterThan(seeded.pricing.subtotal);
    }
    expect(orders.map(o => o.placedAt)).toEqual([...orders.map(o => o.placedAt)].sort((a, b) => b - a));
  });

  it('adds placed orders to the history with the customer name and initial statuses', () => {
    const card = service.placeOrder(order('card'));
    const wire = service.placeOrder(order('ach'));
    expect(service.orders().length).toBe(CustomerOrderSeeds.length + 2);
    expect(service.orders().find(o => o.id === card.id)).toMatchObject({ customerName: 'Alex Morgan', paymentStatus: 'Paid', fulfillmentStatus: 'Assembly & Testing' });
    expect(service.orders().find(o => o.id === wire.id)).toMatchObject({ paymentStatus: 'Pending', fulfillmentStatus: 'On Hold' });
  });

  it('allocates one unit of each ordered part from stock', () => {
    const inventory = TestBed.inject(InventoryService);
    const before = inventory.record('cpu-core-i7-14700k').stockQuantity;
    service.placeOrder(order());
    expect(inventory.record('cpu-core-i7-14700k').stockQuantity).toBe(before - 1);
  });

  it('updates statuses and ships only funded orders in assembly', () => {
    const paid = service.placeOrder(order('card'));
    const pending = service.placeOrder(order('ach'));
    expect(service.shipOrders([paid.id, pending.id])).toBe(1);
    expect(service.orders().find(o => o.id === paid.id)?.fulfillmentStatus).toBe('Shipped');
    expect(service.orders().find(o => o.id === pending.id)?.fulfillmentStatus).toBe('On Hold');

    expect(service.updateStatus([pending.id], { paymentStatus: 'Paid', fulfillmentStatus: 'Assembly & Testing' })).toBe(1);
    expect(service.updateStatus([pending.id], { paymentStatus: 'Paid' })).toBe(0);
  });

  it('persists the history, including status changes, across service instances', () => {
    const placed = service.placeOrder(order());
    service.updateStatus([placed.id], { fulfillmentStatus: 'Delivered' });

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const restored = TestBed.inject(OrderService);
    expect(restored.orders().find(o => o.id === placed.id)).toMatchObject({ customerName: 'Alex Morgan', fulfillmentStatus: 'Delivered' });
    expect(restored.lastOrder()).toBeNull();
  });

  it('falls back to the seeded history when saved orders are corrupt', () => {
    localStorage.setItem('gameforge.orders', '{not json');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    expect(TestBed.inject(OrderService).orders().length).toBe(CustomerOrderSeeds.length);
  });
});
