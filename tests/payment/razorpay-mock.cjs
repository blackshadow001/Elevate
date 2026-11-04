// Loaded only by the isolated payment-test server. Production imports the official SDK.
// eslint-disable-next-line @typescript-eslint/no-require-imports -- Node preload must use CommonJS before Next starts.
const Module = require('node:module');
const orders = new Map();
const plans = new Map();
const subscriptions = new Map();

class MockRazorpay {
  constructor() {
    this.plans = {
      create: async (input) => {
        const id = `plan_mock_${plans.size + 1}`;
        const plan = { id, period: input.period, interval: input.interval, item: input.item };
        plans.set(id, plan);
        return plan;
      },
    };
    this.subscriptions = {
      create: async (input) => {
        const id = `sub_mock_${subscriptions.size + 1}`;
        const value = { id, plan_id: input.plan_id, status: 'created', paid_count: 0,
          total_count: input.total_count, current_end: null, charge_at: null,
          has_scheduled_changes: false };
        subscriptions.set(id, value);
        return value;
      },
      fetch: async (id) => {
        const value = subscriptions.get(id);
        if (!value) throw new Error('Unknown test subscription');
        return { ...value, status: value.status === 'created' ? 'active' : value.status,
          paid_count: value.status === 'created' ? 1 : value.paid_count,
          current_end: value.current_end || Math.floor(Date.now() / 1000) + 30 * 86400,
          charge_at: value.charge_at || Math.floor(Date.now() / 1000) + 30 * 86400 };
      },
      cancel: async (id, atCycleEnd) => {
        const value = subscriptions.get(id);
        if (!value) throw new Error('Unknown test subscription');
        value.status = 'cancelled';
        if (atCycleEnd) {
          value.paid_count = 1;
          value.current_end = Math.floor(Date.now() / 1000) + 30 * 86400;
        }
        value.has_scheduled_changes = Boolean(atCycleEnd);
        return value;
      },
    };
    this.orders = {
      create: async (input) => {
        const id = `order_${String(input.receipt).replace(/-/g, '')}`;
        const order = { id, amount: input.amount, currency: input.currency, receipt: input.receipt, status: 'created' };
        orders.set(id, order);
        return order;
      },
      fetch: async (id) => {
        const order = orders.get(id);
        if (!order) throw new Error('Unknown test order');
        return { ...order, status: 'paid' };
      },
      fetchPayments: async (id) => {
        const order = orders.get(id);
        if (!order) throw new Error('Unknown test order');
        return { items: [{ id: `pay_${id.slice(6)}`, order_id: id, amount: order.amount,
          currency: order.currency, status: 'captured' }] };
      },
    };
    this.payments = {
      fetch: async (id) => {
        const suffix = id.endsWith('_wrong_amount') ? '_wrong_amount' : id.endsWith('_wrong_currency') ? '_wrong_currency' : '';
        const gatewayId = `order_${id.slice(4, suffix ? -suffix.length : undefined)}`;
        const order = orders.get(gatewayId);
        if (!order) throw new Error('Unknown test payment');
        return { id, order_id: gatewayId, amount: id.endsWith('_wrong_amount') ? order.amount + 100 : order.amount,
          currency: id.endsWith('_wrong_currency') ? 'USD' : order.currency, status: 'captured' };
      },
    };
  }
}

const originalLoad = Module._load;
Module._load = function load(request, parent, isMain) {
  if (request === 'razorpay') return MockRazorpay;
  return originalLoad.call(this, request, parent, isMain);
};
