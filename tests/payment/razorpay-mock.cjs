// Loaded only by the isolated payment-test server. Production imports the official SDK.
// eslint-disable-next-line @typescript-eslint/no-require-imports -- Node preload must use CommonJS before Next starts.
const Module = require('node:module');
const orders = new Map();

class MockRazorpay {
  constructor() {
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
