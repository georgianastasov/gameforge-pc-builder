import { FulfillmentStage, PaymentStatus } from '../models/store/order-status';
import { OrderSnapshot } from '../services/order.service';

export type OrderQueueId = 'all' | 'pending-payment' | 'in-assembly' | 'shipped' | 'delivered';

/** The "Queue View" chips from the App Builder design. */
export const ORDER_QUEUES: readonly { id: OrderQueueId; label: string; icon: string; matches: (order: OrderSnapshot) => boolean }[] = [
  { id: 'all', label: 'All Orders', icon: 'receipt_long', matches: () => true },
  { id: 'pending-payment', label: 'Pending Payment', icon: 'hourglass_empty', matches: order => order.paymentStatus === 'Pending' },
  { id: 'in-assembly', label: 'In Assembly', icon: 'build', matches: order => order.fulfillmentStatus === 'Assembly & Testing' },
  { id: 'shipped', label: 'Shipped', icon: 'local_shipping', matches: order => order.fulfillmentStatus === 'Shipped' },
  { id: 'delivered', label: 'Delivered', icon: 'check_circle', matches: order => order.fulfillmentStatus === 'Delivered' }
];

export interface OrderCriteria {
  queue: OrderQueueId;
  search: string;
  payment: PaymentStatus | 'all' | undefined;
  stage: FulfillmentStage | 'all' | undefined;
}

/** One row of the Orders Management grid. */
export interface OrderRow {
  id: string;
  customerName: string;
  orderDate: Date;
  configurationName: string;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStage;
}

export function toOrderRow(order: OrderSnapshot): OrderRow {
  return {
    id: order.id,
    customerName: order.customerName,
    orderDate: new Date(order.placedAt),
    configurationName: order.configurationName,
    totalAmount: order.pricing.finalTotal,
    paymentStatus: order.paymentStatus,
    fulfillmentStatus: order.fulfillmentStatus
  };
}

export function queueCount(orders: readonly OrderSnapshot[], queue: OrderQueueId): number {
  const matches = ORDER_QUEUES.find(q => q.id === queue)?.matches ?? (() => true);
  return orders.filter(matches).length;
}

/** Applies the queue chip, the search box, and both status selects. */
export function filterOrders(orders: readonly OrderSnapshot[], { queue, search, payment, stage }: OrderCriteria): OrderSnapshot[] {
  const matchesQueue = ORDER_QUEUES.find(q => q.id === queue)?.matches ?? (() => true);
  const term = search.trim().toLowerCase();
  return orders.filter(order =>
    matchesQueue(order)
    && (!term || order.id.toLowerCase().includes(term) || order.customerName.toLowerCase().includes(term))
    && (!payment || payment === 'all' || order.paymentStatus === payment)
    && (!stage || stage === 'all' || order.fulfillmentStatus === stage)
  );
}
