module.exports = (test, assert, DP) => {
  const { shippingPrice, STRATEGY_NAMES } = DP.logic.strategy;

  test('lists the three strategies in display order', () => {
    assert.deepStrictEqual(STRATEGY_NAMES, ['post', 'courier', 'express']);
  });

  test('post, courier and express prices for 10 kg', () => {
    assert.strictEqual(shippingPrice('post', 10), 8);
    assert.strictEqual(shippingPrice('courier', 10), 14);
    assert.strictEqual(shippingPrice('express', 10), 27);
  });

  test('prices are rounded to 2 decimals', () => {
    assert.strictEqual(shippingPrice('courier', 0.1), 6.08);
  });

  test('unknown strategy throws', () => {
    assert.throws(() => shippingPrice('drone', 5), /Unknown strategy: drone/);
    assert.throws(() => shippingPrice('constructor', 5), /Unknown strategy/);
  });

  test('negative or non-numeric weight throws RangeError', () => {
    assert.throws(() => shippingPrice('post', -1), RangeError);
    assert.throws(() => shippingPrice('post', NaN), RangeError);
  });

  // createShipping: mirrors the JS sample (strategies map + adding a new entry)
  const { createShipping } = DP.logic.strategy;

  test('createShipping starts with the three built-in strategies', () => {
    const s = createShipping();
    assert.deepStrictEqual(s.names(), ['post', 'courier', 'express']);
    assert.strictEqual(s.price('express', 10), 27);
  });

  test('add() registers a new strategy without touching the others', () => {
    const s = createShipping();
    s.add('drone', (kg) => 20 + kg * 2);
    assert.deepStrictEqual(s.names(), ['post', 'courier', 'express', 'drone']);
    assert.strictEqual(s.price('drone', 10), 40);
    assert.strictEqual(s.price('post', 10), 8);
  });

  test('add() rejects duplicates and non-functions', () => {
    const s = createShipping();
    assert.throws(() => s.add('post', (kg) => kg), /already exists/);
    assert.throws(() => s.add('x', 'nope'), TypeError);
  });

  test('each createShipping instance is independent', () => {
    const a = createShipping();
    const b = createShipping();
    a.add('drone', (kg) => kg);
    assert.deepStrictEqual(b.names(), ['post', 'courier', 'express']);
  });
};
