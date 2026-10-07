(function (DP) {
  const PAYMENT_TYPES = ['card', 'cash', 'transfer'];

  // Products: every payment can pay(amount). The Checkout never needs to know which one it has.
  const PRODUCTS = {
    card: { className: 'CardPayment', pay: (amount) => `Card: charged ${amount} AZN` },
    cash: { className: 'CashPayment', pay: (amount) => `Cash: take ${amount} AZN from the customer` },
    transfer: { className: 'TransferPayment', pay: (amount) => `Transfer: waiting for ${amount} AZN to arrive` },
  };

  // Creators: one Checkout subclass per payment type. Each overrides createPayment()
  // (the factory method) and returns its own kind of payment.
  const CREATORS = {
    card: 'CardCheckout',
    cash: 'CashCheckout',
    transfer: 'TransferCheckout',
  };

  function createPaymentOf(type) {
    const product = PRODUCTS[type];
    return { className: product.className, pay: product.pay };
  }

  function createCheckout(type) {
    if (!PAYMENT_TYPES.includes(type)) {
      throw new Error(`Unknown payment type: ${String(type)}`);
    }
    return {
      className: CREATORS[type],
      // the factory method
      createPayment() {
        return createPaymentOf(type);
      },
      // the shared code: works with whatever payment the factory method returned
      process(amount) {
        if (typeof amount !== 'number') throw new TypeError('amount must be a number');
        if (!Number.isFinite(amount) || amount <= 0) throw new RangeError('amount must be greater than 0');
        const payment = this.createPayment();
        return { checkout: this.className, payment: payment.className, message: payment.pay(amount) };
      },
    };
  }

  DP.logic['factory-method'] = { PAYMENT_TYPES, createCheckout };
})(window.DP);
