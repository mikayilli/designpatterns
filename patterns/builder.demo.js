(function (DP) {
  // Interactive demo that mirrors the code samples: a pizza with 7 choices. On the left
  // the unreadable constructor call (new Pizza("L", true, false, ...)), on the right the
  // PizzaBuilder chain that is assembled step by step. build() creates the real pizza.
  const UI = {
    az: {
      hint: 'Ölçünü seç, inqrediyentləri aç-bağla. Pis tərəfdə true/false cərgəsinə, yaxşı tərəfdə isə oxunaqlı zəncirə bax. Sonda build() düyməsini bas.',
      size: 'Ölçü',
      options: 'Seçimlər',
      labels: {
        cheese: 'Pendir',
        olives: 'Zeytun',
        mushrooms: 'Göbələk',
        pepperoni: 'Pepperoni',
        thinCrust: 'Nazik xəmir',
        extraSauce: 'Əlavə sous',
      },
      badTitle: 'Pis: uzun konstruktor',
      badNote: 'Hansı true nəyi bildirir? Bunu bilmək üçün sinfin kodunu açıb sırayla saymalısan. İki parametrin yerini səhv salsan, kod yenə işləyəcək, amma pizza səhv olacaq.',
      goodTitle: 'Yaxşı: Builder zənciri',
      goodNote: 'Hər addım nə etdiyini adı ilə deyir. Seçmədiyin şey zəncirdə yoxdur.',
      build: 'build() çağır',
      result: 'Hazır pizza',
      none: 'Hələ build() çağırılmayıb',
      stale: 'Seçimlər dəyişdi. Yeni pizza üçün yenidən build() çağır.',
      console: 'Konsol (kodun çıxışı)',
    },
    en: {
      hint: 'Pick a size and switch the ingredients on and off. Look at the true/false row on the bad side and at the readable chain on the good side. Finally press build().',
      size: 'Size',
      options: 'Options',
      labels: {
        cheese: 'Cheese',
        olives: 'Olives',
        mushrooms: 'Mushrooms',
        pepperoni: 'Pepperoni',
        thinCrust: 'Thin crust',
        extraSauce: 'Extra sauce',
      },
      badTitle: 'Bad: long constructor',
      badNote: 'Which true means what? To find out you must open the class and count the positions. If you swap two parameters the code still runs, but the pizza is wrong.',
      goodTitle: 'Good: Builder chain',
      goodNote: 'Each step says what it does by its name. What you did not choose is simply not in the chain.',
      build: 'Call build()',
      result: 'Finished pizza',
      none: 'build() was not called yet',
      stale: 'The choices changed. Call build() again for a new pizza.',
      console: 'Console (output of the code)',
    },
  };

  const OPTION_KEYS = ['cheese', 'olives', 'mushrooms', 'pepperoni', 'thinCrust', 'extraSauce'];
  const MAX_LINES = 6;

  function mount(stage, lang) {
    const { h } = DP;
    const { SIZES, fromChoices, telescoping, describePizza } = DP.logic.builder;
    const ui = UI[lang] || UI.en;
    const choices = { size: 'M', cheese: true, olives: false, mushrooms: false, pepperoni: false, thinCrust: false, extraSauce: false };
    let built = false;

    const badEl = h('code', { class: 'bd-bad-call' });
    const chainEl = h('div', { class: 'bd-chain' });
    const resultEl = h('p', { class: 'bd-result', role: 'status', 'aria-live': 'polite' }, ui.none);
    const consoleEl = h('div', { class: 'console', role: 'log', 'aria-live': 'polite' });
    const sizeCards = {};

    const log = (text, kind) => {
      consoleEl.append(h('div', { class: 'console-line ' + (kind || '') }, text));
      while (consoleEl.children.length > MAX_LINES) consoleEl.firstChild.remove();
    };

    function render() {
      badEl.textContent = telescoping(choices);
      const chain = fromChoices(choices).chain();
      chainEl.replaceChildren(
        ...chain.map((call, i) => h('div', { class: 'bd-call' }, i === 0 ? call : `  .${call}`))
      );
      SIZES.forEach((s) => sizeCards[s].classList.toggle('selected', s === choices.size));
      if (built) {
        built = false;
        resultEl.textContent = ui.stale;
      }
    }

    const sizeOptions = h('div', { class: 'strategy-options bd-sizes', role: 'radiogroup', 'aria-label': ui.size });
    SIZES.forEach((s) => {
      const input = h('input', {
        type: 'radio',
        name: 'bd-size',
        value: s,
        checked: s === choices.size,
        onchange: () => {
          choices.size = s;
          render();
        },
      });
      const label = h('label', { class: 'strategy-card' }, input, h('strong', {}, s), h('small', {}, `size("${s}")`));
      sizeCards[s] = label;
      sizeOptions.append(label);
    });

    const optionBoxes = OPTION_KEYS.map((key) =>
      h(
        'label',
        { class: 'bd-opt' },
        h('input', {
          type: 'checkbox',
          checked: choices[key],
          onchange: (e) => {
            choices[key] = e.target.checked;
            render();
          },
        }),
        h('span', {}, ui.labels[key])
      )
    );

    const build = () => {
      const builder = fromChoices(choices);
      builder.chain().forEach((call, i, all) => {
        log(i === 0 ? `const builder = ${call}` : i === all.length - 1 ? `const pizza = builder.${call}` : `builder.${call}`, 'call');
      });
      const pizza = builder.build();
      log(`pizza = ${JSON.stringify(pizza)}`, 'out');
      resultEl.textContent = `${ui.result}: ${describePizza(pizza)}`;
      built = true;
    };

    stage.append(
      h(
        'div',
        { class: 'bd-demo' },
        h('p', { class: 'demo-hint' }, ui.hint),
        h('strong', {}, ui.size),
        sizeOptions,
        h('strong', {}, ui.options),
        h('div', { class: 'bd-opts' }, optionBoxes),
        h(
          'div',
          { class: 'bd-cols' },
          h('section', { class: 'bd-col bad' }, h('h3', {}, ui.badTitle), badEl, h('p', { class: 'muted' }, ui.badNote)),
          h('section', { class: 'bd-col good' }, h('h3', {}, ui.goodTitle), chainEl, h('p', { class: 'muted' }, ui.goodNote))
        ),
        h('button', { class: 'btn', type: 'button', onclick: build }, ui.build),
        resultEl,
        h('h3', { class: 'console-title' }, ui.console),
        consoleEl
      )
    );
    render();
  }

  DP.demos.builder = mount;
})(window.DP);
