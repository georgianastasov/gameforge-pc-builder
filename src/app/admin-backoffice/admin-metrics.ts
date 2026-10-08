import { InventoryRecord, needsReorder } from '../models/store/inventory';
import { OrderSnapshot } from '../services/order.service';

const PERIOD_MS = 30 * 24 * 60 * 60 * 1000;

/** The four KPI cards at the top of the Backoffice. */
export interface AdminOverview {
  totalOrders: number;
  /** Orders placed in the last 30 days vs the 30 before; `null` without a baseline. */
  ordersTrendPct: number | null;
  /** Not yet shipped: in assembly or on hold. */
  pendingOrders: number;
  onHoldOrders: number;
  /** Charged totals, excluding refunds. */
  grossRevenue: number;
  revenueTrendPct: number | null;
  averageOrderValue: number;
  lowStockCount: number;
  outOfStockCount: number;
}

const trend = (current: number, previous: number) => previous > 0 ? Math.round(((current - previous) / previous) * 1000) / 10 : null;

export function summarizeBackoffice(orders: readonly OrderSnapshot[], listedInventory: readonly InventoryRecord[], now: number): AdminOverview {
  const revenueOrders = orders.filter(order => order.paymentStatus !== 'Refunded');
  const grossRevenue = revenueOrders.reduce((sum, order) => sum + order.pricing.finalTotal, 0);
  const inPeriod = (order: OrderSnapshot, periodsAgo: number) =>
    order.placedAt > now - PERIOD_MS * (periodsAgo + 1) && order.placedAt <= now - PERIOD_MS * periodsAgo;
  const revenueIn = (periodsAgo: number) => revenueOrders.filter(order => inPeriod(order, periodsAgo)).reduce((sum, order) => sum + order.pricing.finalTotal, 0);

  return {
    totalOrders: orders.length,
    ordersTrendPct: trend(orders.filter(order => inPeriod(order, 0)).length, orders.filter(order => inPeriod(order, 1)).length),
    pendingOrders: orders.filter(order => order.fulfillmentStatus === 'Assembly & Testing' || order.fulfillmentStatus === 'On Hold').length,
    onHoldOrders: orders.filter(order => order.fulfillmentStatus === 'On Hold').length,
    grossRevenue,
    revenueTrendPct: trend(revenueIn(0), revenueIn(1)),
    averageOrderValue: revenueOrders.length ? grossRevenue / revenueOrders.length : 0,
    lowStockCount: listedInventory.filter(needsReorder).length,
    outOfStockCount: listedInventory.filter(record => record.stockQuantity <= 0).length
  };
}
