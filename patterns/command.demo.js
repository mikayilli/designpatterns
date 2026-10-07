(function (DP) {
  // Interactive demo that mirrors the code samples: an Editor, TypeCommand / DeleteCommand
  // objects (execute + undo) and a History with a pointer. Undo / Redo just walk the history.
  const UI = {
    az: {
      hint: 'Sözlərə klik edib mətni yaz, sonra Undo və Redo düymələrini sına. Undo-dan sonra yeni əmr versən, Redo siyahısı silinir.',
      doc: 'Sənəd (Editor)',
      empty: '(boşdur)',
      type: 'Yaz',
      del: 'Son sözü sil',
      undo: 'Undo (geri al)',
      redo: 'Redo (təkrar et)',
      history: 'History: əmrlərin siyahısı',
      historyEmpty: 'Hələ heç bir əmr yoxdur',
      done: 'icra olunub',
      undone: 'geri alınıb',
      current: 'indiki yer',
      redoCleared: 'Yeni əmr gəldi: geri alınmış əmrlər (Redo) silindi',
      console: 'Konsol (kodun çıxışı)',
    },
    en: {
      hint: 'Click words to type text, then try Undo and Redo. If you run a new command after an Undo, the Redo list is cleared.',
      doc: 'Document (Editor)',
      empty: '(empty)',
      type: 'Type',
      del: 'Delete last word',
      undo: 'Undo',
      redo: 'Redo',
      history: 'History: list of commands',
      historyEmpty: 'No commands yet',
      done: 'executed',
      undone: 'undone',
      current: 'current position',
      redoCleared: 'A new command arrived: the undone commands (Redo) were cleared',
      console: 'Console (output of the code)',
    },
  };

  const WORDS = ['Hello', 'world', 'Baku'];
  const MAX_LINES = 7;

  function mount(stage, lang) {
    const { h } = DP;
    const ui = UI[lang] || UI.en;
    const L = DP.logic.command;
    const editor = L.createEditor();
    const history = L.createHistory();

    const docEl = h('output', { class: 'cmd-doc', 'aria-live': 'polite' });
    const listEl = h('ol', { class: 'cmd-history' });
    const consoleEl = h('div', { class: 'console', role: 'log', 'aria-live': 'polite' });

    const log = (text, kind) => {
      consoleEl.append(h('div', { class: 'console-line ' + (kind || '') }, text));
      while (consoleEl.children.length > MAX_LINES) consoleEl.firstChild.remove();
    };

    const undoBtn = h('button', { class: 'btn', type: 'button', onclick: () => undo() }, ui.undo);
    const redoBtn = h('button', { class: 'btn', type: 'button', onclick: () => redo() }, ui.redo);
    const delBtn = h('button', { class: 'btn', type: 'button', onclick: () => run(L.createDeleteCommand(editor), 'new DeleteCommand()') }, ui.del);

    function run(cmd, label) {
      const hadRedo = history.canRedo();
      try {
        history.execute(cmd);
      } catch (err) {
        log(err.message, 'dim');
        render();
        return;
      }
      log(`history.execute(${label})`, 'call');
      if (hadRedo) log(ui.redoCleared, 'dim');
      render();
    }

    function undo() {
      if (!history.canUndo()) return;
      history.undo();
      log('history.undo()', 'call');
      render();
    }

    function redo() {
      if (!history.canRedo()) return;
      history.redo();
      log('history.redo()', 'call');
      render();
    }

    function render() {
      const text = editor.getText();
      docEl.textContent = text === '' ? ui.empty : text;
      docEl.classList.toggle('is-empty', text === '');

      const names = history.list();
      const pos = history.position();
      if (names.length === 0) {
        listEl.replaceChildren(h('li', { class: 'cmd-item muted-item' }, ui.historyEmpty));
      } else {
        listEl.replaceChildren(
          names.map((name, i) =>
            h(
              'li',
              { class: 'cmd-item ' + (i < pos ? 'is-done' : 'is-undone') + (i === pos - 1 ? ' is-current' : '') },
              h('code', {}, name),
              h('span', { class: 'cmd-tag' }, i === pos - 1 ? `${ui.done} · ${ui.current}` : i < pos ? ui.done : ui.undone)
            )
          )
        );
      }

      undoBtn.disabled = !history.canUndo();
      redoBtn.disabled = !history.canRedo();
      delBtn.disabled = text.trim() === '';
    }

    const typeButtons = WORDS.map((w) =>
      h(
        'button',
        { class: 'btn', type: 'button', onclick: () => run(L.createTypeCommand(editor, w), `new TypeCommand("${w}")`) },
        `${ui.type} "${w}"`
      )
    );

    stage.append(
      h(
        'div',
        { class: 'cmd-demo' },
        h('p', { class: 'demo-hint' }, ui.hint),
        h('div', { class: 'cmd-doc-wrap' }, h('strong', {}, `${ui.doc}: `), docEl),
        h('div', { class: 'cmd-row' }, typeButtons, delBtn),
        h('div', { class: 'cmd-row' }, undoBtn, redoBtn),
        h('h3', { class: 'console-title' }, ui.history),
        listEl,
        h('h3', { class: 'console-title' }, ui.console),
        consoleEl
      )
    );
    render();
  }

  DP.demos.command = mount;
})(window.DP);
