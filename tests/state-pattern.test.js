module.exports = (test, assert, DP) => {
  const { createOrder, ACTIONS, STATES } = DP.logic.state;

  test('a new order starts in the "new" state', () => {
    const o = createOrder();
    assert.strictEqual(o.getState(), 'new');
    assert.strictEqual(o.getStateName(), 'NewState');
  });

  test('the happy path goes new -> paid -> shipped -> delivered', () => {
    const o = createOrder();
    o.pay();
    assert.strictEqual(o.getState(), 'paid');
    o.ship();
    assert.strictEqual(o.getState(), 'shipped');
    o.deliver();
    assert.strictEqual(o.getState(), 'delivered');
  });

  test('an order can be cancelled while new or paid', () => {
    const a = createOrder();
    a.cancel();
    assert.strictEqual(a.getState(), 'cancelled');
    const b = createOrder();
    b.pay();
    b.cancel();
    assert.strictEqual(b.getState(), 'cancelled');
  });

  test('an illegal action throws a clear error and keeps the state', () => {
    const o = createOrder();
    assert.throws(() => o.ship(), /Cannot ship an order in NewState/);
    assert.strictEqual(o.getState(), 'new');
    o.pay();
    assert.throws(() => o.pay(), /Cannot pay an order in PaidState/);
  });

  test('a shipped order cannot be cancelled', () => {
    const o = createOrder();
    o.pay();
    o.ship();
    assert.throws(() => o.cancel(), /Cannot cancel an order in ShippedState/);
  });

  test('delivered and cancelled are final: nothing is allowed', () => {
    const d = createOrder();
    d.pay();
    d.ship();
    d.deliver();
    assert.deepStrictEqual(d.allowed(), []);
    const c = createOrder();
    c.cancel();
    assert.deepStrictEqual(c.allowed(), []);
    assert.throws(() => c.pay(), Error);
  });

  test('allowed() lists the actions of the current state', () => {
    const o = createOrder();
    assert.deepStrictEqual(o.allowed(), ['pay', 'cancel']);
    o.pay();
    assert.deepStrictEqual(o.allowed(), ['ship', 'cancel']);
    o.ship();
    assert.deepStrictEqual(o.allowed(), ['deliver']);
  });

  test('can(action) agrees with allowed() and rejects unknown actions', () => {
    const o = createOrder();
    ACTIONS.forEach((a) => assert.strictEqual(o.can(a), o.allowed().includes(a)));
    assert.throws(() => o.can('fly'), TypeError);
  });

  test('exports the list of states and actions', () => {
    assert.deepStrictEqual(STATES, ['new', 'paid', 'shipped', 'delivered', 'cancelled']);
    assert.deepStrictEqual(ACTIONS, ['pay', 'ship', 'deliver', 'cancel']);
  });

  test('perform(action) delegates to the same methods', () => {
    const o = createOrder();
    o.perform('pay');
    assert.strictEqual(o.getState(), 'paid');
    assert.throws(() => o.perform('fly'), TypeError);
  });
};
