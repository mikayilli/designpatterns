module.exports = (test, assert, DP) => {
  const A = () => DP.logic.adapter;

  test('fahrenheitToCelsius converts known points', () => {
    assert.strictEqual(A().fahrenheitToCelsius(32), 0);
    assert.strictEqual(A().fahrenheitToCelsius(212), 100);
    assert.strictEqual(A().fahrenheitToCelsius(77), 25);
  });

  test('celsiusToFahrenheit converts known points', () => {
    assert.strictEqual(A().celsiusToFahrenheit(0), 32);
    assert.strictEqual(A().celsiusToFahrenheit(100), 212);
    assert.strictEqual(A().celsiusToFahrenheit(25), 77);
  });

  test('conversions reject non-numbers', () => {
    assert.throws(() => A().fahrenheitToCelsius('hot'), TypeError);
    assert.throws(() => A().celsiusToFahrenheit(NaN), TypeError);
  });

  test('createFahrenheitSensor exposes readFahrenheit only', () => {
    const s = A().createFahrenheitSensor(77);
    assert.strictEqual(s.readFahrenheit(), 77);
    assert.strictEqual(s.celsius, undefined);
    assert.throws(() => A().createFahrenheitSensor('x'), TypeError);
  });

  test('createCelsiusSensor exposes celsius only', () => {
    const s = A().createCelsiusSensor(25);
    assert.strictEqual(s.celsius(), 25);
    assert.strictEqual(s.readFahrenheit, undefined);
  });

  test('the adapter gives celsius() on top of readFahrenheit()', () => {
    const adapter = A().createTemperatureAdapter(A().createFahrenheitSensor(77));
    assert.strictEqual(adapter.celsius(), 25);
  });

  test('the adapter reports the translated call to the log', () => {
    const lines = [];
    const adapter = A().createTemperatureAdapter(A().createFahrenheitSensor(77), (l) => lines.push(l));
    adapter.celsius();
    assert.deepStrictEqual(lines, ['sensor.readFahrenheit() = 77', '(77 - 32) * 5 / 9 = 25']);
  });

  test('the adapter rejects a sensor without readFahrenheit()', () => {
    assert.throws(() => A().createTemperatureAdapter({}), TypeError);
    assert.throws(() => A().createTemperatureAdapter(null), TypeError);
  });

  test('the reverse adapter gives fahrenheit() on top of celsius()', () => {
    const adapter = A().createReverseAdapter(A().createCelsiusSensor(25));
    assert.strictEqual(adapter.fahrenheit(), 77);
    assert.throws(() => A().createReverseAdapter({}), TypeError);
  });

  test('connect: matching plug and socket works directly', () => {
    const r = A().connect('celsius', 'celsius', false);
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.via, 'direct');
    assert.strictEqual(r.value, 25);
  });

  test('connect: mismatch without adapter does not fit', () => {
    const r = A().connect('fahrenheit', 'celsius', false);
    assert.strictEqual(r.ok, false);
    assert.strictEqual(r.value, null);
  });

  test('connect: mismatch with adapter works and translates', () => {
    const r = A().connect('fahrenheit', 'celsius', true);
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.via, 'adapter');
    assert.strictEqual(r.value, 25);
    assert.strictEqual(r.unit, 'C');
    assert.ok(r.lines.length >= 2);
    const back = A().connect('celsius', 'fahrenheit', true);
    assert.strictEqual(back.value, 77);
    assert.strictEqual(back.unit, 'F');
  });

  test('connect: adapter between matching ends is flagged as needless', () => {
    const r = A().connect('celsius', 'celsius', true);
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.needless, true);
    assert.strictEqual(r.value, 25);
  });

  test('connect rejects unknown kinds', () => {
    assert.throws(() => A().connect('uk', 'celsius', false), RangeError);
    assert.throws(() => A().connect('celsius', 'uk', false), RangeError);
  });
};
