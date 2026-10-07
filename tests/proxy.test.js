module.exports = (test, assert, DP) => {
  const { createStats, createRealImage, createImageProxy } = DP.logic.proxy;

  test('creating a RealImage counts as one real load', () => {
    const stats = createStats();
    const img = createRealImage('cat.jpg', stats);
    assert.strictEqual(stats.realLoads, 1);
    assert.strictEqual(img.display(), 'Showing cat.jpg');
  });

  test('creating a proxy does NOT load the real image', () => {
    const stats = createStats();
    const proxy = createImageProxy('cat.jpg', { stats });
    assert.strictEqual(stats.realLoads, 0);
    assert.strictEqual(proxy.isLoaded(), false);
  });

  test('the first display() loads once, later calls use the cache', () => {
    const stats = createStats();
    const proxy = createImageProxy('cat.jpg', { stats });
    assert.strictEqual(proxy.display(), 'Showing cat.jpg');
    proxy.display();
    proxy.display();
    assert.strictEqual(stats.realLoads, 1);
    assert.strictEqual(stats.displayCalls, 3);
    assert.strictEqual(proxy.isLoaded(), true);
  });

  test('the proxy and the real image have the same interface', () => {
    const stats = createStats();
    const real = createRealImage('a.jpg', stats);
    const proxy = createImageProxy('a.jpg', { stats });
    assert.strictEqual(typeof real.display, 'function');
    assert.strictEqual(proxy.display(), real.display());
  });

  test('canView() = false blocks display() and loads nothing', () => {
    const stats = createStats();
    const proxy = createImageProxy('secret.jpg', { stats, canView: () => false });
    assert.throws(() => proxy.display(), /access denied/i);
    assert.strictEqual(stats.realLoads, 0);
    assert.strictEqual(proxy.isLoaded(), false);
  });

  test('access is checked on every call, even after caching', () => {
    const stats = createStats();
    let allowed = true;
    const proxy = createImageProxy('secret.jpg', { stats, canView: () => allowed });
    proxy.display();
    allowed = false;
    assert.throws(() => proxy.display(), /access denied/i);
    allowed = true;
    proxy.display();
    assert.strictEqual(stats.realLoads, 1);
  });

  test('a blocked call is not counted as a display', () => {
    const stats = createStats();
    const proxy = createImageProxy('s.jpg', { stats, canView: () => false });
    assert.throws(() => proxy.display());
    assert.strictEqual(stats.displayCalls, 0);
  });

  test('filename must be a non-empty string', () => {
    assert.throws(() => createImageProxy('', { stats: createStats() }), TypeError);
    assert.throws(() => createRealImage(5, createStats()), TypeError);
  });

  test('createImageProxy() needs stats', () => {
    assert.throws(() => createImageProxy('a.jpg', {}), TypeError);
  });
};
