module.exports = (test, assert, DP) => {
  const { SIZES, createPizzaBuilder, fromChoices, telescoping, describePizza } = DP.logic.builder;

  test('sizes are S, M and L', () => {
    assert.deepStrictEqual(SIZES, ['S', 'M', 'L']);
  });

  test('build() assembles a pizza from the chained steps', () => {
    const pizza = createPizzaBuilder().size('L').addCheese().addOlives().thinCrust().build();
    assert.deepStrictEqual(pizza, {
      size: 'L',
      toppings: ['cheese', 'olives'],
      thinCrust: true,
      extraSauce: false,
    });
  });

  test('every step returns the builder so calls can be chained', () => {
    const b = createPizzaBuilder();
    assert.strictEqual(b.size('M'), b);
    assert.strictEqual(b.addCheese(), b);
    assert.strictEqual(b.addOlives(), b);
    assert.strictEqual(b.addMushrooms(), b);
    assert.strictEqual(b.addPepperoni(), b);
    assert.strictEqual(b.thinCrust(), b);
    assert.strictEqual(b.extraSauce(), b);
  });

  test('options that were not chosen have safe defaults', () => {
    const pizza = createPizzaBuilder().size('S').build();
    assert.deepStrictEqual(pizza.toppings, []);
    assert.strictEqual(pizza.thinCrust, false);
    assert.strictEqual(pizza.extraSauce, false);
  });

  test('build() without a size throws', () => {
    assert.throws(() => createPizzaBuilder().addCheese().build(), /size is required/);
  });

  test('an invalid size is rejected as soon as it is set', () => {
    assert.throws(() => createPizzaBuilder().size('XL'), RangeError);
  });

  test('adding the same topping twice keeps it once', () => {
    const pizza = createPizzaBuilder().size('M').addCheese().addCheese().build();
    assert.deepStrictEqual(pizza.toppings, ['cheese']);
  });

  test('the built pizza is frozen and not affected by later builder calls', () => {
    const b = createPizzaBuilder().size('M').addCheese();
    const first = b.build();
    b.addOlives();
    assert.deepStrictEqual(first.toppings, ['cheese']);
    assert.ok(Object.isFrozen(first));
    assert.ok(Object.isFrozen(first.toppings));
  });

  test('chain() lists the calls made so far, from new to build', () => {
    const b = createPizzaBuilder().size('L').addCheese().thinCrust();
    assert.deepStrictEqual(b.chain(), ['new PizzaBuilder()', 'size("L")', 'addCheese()', 'thinCrust()', 'build()']);
  });

  test('fromChoices() makes the builder calls in a fixed order', () => {
    const b = fromChoices({ size: 'L', cheese: true, olives: false, mushrooms: true, pepperoni: false, thinCrust: true, extraSauce: false });
    assert.deepStrictEqual(b.chain(), ['new PizzaBuilder()', 'size("L")', 'addCheese()', 'addMushrooms()', 'thinCrust()', 'build()']);
    assert.deepStrictEqual(b.build().toppings, ['cheese', 'mushrooms']);
  });

  test('telescoping() shows the unreadable positional constructor call', () => {
    const text = telescoping({ size: 'L', cheese: true, olives: false, mushrooms: true, pepperoni: false, thinCrust: true, extraSauce: false });
    assert.strictEqual(text, 'new Pizza("L", true, false, true, false, true, false)');
  });

  test('describePizza() reads like a sentence', () => {
    const pizza = createPizzaBuilder().size('L').addCheese().addOlives().thinCrust().build();
    assert.strictEqual(describePizza(pizza), 'L pizza: cheese, olives, thin crust');
    assert.strictEqual(describePizza(createPizzaBuilder().size('S').build()), 'S pizza: plain');
  });
};
