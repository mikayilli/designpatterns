module.exports = (test, assert, DP) => {
  const { createSubject } = DP.logic.observer;

  test('notify calls every subscriber with the data', () => {
    const s = createSubject();
    const got = [];
    s.subscribe((d) => got.push('a:' + d));
    s.subscribe((d) => got.push('b:' + d));
    s.notify('hi');
    assert.deepStrictEqual(got, ['a:hi', 'b:hi']);
  });

  test('the function returned by subscribe unsubscribes', () => {
    const s = createSubject();
    let calls = 0;
    const off = s.subscribe(() => (calls += 1));
    off();
    s.notify();
    assert.strictEqual(calls, 0);
    assert.strictEqual(s.count(), 0);
  });

  test('subscribing the same function twice registers it once', () => {
    const s = createSubject();
    const fn = () => {};
    s.subscribe(fn);
    s.subscribe(fn);
    assert.strictEqual(s.count(), 1);
  });

  test('unsubscribing during notify does not skip other subscribers', () => {
    const s = createSubject();
    const calls = [];
    const a = () => {
      calls.push('a');
      s.unsubscribe(a);
    };
    const b = () => calls.push('b');
    s.subscribe(a);
    s.subscribe(b);
    s.notify();
    assert.deepStrictEqual(calls, ['a', 'b']);
    assert.strictEqual(s.count(), 1);
  });

  test('subscribing a non-function throws', () => {
    const s = createSubject();
    assert.throws(() => s.subscribe('nope'), TypeError);
  });

  // WeatherStation: mirrors the code samples (subscribe / unsubscribe / setTemperature)
  const { createStation } = DP.logic.observer;

  test('station notifies subscribers with the new temperature', () => {
    const st = createStation(20);
    const got = [];
    st.subscribe((t) => got.push('phone:' + t));
    st.subscribe((t) => got.push('web:' + t));
    st.setTemperature(25);
    assert.deepStrictEqual(got, ['phone:25', 'web:25']);
    assert.strictEqual(st.getTemperature(), 25);
  });

  test('station keeps the temperature even with no subscribers', () => {
    const st = createStation(20);
    st.setTemperature(18);
    assert.strictEqual(st.getTemperature(), 18);
    assert.strictEqual(st.count(), 0);
  });

  test('an unsubscribed listener stops receiving updates', () => {
    const st = createStation(20);
    const got = [];
    const phone = (t) => got.push(t);
    st.subscribe(phone);
    st.setTemperature(21);
    st.unsubscribe(phone);
    st.setTemperature(22);
    assert.deepStrictEqual(got, [21]);
  });

  test('station rejects a non-numeric temperature', () => {
    const st = createStation(20);
    assert.throws(() => st.setTemperature('hot'), TypeError);
  });
};
