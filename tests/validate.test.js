module.exports = (test, assert, DP) => {
  const V = DP.validate;

  const good = () => ({
    id: 'x',
    name: 'X',
    category: 'behavioral',
    text: {
      az: { summary: 's', analogy: 'an', problem: 'p', solution: 'so', avoid: 'a', avoidWhen: ['w'], overkillNote: 'n', usedIn: ['u'] },
      en: { summary: 's', analogy: 'an', problem: 'p', solution: 'so', avoid: 'a', avoidWhen: ['w'], overkillNote: 'n', usedIn: ['u'] },
    },
    diagram: '<svg></svg>',
    diagramLabel: { az: 'd', en: 'd' },
    mount() {},
    code: {
      bad: { cpp: 'c', java: 'c', js: 'c', php: 'c' },
      good: { cpp: 'c', java: 'c', js: 'c', php: 'c' },
      overkill: { cpp: 'c', java: 'c', js: 'c', php: 'c' },
      simple: { cpp: 'c', java: 'c', js: 'c', php: 'c' },
    },
  });

  test('a complete pattern has no problems', () => {
    assert.deepStrictEqual(V.validatePattern(good()), []);
  });

  test('missing az text is reported', () => {
    const p = good();
    delete p.text.az;
    assert.ok(V.validatePattern(p).includes('text.az missing'));
  });

  test('empty text field is reported', () => {
    const p = good();
    p.text.en.problem = '  ';
    assert.ok(V.validatePattern(p).includes('text.en.problem missing'));
  });

  test('missing analogy is reported', () => {
    const p = good();
    delete p.text.az.analogy;
    assert.ok(V.validatePattern(p).includes('text.az.analogy missing'));
  });

  test('missing avoidWhen examples are reported', () => {
    const p = good();
    p.text.az.avoidWhen = [];
    assert.ok(V.validatePattern(p).includes('text.az.avoidWhen missing'));
  });

  test('missing overkillNote is reported', () => {
    const p = good();
    delete p.text.en.overkillNote;
    assert.ok(V.validatePattern(p).includes('text.en.overkillNote missing'));
  });

  test('missing overkill / simple code is reported', () => {
    const p = good();
    delete p.code.overkill.java;
    delete p.code.simple;
    const problems = V.validatePattern(p);
    assert.ok(problems.includes('code.overkill.java missing'));
    assert.ok(problems.includes('code.simple.php missing'));
  });

  test('empty usedIn is reported', () => {
    const p = good();
    p.text.en.usedIn = [];
    assert.ok(V.validatePattern(p).includes('text.en.usedIn missing'));
  });

  test('invalid category is reported', () => {
    const p = good();
    p.category = 'weird';
    assert.ok(V.validatePattern(p).includes('invalid category: weird'));
  });

  test('missing code snippet is reported', () => {
    const p = good();
    delete p.code.good.php;
    assert.ok(V.validatePattern(p).includes('code.good.php missing'));
  });

  test('diagram must be an svg string', () => {
    const p = good();
    p.diagram = '<div></div>';
    assert.ok(V.validatePattern(p).includes('diagram must be an <svg> string'));
  });

  test('missing mount is reported', () => {
    const p = good();
    delete p.mount;
    assert.ok(V.validatePattern(p).includes('mount() missing'));
  });

  test('validateAll flags duplicate ids', () => {
    const results = V.validateAll([good(), good()]);
    assert.deepStrictEqual(results[0].problems, []);
    assert.ok(results[1].problems.includes('duplicate id'));
  });
};
