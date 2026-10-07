module.exports = (test, assert, DP) => {
  const { createTheater, createFacade } = DP.logic.facade;

  test('the theater starts with everything off', () => {
    const t = createTheater();
    assert.deepStrictEqual(t.state(), { lights: 'bright', projector: 'off', sound: 'off', player: 'off', title: null });
  });

  test('manual calls in the right order work and are logged', () => {
    const lines = [];
    const t = createTheater((l) => lines.push(l));
    t.lights.dim();
    t.projector.on();
    t.sound.on();
    t.player.on();
    t.player.play('Matrix');
    assert.strictEqual(t.state().player, 'playing');
    assert.strictEqual(t.state().title, 'Matrix');
    assert.deepStrictEqual(lines, [
      'lights.dim()',
      'projector.on()',
      'sound.on()',
      'player.on()',
      'player.play("Matrix")',
    ]);
  });

  test('projector.on() before lights.dim() throws a clear error', () => {
    const t = createTheater();
    assert.throws(() => t.projector.on(), /lights/);
    assert.strictEqual(t.state().projector, 'off');
  });

  test('every manual step needs the step before it', () => {
    const t = createTheater();
    assert.throws(() => t.sound.on(), /projector/);
    assert.throws(() => t.player.on(), /sound/);
    assert.throws(() => t.player.play('X'), /player/);
  });

  test('player.play() needs a title', () => {
    const t = createTheater();
    t.lights.dim();
    t.projector.on();
    t.sound.on();
    t.player.on();
    assert.throws(() => t.player.play(''), TypeError);
  });

  test('watchMovie() turns everything on in the right order', () => {
    const lines = [];
    const t = createTheater((l) => lines.push(l));
    const facade = createFacade(t);
    facade.watchMovie('Matrix');
    assert.deepStrictEqual(t.state(), { lights: 'dim', projector: 'on', sound: 'on', player: 'playing', title: 'Matrix' });
    assert.strictEqual(lines.length, 5);
    assert.strictEqual(lines[0], 'lights.dim()');
    assert.strictEqual(lines[4], 'player.play("Matrix")');
  });

  test('endMovie() reverses everything', () => {
    const lines = [];
    const t = createTheater((l) => lines.push(l));
    const facade = createFacade(t);
    facade.watchMovie('Matrix');
    lines.length = 0;
    facade.endMovie();
    assert.deepStrictEqual(t.state(), { lights: 'bright', projector: 'off', sound: 'off', player: 'off', title: null });
    assert.deepStrictEqual(lines, ['player.stop()', 'player.off()', 'sound.off()', 'projector.off()', 'lights.bright()']);
  });

  test('watchMovie() rejects an empty title and changes nothing', () => {
    const t = createTheater();
    const facade = createFacade(t);
    assert.throws(() => facade.watchMovie('  '), TypeError);
    assert.strictEqual(t.state().projector, 'off');
  });

  test('endMovie() on an idle theater is safe', () => {
    const t = createTheater();
    createFacade(t).endMovie();
    assert.strictEqual(t.state().lights, 'bright');
  });

  test('createFacade() needs a theater', () => {
    assert.throws(() => createFacade(null), TypeError);
  });

  test('reset() puts the theater back without logging', () => {
    const lines = [];
    const t = createTheater((l) => lines.push(l));
    t.lights.dim();
    lines.length = 0;
    t.reset();
    assert.strictEqual(t.state().lights, 'bright');
    assert.strictEqual(lines.length, 0);
  });
};
