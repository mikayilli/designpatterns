(function (DP) {
  // Interactive demo that mirrors the code samples: a Coffee that gets wrapped in
  // decorators (MilkDecorator, SugarDecorator ...). Every layer adds its own cost + description.
  const UI = {
    az: {
      hint: 'Süd, Şəkər, Qaymaq, Sirop düymələrinə bas: qəhvə qat-qat sarınır. Sağda pis yanaşmada neçə sinif lazım olduğunu gör.',
      add: 'Əlavə et',
      reset: 'Sıfırla',
      extras: { milk: 'Süd', sugar: 'Şəkər', cream: 'Qaymaq', syrup: 'Sirop' },
      layersTitle: 'Qatlar (içəridən çölə)',
      description: 'Təsvir',
      price: 'Qiymət',
      badTitle: 'Pis yanaşma: hər kombinasiya ayrıca sinif',
      goodTitle: 'Decorator: sarıyıcılar',
      classesNeeded: 'Seçdiyin əlavələr (hamısı fərqli: {k}) üçün lazım olan sinif sayı',
      classesDecorator: 'Decorator ilə sinif sayı',
      neededClass: 'Pis yanaşmada bu qəhvə üçün lazım olan sinif',
      menu: 'Bütün 4 əlavəni təklif etmək üçün: pis yanaşma {bad} sinif, Decorator {good} sinif.',
      console: 'Konsol (kodun çıxışı)',
    },
    en: {
      hint: 'Press Milk, Sugar, Cream, Syrup: the coffee gets wrapped layer by layer. On the right see how many classes the bad approach would need.',
      add: 'Add',
      reset: 'Reset',
      extras: { milk: 'Milk', sugar: 'Sugar', cream: 'Cream', syrup: 'Syrup' },
      layersTitle: 'Layers (inside to outside)',
      description: 'Description',
      price: 'Price',
      badTitle: 'Bad approach: one class per combination',
      goodTitle: 'Decorator: wrappers',
      classesNeeded: 'Classes needed for your extras (different ones: {k})',
      classesDecorator: 'Classes with Decorator',
      neededClass: 'Class the bad approach needs for this coffee',
      menu: 'To offer all 4 extras: bad approach {bad} classes, Decorator {good} classes.',
      console: 'Console (output of the code)',
    },
  };

  const MAX_LINES = 7;

  function mount(stage, lang) {
    const { h } = DP;
    const ui = UI[lang] || UI.en;
    const logic = DP.logic.decorator;
    const kinds = Object.keys(logic.EXTRAS);
    let drink = logic.createCoffee();
    let used = [];

    const layersEl = h('div', { class: 'dec-layers', 'aria-hidden': 'true' });
    const layerList = h('p', { class: 'muted dec-layer-list' });
    const descEl = h('output', { class: 'dec-desc', 'aria-live': 'polite' });
    const priceEl = h('output', { class: 'dec-price', 'aria-live': 'polite' });
    const badCount = h('output', { class: 'dec-count bad', 'aria-live': 'polite' });
    const goodCount = h('output', { class: 'dec-count good', 'aria-live': 'polite' });
    const badClass = h('code', { class: 'dec-class' });
    const badLabel = h('span', {});
    const consoleEl = h('div', { class: 'console', role: 'log', 'aria-live': 'polite' });

    const log = (text, kind) => {
      consoleEl.append(h('div', { class: 'console-line ' + (kind || '') }, text));
      while (consoleEl.children.length > MAX_LINES) consoleEl.firstChild.remove();
    };

    // nested boxes: the last wrapper is the outermost one
    function drawLayers() {
      const names = logic.getLayers(drink);
      let node = h('div', { class: 'dec-layer dec-core' }, h('span', { class: 'dec-icon' }, '☕'), h('strong', {}, 'Coffee'));
      names.slice(1).forEach((name) => {
        node = h('div', { class: 'dec-layer dec-wrap' }, h('span', { class: 'dec-tag' }, `${name}Decorator`), node);
      });
      layersEl.textContent = '';
      layersEl.append(node);
      layerList.textContent = names.join(' → ');
    }

    function refresh() {
      drawLayers();
      descEl.textContent = drink.description();
      priceEl.textContent = logic.formatPrice(drink.cost());
      const k = used.length;
      badCount.textContent = String(logic.subclassCount(k));
      goodCount.textContent = String(k + 1);
      badLabel.textContent = ui.classesNeeded.replace('{k}', String(k));
      badClass.textContent = k === 0 ? 'Coffee' : 'CoffeeWith' + used.map(labelOf).join('And');
    }

    // class names in the bad approach use the English extra names (as in the code samples)
    const labelOf = (kind) => logic.EXTRAS[kind].label;

    function add(kind) {
      drink = logic.createDecorator(kind, drink);
      if (!used.includes(kind)) used.push(kind);
      const cls = `${logic.EXTRAS[kind].label}Decorator`;
      log(`drink = new ${cls}(drink)`, 'call');
      log(`drink.description() = "${drink.description()}"`, 'out');
      log(`drink.cost() = ${logic.formatPrice(drink.cost())}`, 'out');
      refresh();
    }

    function reset() {
      drink = logic.createCoffee();
      used = [];
      log('drink = new Coffee()', 'call');
      log(`drink.description() = "${drink.description()}"`, 'out');
      refresh();
    }

    const buttons = kinds.map((k) =>
      h(
        'button',
        { class: 'btn dec-add', type: 'button', onclick: () => add(k) },
        `+ ${ui.extras[k]} (${logic.formatPrice(logic.EXTRAS[k].cost)})`
      )
    );

    stage.append(
      h(
        'div',
        { class: 'dec-demo' },
        h('p', { class: 'demo-hint' }, ui.hint),
        h('div', { class: 'dec-buttons' }, buttons, h('button', { class: 'btn dec-reset', type: 'button', onclick: reset }, ui.reset)),
        h('h3', { class: 'console-title' }, ui.layersTitle),
        layersEl,
        layerList,
        h(
          'div',
          { class: 'dec-summary' },
          h('div', {}, h('span', { class: 'muted' }, `${ui.description}: `), descEl),
          h('div', {}, h('span', { class: 'muted' }, `${ui.price}: `), priceEl)
        ),
        h(
          'div',
          { class: 'dec-compare' },
          h('div', { class: 'dec-side bad' }, h('strong', {}, ui.badTitle), h('p', { class: 'muted' }, badLabel), badCount, h('p', { class: 'muted' }, ui.neededClass), badClass),
          h('div', { class: 'dec-side good' }, h('strong', {}, ui.goodTitle), h('p', { class: 'muted' }, ui.classesDecorator), goodCount)
        ),
        h('p', { class: 'muted' }, ui.menu.replace('{bad}', String(logic.subclassCount(kinds.length))).replace('{good}', String(kinds.length + 1))),
        h('h3', { class: 'console-title' }, ui.console),
        consoleEl
      )
    );
    log('drink = new Coffee()', 'call');
    log(`drink.cost() = ${logic.formatPrice(drink.cost())}`, 'out');
    refresh();
  }

  DP.demos.decorator = mount;
})(window.DP);
