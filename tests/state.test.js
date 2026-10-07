module.exports = (test, assert, DP) => {
  const S = DP.state;

  test('parseHash splits id and params', () => {
    assert.deepStrictEqual(S.parseHash('#observer?lang=en&code=java'), {
      id: 'observer',
      params: { lang: 'en', code: 'java' },
    });
  });

  test('parseHash handles empty input', () => {
    assert.deepStrictEqual(S.parseHash(''), { id: '', params: {} });
    assert.deepStrictEqual(S.parseHash(undefined), { id: '', params: {} });
  });

  test('parseHash skips malformed percent-encoding instead of throwing', () => {
    assert.deepStrictEqual(S.parseHash('#x?lang=%E0%A4%A&code=php'), {
      id: 'x',
      params: { code: 'php' },
    });
  });

  test('buildHash writes id, lang and code', () => {
    assert.strictEqual(
      S.buildHash('strategy', { lang: 'az', code: 'php', theme: 'dark' }),
      '#strategy?lang=az&code=php'
    );
  });

  test('params beat stored, stored beats defaults', () => {
    const r = S.resolveSettings({ lang: 'en' }, { lang: 'az', code: 'php', theme: 'dark' });
    assert.deepStrictEqual(r, { lang: 'en', code: 'php', theme: 'dark' });
  });

  test('invalid values are ignored', () => {
    const r = S.resolveSettings({ lang: 'fr', code: 'rust' }, { theme: 'neon' });
    assert.deepStrictEqual(r, { lang: 'az', code: 'js', theme: 'light' });
  });

  test('resolveSettings works with no input', () => {
    assert.deepStrictEqual(S.resolveSettings(undefined, null), { lang: 'az', code: 'js', theme: 'light' });
  });

  test('loadStored returns an object even when storage is unavailable', () => {
    assert.deepStrictEqual(S.loadStored(), {});
  });
};
