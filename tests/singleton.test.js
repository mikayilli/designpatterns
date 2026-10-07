module.exports = (test, assert, DP) => {
  const { createNaive, createSingleton } = DP.logic.singleton;

  test('naive: every open() creates a brand new connection', () => {
    const app = createNaive();
    const a = app.open();
    const b = app.open();
    assert.notStrictEqual(a, b);
    assert.strictEqual(a.id, 1);
    assert.strictEqual(b.id, 2);
    assert.strictEqual(app.created(), 2);
  });

  test('singleton: getInstance() always returns the same object', () => {
    const db = createSingleton();
    const a = db.getInstance();
    const b = db.getInstance();
    assert.strictEqual(a, b);
    assert.strictEqual(a.id, 1);
  });

  test('singleton: the connection is created only once, on first use', () => {
    const db = createSingleton();
    assert.strictEqual(db.created(), 0);
    db.getInstance();
    db.getInstance();
    db.getInstance();
    assert.strictEqual(db.created(), 1);
  });

  test('singleton: calling new directly is refused with a helpful error', () => {
    const db = createSingleton();
    assert.throws(() => db.tryNew(), /getInstance/);
    assert.strictEqual(db.created(), 0);
    db.getInstance();
    assert.throws(() => db.tryNew(), Error);
    assert.strictEqual(db.created(), 1);
  });

  test('two separate singletons do not share their instance', () => {
    const one = createSingleton();
    const two = createSingleton();
    assert.notStrictEqual(one.getInstance(), two.getInstance());
  });

  test('a connection runs a query and reports which connection ran it', () => {
    const conn = createNaive().open();
    assert.strictEqual(conn.query('SELECT 1'), 'connection #1 ran: SELECT 1');
  });

  test('query rejects an empty or non-string sql', () => {
    const conn = createNaive().open();
    assert.throws(() => conn.query(''), TypeError);
    assert.throws(() => conn.query(42), TypeError);
  });
};
