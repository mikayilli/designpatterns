(function (DP) {
  // Interactive demo that mirrors the code samples: the "bad" side calls
  // `new DatabaseConnection()` every time, the "good" side calls
  // `DatabaseConnection.getInstance()`. Each click gives a variable (conn1, conn2, ...)
  // and the demo shows which connection number it points to.
  const UI = {
    az: {
      hint: 'Hər iki tərəfdə düyməni 3-4 dəfə bas və "yaradılan bağlantı" sayına bax. Sonra sağ tərəfdə birbaşa new yazmağa çalış.',
      badTitle: 'Pis: hər dəfə new',
      goodTitle: 'Yaxşı: getInstance()',
      created: 'Yaradılan bağlantı sayı',
      newBtn: 'new DatabaseConnection()',
      getBtn: 'DatabaseConnection.getInstance()',
      tryNewBtn: 'Birbaşa new yazmağa çalış',
      reset: 'Sıfırla',
      empty: 'Hələ dəyişən yoxdur',
      badNote: 'Hər dəyişən başqa bağlantıya baxır. Hər bağlantı açmaq vaxt aparır və serverin yaddaşını işlədir.',
      goodNote: 'Bütün dəyişənlər eyni bağlantıya baxır. Bağlantı yalnız bir dəfə açılır.',
      console: 'Konsol (kodun çıxışı)',
      opening: 'Opening a new connection',
      reusing: 'Reusing the existing connection',
      errorPrefix: 'Error: ',
      same: 'Hamısı eyni #1 bağlantısıdır',
    },
    en: {
      hint: 'Press the button 3-4 times on each side and watch the "connections created" number. Then try writing new directly on the right side.',
      badTitle: 'Bad: new every time',
      goodTitle: 'Good: getInstance()',
      created: 'Connections created',
      newBtn: 'new DatabaseConnection()',
      getBtn: 'DatabaseConnection.getInstance()',
      tryNewBtn: 'Try writing new directly',
      reset: 'Reset',
      empty: 'No variables yet',
      badNote: 'Every variable points to a different connection. Opening each connection takes time and uses the server memory.',
      goodNote: 'All variables point to the same connection. The connection is opened only once.',
      console: 'Console (output of the code)',
      opening: 'Opening a new connection',
      reusing: 'Reusing the existing connection',
      errorPrefix: 'Error: ',
      same: 'All of them are the same connection #1',
    },
  };

  const MAX_LINES = 8;

  function mount(stage, lang) {
    const { h } = DP;
    const ui = UI[lang] || UI.en;
    let bad;
    let good;
    let badVars;
    let goodVars;

    const consoleEl = h('div', { class: 'console', role: 'log', 'aria-live': 'polite' });
    const log = (text, kind) => {
      consoleEl.append(h('div', { class: 'console-line ' + (kind || '') }, text));
      while (consoleEl.children.length > MAX_LINES) consoleEl.firstChild.remove();
    };

    const badCount = h('output', { class: 'sg-count bad', 'aria-live': 'polite' });
    const goodCount = h('output', { class: 'sg-count good', 'aria-live': 'polite' });
    const badList = h('div', { class: 'sg-vars' });
    const goodList = h('div', { class: 'sg-vars' });
    const goodNote = h('p', { class: 'muted' });

    const chip = (name, conn, kind) =>
      h('span', { class: 'sg-chip ' + kind }, h('code', {}, name), ' → ', h('strong', {}, `#${conn.id}`));

    function render() {
      badCount.textContent = String(bad.created());
      goodCount.textContent = String(good.created());
      badList.replaceChildren(...(badVars.length ? badVars : [h('span', { class: 'muted' }, ui.empty)]));
      goodList.replaceChildren(...(goodVars.length ? goodVars : [h('span', { class: 'muted' }, ui.empty)]));
      goodNote.textContent = good.created() === 1 && goodVars.length > 1 ? ui.same : '';
    }

    function reset() {
      bad = DP.logic.singleton.createNaive();
      good = DP.logic.singleton.createSingleton();
      badVars = [];
      goodVars = [];
      consoleEl.replaceChildren();
      render();
    }

    const openBad = () => {
      const conn = bad.open();
      log(`const conn${badVars.length + 1} = new DatabaseConnection()`, 'call');
      log(`${ui.opening} #${conn.id}`, 'out');
      badVars.push(chip(`conn${badVars.length + 1}`, conn, 'bad'));
      render();
    };

    const getGood = () => {
      const before = good.created();
      const conn = good.getInstance();
      log(`const conn${goodVars.length + 1} = DatabaseConnection.getInstance()`, 'call');
      log(before === 0 ? `${ui.opening} #${conn.id}` : `${ui.reusing} #${conn.id}`, 'out');
      goodVars.push(chip(`conn${goodVars.length + 1}`, conn, 'good'));
      render();
    };

    const tryNew = () => {
      log('new DatabaseConnection()', 'call');
      try {
        good.tryNew();
      } catch (err) {
        log(ui.errorPrefix + err.message, 'dim');
      }
    };

    stage.append(
      h(
        'div',
        { class: 'sg-demo' },
        h('p', { class: 'demo-hint' }, ui.hint),
        h(
          'div',
          { class: 'sg-cols' },
          h(
            'section',
            { class: 'sg-col bad' },
            h('h3', {}, ui.badTitle),
            h('button', { class: 'btn', type: 'button', onclick: openBad }, h('code', {}, ui.newBtn)),
            h('div', { class: 'sg-counter' }, h('span', {}, `${ui.created}: `), badCount),
            badList,
            h('p', { class: 'muted' }, ui.badNote)
          ),
          h(
            'section',
            { class: 'sg-col good' },
            h('h3', {}, ui.goodTitle),
            h('button', { class: 'btn', type: 'button', onclick: getGood }, h('code', {}, ui.getBtn)),
            h('div', { class: 'sg-counter' }, h('span', {}, `${ui.created}: `), goodCount),
            goodList,
            h('p', { class: 'muted' }, ui.goodNote),
            goodNote,
            h('button', { class: 'btn sg-try', type: 'button', onclick: tryNew }, ui.tryNewBtn)
          )
        ),
        h('button', { class: 'btn', type: 'button', onclick: reset }, ui.reset),
        h('h3', { class: 'console-title' }, ui.console),
        consoleEl
      )
    );
    reset();
  }

  DP.demos.singleton = mount;
})(window.DP);
