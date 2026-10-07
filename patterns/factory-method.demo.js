(function (DP) {
  // Interactive demo that mirrors the code samples: pick a payment type, the matching
  // Checkout subclass is used, its createPayment() (the factory method) makes the payment,
  // and the shared process(amount) calls pay(amount) without knowing which payment it is.
  const UI = {
    az: {
      hint: 'Ödəniş növünü seç, məbləği dəyiş və "process" düyməsini bas. Checkout hansı ödəniş obyektinin yaradıldığını bilmir, onu createPayment() hazırlayır.',
      names: { card: 'Kart', cash: 'Nağd', transfer: 'Köçürmə' },
      amount: 'Məbləğ',
      process: 'process(məbləğ) çağır',
      flowTitle: 'Kim nəyi yaradır',
      checkout: 'Checkout (seçilən)',
      factory: 'createPayment()',
      payment: 'Yaranan ödəniş',
      note: 'process() hər üç halda eynidir. Yalnız createPayment() fərqli obyekt qaytarır.',
      console: 'Konsol (kodun çıxışı)',
      result: 'Nəticə',
      none: 'Hələ heç nə çağırılmayıb',
    },
    en: {
      hint: 'Pick a payment type, change the amount and press "process". The Checkout does not know which payment object is created, createPayment() prepares it.',
      names: { card: 'Card', cash: 'Cash', transfer: 'Transfer' },
      amount: 'Amount',
      process: 'Call process(amount)',
      flowTitle: 'Who creates what',
      checkout: 'Checkout (selected)',
      factory: 'createPayment()',
      payment: 'Payment created',
      note: 'process() is the same in all three cases. Only createPayment() returns a different object.',
      console: 'Console (output of the code)',
      result: 'Result',
      none: 'Nothing was called yet',
    },
  };

  const MAX_LINES = 8;

  function mount(stage, lang) {
    const { h } = DP;
    const { PAYMENT_TYPES, createCheckout } = DP.logic['factory-method'];
    const ui = UI[lang] || UI.en;
    let type = 'card';
    let amount = 50;

    const amountValue = h('output', { class: 'fm-amount', 'aria-live': 'polite' }, `${amount} AZN`);
    const checkoutEl = h('code', {}, '');
    const paymentEl = h('code', {}, '—');
    const resultEl = h('p', { class: 'fm-result', role: 'status', 'aria-live': 'polite' }, ui.none);
    const consoleEl = h('div', { class: 'console', role: 'log', 'aria-live': 'polite' });
    const cards = {};

    const log = (text, kind) => {
      consoleEl.append(h('div', { class: 'console-line ' + (kind || '') }, text));
      while (consoleEl.children.length > MAX_LINES) consoleEl.firstChild.remove();
    };

    function renderSelection() {
      checkoutEl.textContent = createCheckout(type).className;
      paymentEl.textContent = '—';
      PAYMENT_TYPES.forEach((t) => cards[t].classList.toggle('selected', t === type));
    }

    const optionsEl = h('div', { class: 'strategy-options', role: 'radiogroup', 'aria-label': ui.flowTitle });
    PAYMENT_TYPES.forEach((t) => {
      const input = h('input', {
        type: 'radio',
        name: 'fm-payment',
        value: t,
        checked: t === type,
        onchange: () => {
          type = t;
          renderSelection();
        },
      });
      const label = h('label', { class: 'strategy-card' }, input, h('strong', {}, ui.names[t]), h('small', {}, createCheckout(t).className));
      cards[t] = label;
      optionsEl.append(label);
    });

    const slider = h('input', {
      type: 'range',
      min: 10,
      max: 200,
      step: 10,
      value: amount,
      'aria-label': ui.amount,
      oninput: (e) => {
        amount = Number(e.target.value);
        amountValue.textContent = `${amount} AZN`;
      },
    });

    const run = () => {
      const checkout = createCheckout(type);
      log(`checkout = new ${checkout.className}()`, 'call');
      log(`checkout.process(${amount})`, 'call');
      const r = checkout.process(amount);
      log(`createPayment() -> new ${r.payment}()`, 'dim');
      log(r.message, 'out');
      paymentEl.textContent = r.payment;
      resultEl.textContent = `${ui.result}: ${r.message}`;
    };

    stage.append(
      h(
        'div',
        { class: 'fm-demo' },
        h('p', { class: 'demo-hint' }, ui.hint),
        optionsEl,
        h('div', { class: 'weight-row' }, h('strong', {}, `${ui.amount}: `), amountValue, slider),
        h(
          'div',
          { class: 'fm-flow' },
          h('div', { class: 'fm-step' }, h('span', { class: 'muted' }, ui.checkout), checkoutEl),
          h('span', { class: 'fm-arrow', 'aria-hidden': 'true' }, '→'),
          h('div', { class: 'fm-step accent' }, h('span', { class: 'muted' }, ui.factory), h('code', {}, 'new …()')),
          h('span', { class: 'fm-arrow', 'aria-hidden': 'true' }, '→'),
          h('div', { class: 'fm-step' }, h('span', { class: 'muted' }, ui.payment), paymentEl)
        ),
        h('p', { class: 'muted' }, ui.note),
        h('button', { class: 'btn', type: 'button', onclick: run }, ui.process),
        resultEl,
        h('h3', { class: 'console-title' }, ui.console),
        consoleEl
      )
    );
    renderSelection();
  }

  DP.demos['factory-method'] = mount;
})(window.DP);
