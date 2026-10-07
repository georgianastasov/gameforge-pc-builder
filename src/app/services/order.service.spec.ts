import { TestBed } from '@angular/core/testing';
import { calculatePricing } from '../models/hardware/build-pricing';
import { calculateCheckout } from '../models/hardware/checkout-pricing';
import { NewOrder, OrderService } from './order.service';

const order = (): NewOrder => ({
  configurationName: 'GameForge Raptor',
  selection: { CPU: 'cpu-core-i7-14700k', GPU: null, Motherboard: null, RAM: null, Storage: null, Cooling: null, PSU: null, Case: null },
  lines: [{ category: 'CPU', partId: 'cpu-core-i7-14700k', name: 'Intel Core i7-14700K', price: 399 }],
  assemblyTier: 'Standard Validation',
  precisionTuning: false,
  shipping: 'ground',
  payment: 'card',
  dispatch: '3 - 5 Business Days',
  pricing: calculateCheckout(calculatePricing(399, 'Standard Validation', false), 'ground', 'card')
});

describe('OrderService', () => {
  let service: OrderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderService);
  });

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
});
