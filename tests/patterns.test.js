const EXPECTED = {
  creational: ['singleton', 'factory-method', 'builder'],
  structural: ['adapter', 'decorator', 'facade', 'proxy'],
  behavioral: ['observer', 'strategy', 'command', 'state', 'iterator'],
};

module.exports = (test, assert, DP) => {
  test('all 12 planned patterns are registered under the right category', () => {
    Object.entries(EXPECTED).forEach(([category, ids]) => {
      ids.forEach((id) => {
        const p = DP.patterns.find((x) => x.id === id);
        assert.ok(p, `${id} missing`);
        assert.strictEqual(p.category, category, `${id} should be ${category}`);
      });
    });
    assert.strictEqual(DP.patterns.length, 12);
  });

  test('every registered pattern passes validation', () => {
    const bad = DP.validate.validateAll(DP.patterns).filter((r) => r.problems.length);
    assert.deepStrictEqual(bad, []);
  });

  test('every pattern has its interactive demo registered', () => {
    DP.patterns.forEach((p) => {
      assert.strictEqual(typeof DP.demos[p.id], 'function', `DP.demos['${p.id}'] missing`);
    });
  });

  test('every diagram uses a marker id that is unique to its pattern', () => {
    const seen = new Map();
    DP.patterns.forEach((p) => {
      (p.diagram.match(/id="([^"]+)"/g) || []).forEach((attr) => {
        assert.ok(!seen.has(attr), `${attr} used by both ${seen.get(attr)} and ${p.id}`);
        seen.set(attr, p.id);
      });
    });
  });
};
