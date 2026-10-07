module.exports = (test, assert, DP) => {
  const D = () => DP.logic.decorator;

  test('a plain coffee has a description and a price', () => {
    const c = D().createCoffee();
    assert.strictEqual(c.description(), 'Coffee');
    assert.strictEqual(c.cost(), 300);
  });

  test('a decorator adds its cost and description to the wrapped drink', () => {
    const c = D().createDecorator('milk', D().createCoffee());
    assert.strictEqual(c.description(), 'Coffee, Milk');
    assert.strictEqual(c.cost(), 350);
  });

  test('decorators stack and accumulate in wrapping order', () => {
    let c = D().createCoffee();
    c = D().createDecorator('milk', c);
    c = D().createDecorator('sugar', c);
    c = D().createDecorator('syrup', c);
    assert.strictEqual(c.description(), 'Coffee, Milk, Sugar, Syrup');
    assert.strictEqual(c.cost(), 300 + 50 + 20 + 60);
  });

  test('the same extra can be added twice (double milk)', () => {
    let c = D().createCoffee();
    c = D().createDecorator('milk', c);
    c = D().createDecorator('milk', c);
    assert.strictEqual(c.description(), 'Coffee, Milk, Milk');
    assert.strictEqual(c.cost(), 400);
  });

  test('wrapping does not change the inner drink', () => {
    const base = D().createCoffee();
    D().createDecorator('cream', base);
    assert.strictEqual(base.cost(), 300);
    assert.strictEqual(base.description(), 'Coffee');
  });

  test('getLayers lists names from the inside out', () => {
    let c = D().createDecorator('milk', D().createCoffee());
    c = D().createDecorator('cream', c);
    assert.deepStrictEqual(D().getLayers(c), ['Coffee', 'Milk', 'Cream']);
  });

  test('createDecorator rejects an unknown extra or a missing drink', () => {
    assert.throws(() => D().createDecorator('ketchup', D().createCoffee()), RangeError);
    assert.throws(() => D().createDecorator('milk', null), TypeError);
    assert.throws(() => D().createDecorator('milk', {}), TypeError);
  });

  test('subclassCount doubles with every extra (2^n)', () => {
    assert.strictEqual(D().subclassCount(0), 1);
    assert.strictEqual(D().subclassCount(1), 2);
    assert.strictEqual(D().subclassCount(4), 16);
  });

  test('subclassCount rejects negative or non-integer input', () => {
    assert.throws(() => D().subclassCount(-1), RangeError);
    assert.throws(() => D().subclassCount(1.5), RangeError);
    assert.throws(() => D().subclassCount('3'), TypeError);
  });

  test('formatPrice shows AZN with two decimals', () => {
    assert.strictEqual(D().formatPrice(350), '3.50 AZN');
    assert.strictEqual(D().formatPrice(300), '3.00 AZN');
  });
};
