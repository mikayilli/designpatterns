(function (DP) {
  // Interactive demo that mirrors the code samples: an Order that delegates pay() / ship() /
  // deliver() / cancel() to its current state object (NewState, PaidState, ...).
  const UI = {
    az: {
      hint: 'Düymələrə bas və sifarişin vəziyyətinin necə dəyişdiyini izlə. İndiki vəziyyətdə icazə olmayan düymələr söndürülüb. Qadağan olunan əməli sınamaq üçün aşağıdakı qutunu işarələ.',
      order: 'Sifariş',
      current: 'İndiki vəziyyət',
      flow: 'Vəziyyət xəritəsi',
      states: { new: 'Yeni', paid: 'Ödənilib', shipped: 'Göndərilib', delivered: 'Çatdırılıb', cancelled: 'Ləğv edilib' },
      actions: { pay: 'Ödə (pay)', ship: 'Göndər (ship)', deliver: 'Çatdır (deliver)', cancel: 'Ləğv et (cancel)' },
      tryIllegal: 'Qadağan olunan əməlləri də sına (bütün düymələr aktiv olur)',
      reset: 'Yeni sifariş',
      console: 'Konsol (kodun çıxışı)',
      resetLine: 'order = new Order()',
    },
    en: {
      hint: 'Press the buttons and watch the order change state. Buttons that the current state does not allow are disabled. Tick the box below to try a forbidden action.',
      order: 'Order',
      current: 'Current state',
      flow: 'State map',
      states: { new: 'New', paid: 'Paid', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' },
      actions: { pay: 'Pay (pay)', ship: 'Ship (ship)', deliver: 'Deliver (deliver)', cancel: 'Cancel (cancel)' },
      tryIllegal: 'Also try forbidden actions (all buttons become active)',
      reset: 'New order',
      console: 'Console (output of the code)',
      resetLine: 'order = new Order()',
    },
  };

  const MAX_LINES = 7;

  function mount(stage, lang) {
    const { h } = DP;
    const ui = UI[lang] || UI.en;
    const L = DP.logic.state;
    let order = L.createOrder();
    let tryIllegal = false;

    const stateEl = h('output', { class: 'st-current', 'aria-live': 'polite' });
    const consoleEl = h('div', { class: 'console', role: 'log', 'aria-live': 'polite' });
    const log = (text, kind) => {
      consoleEl.append(h('div', { class: 'console-line ' + (kind || '') }, text));
      while (consoleEl.children.length > MAX_LINES) consoleEl.firstChild.remove();
    };

    const chips = {};
    const chip = (id) => {
      chips[id] = h('span', { class: 'st-chip' }, ui.states[id]);
      return chips[id];
    };
    const arrow = () => h('span', { class: 'st-arrow', 'aria-hidden': 'true' }, '→');

    const buttons = {};
    L.ACTIONS.forEach((a) => {
      buttons[a] = h(
        'button',
        {
          class: 'btn st-btn',
          type: 'button',
          onclick: () => {
            try {
              order[a]();
              log(`order.${a}()`, 'call');
              log(`→ ${order.getStateName()}`, 'out');
            } catch (err) {
              log(`order.${a}()`, 'call');
              log(`Error: ${err.message}`, 'err');
            }
            render();
          },
        },
        ui.actions[a]
      );
    });

    const illegalBox = h('input', {
      type: 'checkbox',
      onchange: (e) => {
        tryIllegal = e.target.checked;
        render();
      },
    });

    const resetBtn = h(
      'button',
      {
        class: 'btn',
        type: 'button',
        onclick: () => {
          order = L.createOrder();
          log(ui.resetLine, 'call');
          render();
        },
      },
      ui.reset
    );

    function render() {
      const cur = order.getState();
      stateEl.textContent = `${ui.states[cur]} (${order.getStateName()})`;
      L.STATES.forEach((id) => {
        chips[id].classList.toggle('is-current', id === cur);
        if (id === cur) chips[id].setAttribute('aria-current', 'step');
        else chips[id].removeAttribute('aria-current');
      });
      L.ACTIONS.forEach((a) => {
        buttons[a].disabled = !tryIllegal && !order.can(a);
      });
    }

    stage.append(
      h(
        'div',
        { class: 'st-demo' },
        h('p', { class: 'demo-hint' }, ui.hint),
        h(
          'div',
          { class: 'st-order' },
          h('strong', {}, `${ui.order} `),
          h('code', {}, 'Order'),
          h('p', { class: 'muted' }, `${ui.current}:`),
          stateEl
        ),
        h('h3', { class: 'console-title' }, ui.flow),
        h(
          'div',
          { class: 'st-flow' },
          h('div', { class: 'st-flow-main' }, chip('new'), arrow(), chip('paid'), arrow(), chip('shipped'), arrow(), chip('delivered')),
          h('div', { class: 'st-flow-side' }, chip('cancelled'))
        ),
        h('div', { class: 'st-actions' }, L.ACTIONS.map((a) => buttons[a]), resetBtn),
        h('label', { class: 'st-check' }, illegalBox, h('span', {}, ui.tryIllegal)),
        h('h3', { class: 'console-title' }, ui.console),
        consoleEl
      )
    );
    render();
  }

  DP.demos.state = mount;
})(window.DP);
