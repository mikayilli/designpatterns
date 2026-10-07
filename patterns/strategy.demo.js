(function (DP) {
  // Interactive demo that mirrors the code samples: an Order with a swappable shipping
  // strategy. Pick a strategy (setStrategy) and the order just calls shippingPrice(kg).
  // The "add" button mirrors `strategies.drone = ...` from the JS sample.
  const UI = {
    az: {
      hint: 'Çəkini dəyiş və üsulu seç. Sifariş yalnız seçilmiş strategiyanı çağırır, qiymətin necə hesablandığını bilmir.',
      weight: 'Çəki',
      names: { post: 'Poçt', courier: 'Kuryer', express: 'Ekspress', drone: 'Dron' },
      add: '+ Yeni strategiya əlavə et (Dron)',
      added: 'Dron əlavə olundu. Köhnə üsullara toxunulmadı: onların qiymətləri əvvəlki kimidir.',
      console: 'Sifarişin etdiyi çağırışlar',
    },
    en: {
      hint: 'Change the weight and pick a method. The order only calls the selected strategy and does not know how the price is calculated.',
      weight: 'Weight',
      names: { post: 'Post', courier: 'Courier', express: 'Express', drone: 'Drone' },
      add: '+ Add a new strategy (Drone)',
      added: 'Drone was added. The old methods were not touched: their prices are the same as before.',
      console: 'Calls made by the order',
    },
  };

  // base + kg * rate, the same numbers as in the code samples
  const SPECS = {
    post: { base: 3, rate: 0.5, cls: 'Post' },
    courier: { base: 6, rate: 0.8, cls: 'Courier' },
    express: { base: 12, rate: 1.5, cls: 'Express' },
    drone: { base: 20, rate: 2, cls: 'Drone' },
  };

  function mount(stage, lang) {
    const { h } = DP;
    const ui = UI[lang] || UI.en;
    const shipping = DP.logic.strategy.createShipping();
    let current = 'post';
    let kg = 10;

    const weightValue = h('strong', {}, '');
    const callLines = h('div', { class: 'console', 'aria-live': 'polite' });
    const note = h('p', { class: 'demo-hint', hidden: true }, ui.added);
    const optionsEl = h('div', { class: 'strategy-options', role: 'radiogroup' });
    const cards = {};

    function addCard(name) {
      const input = h('input', {
        type: 'radio',
        name: 'ship',
        value: name,
        checked: name === current,
        onchange: () => {
          current = name;
          render();
        },
      });
      const formula = h('small', {});
      const price = h('span', { class: 'card-price' });
      const bar = h('i', {});
      const el = h(
        'label',
        { class: 'strategy-card' },
        input,
        h('strong', {}, ui.names[name]),
        formula,
        price,
        h('span', { class: 'bar' }, bar)
      );
      cards[name] = { el, formula, price, bar };
      optionsEl.append(el);
    }
    shipping.names().forEach(addCard);

    const addBtn = h(
      'button',
      {
        class: 'btn add-btn',
        type: 'button',
        onclick: () => {
          if (addBtn.hidden) return; // already added
          shipping.add('drone', (w) => SPECS.drone.base + w * SPECS.drone.rate);
          addCard('drone');
          addBtn.hidden = true;
          note.hidden = false;
          render();
        },
      },
      ui.add
    );

    const range = h('input', {
      type: 'range',
      min: 1,
      max: 20,
      value: kg,
      'aria-label': ui.weight,
      oninput: (e) => {
        kg = Number(e.target.value);
        render();
      },
    });

    function render() {
      const prices = shipping.names().map((n) => shipping.price(n, kg));
      const max = Math.max(...prices);
      shipping.names().forEach((n, i) => {
        const spec = SPECS[n];
        const c = cards[n];
        c.formula.textContent = `${spec.base} + ${kg} × ${spec.rate}`;
        c.price.textContent = `${prices[i].toFixed(2)} ₼`;
        c.bar.style.width = `${Math.round((prices[i] / max) * 100)}%`;
        c.el.classList.toggle('selected', n === current);
      });
      weightValue.textContent = `${kg} kg`;
      const result = shipping.price(current, kg).toFixed(2);
      callLines.replaceChildren(
        h('div', { class: 'console-line call' }, `order.setStrategy(new ${SPECS[current].cls}())`),
        h('div', { class: 'console-line call' }, `order.shippingPrice(${kg})`),
        h('div', { class: 'console-line out' }, `→ ${result}`)
      );
    }

    stage.append(
      h(
        'div',
        { class: 'strategy-demo' },
        h('p', { class: 'demo-hint' }, ui.hint),
        h('div', { class: 'weight-row' }, h('span', {}, `${ui.weight}:`), range, weightValue),
        optionsEl,
        addBtn,
        note,
        h('h3', { class: 'console-title' }, ui.console),
        callLines
      )
    );
    render();
  }

  DP.demos.strategy = mount;
})(window.DP);
