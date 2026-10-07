module.exports = (test, assert, DP) => {
  const silently = (fn) => {
    const warn = console.warn;
    console.warn = () => {};
    try {
      return fn();
    } finally {
      console.warn = warn;
    }
  };

  test('t returns the string for a known key', () => {
    assert.strictEqual(DP.i18n.t('az', 'problem'), 'Problem');
    assert.strictEqual(DP.i18n.t('en', 'badCode'), 'Problematic code');
  });

  test('t falls back to en when the key is missing in the requested language', () => {
    DP.i18n.strings.en.__tmp = 'fallback';
    try {
      assert.strictEqual(silently(() => DP.i18n.t('az', '__tmp')), 'fallback');
    } finally {
      delete DP.i18n.strings.en.__tmp;
    }
  });

  test('t returns the key itself when missing everywhere', () => {
    assert.strictEqual(silently(() => DP.i18n.t('az', '__nope')), '__nope');
  });

  test('text returns the requested language block', () => {
    const p = { id: 'x', text: { az: { summary: 'AZ' }, en: { summary: 'EN' } } };
    assert.strictEqual(DP.i18n.text(p, 'az').summary, 'AZ');
  });

  test('text falls back to en when the language block is missing', () => {
    const p = { id: 'x', text: { en: { summary: 'EN' } } };
    assert.strictEqual(silently(() => DP.i18n.text(p, 'az')).summary, 'EN');
  });
};
