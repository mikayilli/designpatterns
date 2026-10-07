module.exports = (test, assert, DP) => {
  const { createEditor, createTypeCommand, createDeleteCommand, createHistory } = DP.logic.command;

  test('TypeCommand appends a word, separated by a space', () => {
    const ed = createEditor();
    createTypeCommand(ed, 'Hello').execute();
    createTypeCommand(ed, 'world').execute();
    assert.strictEqual(ed.getText(), 'Hello world');
  });

  test('TypeCommand.undo restores the text from before execute', () => {
    const ed = createEditor('Hi');
    const cmd = createTypeCommand(ed, 'there');
    cmd.execute();
    cmd.undo();
    assert.strictEqual(ed.getText(), 'Hi');
  });

  test('DeleteCommand removes the last word and undo brings it back', () => {
    const ed = createEditor('one two three');
    const cmd = createDeleteCommand(ed);
    cmd.execute();
    assert.strictEqual(ed.getText(), 'one two');
    cmd.undo();
    assert.strictEqual(ed.getText(), 'one two three');
  });

  test('DeleteCommand on an empty document throws', () => {
    assert.throws(() => createDeleteCommand(createEditor()).execute(), Error);
  });

  test('commands have readable names', () => {
    const ed = createEditor();
    assert.strictEqual(createTypeCommand(ed, 'Hi').name, 'TypeCommand("Hi")');
    assert.strictEqual(createDeleteCommand(ed).name, 'DeleteCommand');
  });

  test('type rejects an empty or non-string word', () => {
    const ed = createEditor();
    assert.throws(() => createTypeCommand(ed, ''), TypeError);
    assert.throws(() => createTypeCommand(ed, '   '), TypeError);
    assert.throws(() => createTypeCommand(ed, 5), TypeError);
  });

  test('history executes commands and undo/redo walk through them', () => {
    const ed = createEditor();
    const h = createHistory();
    h.execute(createTypeCommand(ed, 'A'));
    h.execute(createTypeCommand(ed, 'B'));
    h.execute(createTypeCommand(ed, 'C'));
    assert.strictEqual(ed.getText(), 'A B C');
    h.undo();
    h.undo();
    assert.strictEqual(ed.getText(), 'A');
    h.redo();
    assert.strictEqual(ed.getText(), 'A B');
  });

  test('history position and canUndo/canRedo follow the pointer', () => {
    const ed = createEditor();
    const h = createHistory();
    assert.strictEqual(h.canUndo(), false);
    assert.strictEqual(h.canRedo(), false);
    h.execute(createTypeCommand(ed, 'A'));
    h.execute(createTypeCommand(ed, 'B'));
    assert.strictEqual(h.position(), 2);
    assert.strictEqual(h.canRedo(), false);
    h.undo();
    assert.strictEqual(h.position(), 1);
    assert.strictEqual(h.canUndo(), true);
    assert.strictEqual(h.canRedo(), true);
    h.undo();
    assert.strictEqual(h.canUndo(), false);
  });

  test('executing a new command after undo clears the redo branch', () => {
    const ed = createEditor();
    const h = createHistory();
    h.execute(createTypeCommand(ed, 'A'));
    h.execute(createTypeCommand(ed, 'B'));
    h.undo();
    h.execute(createTypeCommand(ed, 'X'));
    assert.strictEqual(ed.getText(), 'A X');
    assert.strictEqual(h.canRedo(), false);
    assert.deepStrictEqual(h.list(), ['TypeCommand("A")', 'TypeCommand("X")']);
  });

  test('undo and redo with nothing to do throw', () => {
    const h = createHistory();
    assert.throws(() => h.undo(), Error);
    assert.throws(() => h.redo(), Error);
  });

  test('a command that fails is not added to the history', () => {
    const ed = createEditor();
    const h = createHistory();
    assert.throws(() => h.execute(createDeleteCommand(ed)), Error);
    assert.strictEqual(h.position(), 0);
    assert.deepStrictEqual(h.list(), []);
  });

  test('history rejects objects that are not commands', () => {
    assert.throws(() => createHistory().execute({}), TypeError);
  });

  test('undo of a delete in the middle of a history restores the word', () => {
    const ed = createEditor();
    const h = createHistory();
    h.execute(createTypeCommand(ed, 'Hello'));
    h.execute(createTypeCommand(ed, 'world'));
    h.execute(createDeleteCommand(ed));
    assert.strictEqual(ed.getText(), 'Hello');
    h.undo();
    assert.strictEqual(ed.getText(), 'Hello world');
  });
};
