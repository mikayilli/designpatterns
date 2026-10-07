module.exports = (test, assert, DP) => {
  const { PAYMENT_TYPES, createCheckout } = DP.logic['factory-method'];

  test('there are three payment types', () => {
    assert.deepStrictEqual(PAYMENT_TYPES, ['card', 'cash', 'transfer']);
  });

  test('each checkout creates its own kind of payment', () => {
    assert.strictEqual(createCheckout('card').className, 'CardCheckout');
    assert.strictEqual(createCheckout('card').createPayment().className, 'CardPayment');
    assert.strictEqual(createCheckout('cash').createPayment().className, 'CashPayment');
    assert.strictEqual(createCheckout('transfer').createPayment().className, 'TransferPayment');
  });

  test('createPayment() returns a fresh object each time', () => {
    const checkout = createCheckout('card');
    assert.notStrictEqual(checkout.createPayment(), checkout.createPayment());
  });

  test('process() uses the payment made by the factory method', () => {
    const r = createCheckout('card').process(50);
    assert.deepStrictEqual(r, { checkout: 'CardCheckout', payment: 'CardPayment', message: 'Card: charged 50 AZN' });
  });

  test('every payment type prints its own message', () => {
    assert.strictEqual(createCheckout('cash').process(10).message, 'Cash: take 10 AZN from the customer');
    assert.strictEqual(createCheckout('transfer').process(7.5).message, 'Transfer: waiting for 7.5 AZN to arrive');
  });

  test('unknown payment type throws a clear error', () => {
    assert.throws(() => createCheckout('bitcoin'), /unknown payment type/i);
    assert.throws(() => createCheckout(), Error);
  });

  test('amount must be a positive finite number', () => {
    const checkout = createCheckout('card');
    assert.throws(() => checkout.process(0), RangeError);
    assert.throws(() => checkout.process(-5), RangeError);
    assert.throws(() => checkout.process(NaN), RangeError);
    assert.throws(() => checkout.process('10'), TypeError);
  });
};
