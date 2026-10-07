(function (DP) {
  // Interactive demo that mirrors the code samples: the SAME client loop
  //   it = collection.createIterator(); while (it.hasNext()) it.next()
  // walks a ListCollection (array) and a TreeCollection (linked nodes).
  const UI = {
    az: {
      hint: 'Kolleksiyanı seç və next() düyməsinə bas. Hər dəfə növbəti element işıqlanır. Eyni dövr həm siyahıda, həm ağacda işləyir.',
      choose: 'Kolleksiya',
      list: 'Siyahı (ListCollection)',
      tree: 'Ağac (TreeCollection)',
      next: 'next()',
      auto: 'Avtomatik oynat',
      stop: 'Dayandır',
      restart: 'Yenidən başla',
      hasNext: 'hasNext()',
      visited: 'Gəzilən elementlər',
      none: 'hələ heç biri',
      finished: 'hasNext() = false, gəzinti bitdi',
      listNote: 'Siyahı sıra ilə gəzilir: indeks 0, 1, 2 ...',
      treeNote: 'Ağac: əvvəl valideyn, sonra uşaqlar soldan sağa. Müştəri kodu bunu bilmir.',
      console: 'Konsol (kodun çıxışı)',
    },
    en: {
      hint: 'Pick a collection and press next(). Each time the next element lights up. The same loop works for both the list and the tree.',
      choose: 'Collection',
      list: 'List (ListCollection)',
      tree: 'Tree (TreeCollection)',
      next: 'next()',
      auto: 'Auto-play',
      stop: 'Stop',
      restart: 'Start over',
      hasNext: 'hasNext()',
      visited: 'Visited elements',
      none: 'none yet',
      finished: 'hasNext() = false, the walk is finished',
      listNote: 'The list is walked in order: index 0, 1, 2 ...',
      treeNote: 'The tree: a parent first, then its children from left to right. The client code does not know this.',
      console: 'Console (output of the code)',
    },
  };

  const LIST_ITEMS = ['Beach', 'Hotel', 'Mom', 'Dad', 'Sunset'];
  const TICK_MS = 700;
  const MAX_LINES = 8;

  function mount(stage, lang) {
    const { h } = DP;
    const ui = UI[lang] || UI.en;
    const L = DP.logic.iterator;

    const makeTree = () =>
      L.makeNode('Photos', [
        L.makeNode('Trip', [L.makeNode('Beach'), L.makeNode('Hotel')]),
        L.makeNode('Family', [L.makeNode('Mom'), L.makeNode('Dad')]),
      ]);

    let kind = 'list';
    let iterator = null;
    let timer = null;
    let lastValue = null;
    let visited = [];

    const noteEl = h('p', { class: 'muted' });
    const viewEl = h('div', { class: 'it-view' });
    const hasNextEl = h('output', { class: 'it-has', 'aria-live': 'polite' });
    const visitedEl = h('output', { class: 'it-visited', 'aria-live': 'polite' });
    const consoleEl = h('div', { class: 'console', role: 'log', 'aria-live': 'polite' });
    const log = (text, cls) => {
      consoleEl.append(h('div', { class: 'console-line ' + (cls || '') }, text));
      while (consoleEl.children.length > MAX_LINES) consoleEl.firstChild.remove();
    };

    const nextBtn = h('button', { class: 'btn', type: 'button', onclick: () => step() }, ui.next);
    const autoBtn = h('button', { class: 'btn', type: 'button', onclick: () => toggleAuto() }, ui.auto);
    const restartBtn = h('button', { class: 'btn', type: 'button', onclick: () => start() }, ui.restart);

    const radios = ['list', 'tree'].map((k) =>
      h(
        'label',
        { class: 'it-radio' },
        h('input', { type: 'radio', name: 'it-kind', value: k, checked: k === kind, onchange: () => { kind = k; start(); } }),
        h('span', {}, ui[k])
      )
    );

    function stopTimer() {
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
      autoBtn.textContent = ui.auto;
    }

    function toggleAuto() {
      if (timer !== null) {
        stopTimer();
        return;
      }
      if (!iterator.hasNext()) return;
      autoBtn.textContent = ui.stop;
      timer = setInterval(() => {
        if (!stage.isConnected) {
          stopTimer();
          return;
        }
        step();
      }, TICK_MS);
    }

    function step() {
      if (!iterator.hasNext()) {
        stopTimer();
        return;
      }
      lastValue = iterator.next();
      visited.push(lastValue);
      log('it.next()', 'call');
      log(`→ ${lastValue}`, 'out');
      if (!iterator.hasNext()) {
        stopTimer();
        log(ui.finished, 'dim');
      }
      render();
    }

    function node(label, cls) {
      return h('span', { class: 'it-node ' + (cls || '') + (label === lastValue ? ' is-current' : visited.includes(label) ? ' is-seen' : '') }, label);
    }

    function renderView() {
      if (kind === 'list') {
        viewEl.replaceChildren(h('div', { class: 'it-list' }, LIST_ITEMS.map((v, i) => h('span', { class: 'it-cell' }, h('small', {}, String(i)), node(v)))));
      } else {
        viewEl.replaceChildren(
          h(
            'div',
            { class: 'it-tree' },
            h('div', { class: 'it-level' }, node('Photos')),
            h('div', { class: 'it-level' }, node('Trip'), node('Family')),
            h('div', { class: 'it-level' }, node('Beach'), node('Hotel'), node('Mom'), node('Dad'))
          )
        );
      }
    }

    function render() {
      renderView();
      noteEl.textContent = kind === 'list' ? ui.listNote : ui.treeNote;
      const more = iterator.hasNext();
      hasNextEl.textContent = `${ui.hasNext} = ${more}`;
      hasNextEl.classList.toggle('is-false', !more);
      visitedEl.textContent = visited.length ? visited.join(' → ') : ui.none;
      nextBtn.disabled = !more;
      autoBtn.disabled = !more && timer === null;
    }

    function start() {
      stopTimer();
      const collection = kind === 'list' ? L.createListCollection(LIST_ITEMS) : L.createTreeCollection(makeTree());
      iterator = collection.createIterator();
      lastValue = null;
      visited = [];
      consoleEl.replaceChildren();
      log(`it = ${kind === 'list' ? 'list' : 'tree'}.createIterator()`, 'call');
      render();
    }

    stage.append(
      h(
        'div',
        { class: 'it-demo' },
        h('p', { class: 'demo-hint' }, ui.hint),
        h('div', { class: 'it-choose', role: 'radiogroup', 'aria-label': ui.choose }, radios),
        noteEl,
        viewEl,
        h('div', { class: 'it-controls' }, nextBtn, autoBtn, restartBtn),
        h('div', { class: 'it-status' }, hasNextEl, h('div', {}, h('strong', {}, `${ui.visited}: `), visitedEl)),
        h('h3', { class: 'console-title' }, ui.console),
        consoleEl
      )
    );
    start();
  }

  DP.demos.iterator = mount;
})(window.DP);
