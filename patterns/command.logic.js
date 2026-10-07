(function (DP) {
  // The tiny text editor from the code samples. The editor only stores text.
  function createEditor(initial) {
    let text = initial === undefined ? '' : initial;
    if (typeof text !== 'string') throw new TypeError('initial text must be a string');
    return {
      getText() {
        return text;
      },
      setText(next) {
        if (typeof next !== 'string') throw new TypeError('text must be a string');
        text = next;
      },
    };
  }

  // TypeCommand: execute() adds a word, undo() puts the text back to how it was before.
  function createTypeCommand(editor, word) {
    if (typeof word !== 'string' || word.trim() === '') throw new TypeError('word must be a non-empty string');
    const clean = word.trim();
    let before = null;
    return {
      name: `TypeCommand("${clean}")`,
      execute() {
        before = editor.getText();
        editor.setText(before === '' ? clean : `${before} ${clean}`);
      },
      undo() {
        if (before === null) throw new Error('nothing to undo: execute() was not called');
        editor.setText(before);
      },
    };
  }

  // DeleteCommand: removes the last word. It remembers the old text so undo() can restore it.
  function createDeleteCommand(editor) {
    let before = null;
    return {
      name: 'DeleteCommand',
      execute() {
        const current = editor.getText();
        if (current.trim() === '') throw new Error('nothing to delete: the document is empty');
        before = current;
        const words = current.split(' ');
        words.pop();
        editor.setText(words.join(' '));
      },
      undo() {
        if (before === null) throw new Error('nothing to undo: execute() was not called');
        editor.setText(before);
      },
    };
  }

  // History keeps the executed commands and a pointer to the current position.
  function createHistory() {
    const commands = [];
    let pointer = 0; // number of commands that are currently "applied"
    return {
      execute(cmd) {
        if (!cmd || typeof cmd.execute !== 'function' || typeof cmd.undo !== 'function') {
          throw new TypeError('a command needs execute() and undo()');
        }
        cmd.execute(); // if this throws, nothing is recorded
        commands.length = pointer; // a new action wipes the redo branch
        commands.push(cmd);
        pointer = commands.length;
      },
      undo() {
        if (pointer === 0) throw new Error('nothing to undo');
        pointer -= 1;
        commands[pointer].undo();
      },
      redo() {
        if (pointer === commands.length) throw new Error('nothing to redo');
        commands[pointer].execute();
        pointer += 1;
      },
      canUndo() {
        return pointer > 0;
      },
      canRedo() {
        return pointer < commands.length;
      },
      position() {
        return pointer;
      },
      list() {
        return commands.map((c) => c.name);
      },
    };
  }

  DP.logic.command = { createEditor, createTypeCommand, createDeleteCommand, createHistory };
})(window.DP);
