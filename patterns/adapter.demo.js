(function (DP) {
  // Interactive demo that mirrors the code samples: the app expects temperature.celsius(),
  // a sensor offers readFahrenheit(). Pick what the sensor (plug) offers and what the
  // app (socket) expects, then add an Adapter between them.
  const UI = {
    az: {
      hint: 'Fişi (sensor) və rozetkanı (tətbiq) seç, "Qoş" düyməsini bas. Uyğun gəlmirsə, adapteri əlavə et və yenə qoş.',
      plugTitle: 'Fiş: sensorun təklif etdiyi',
      socketTitle: 'Rozetka: tətbiqin gözlədiyi',
      plugs: { fahrenheit: 'readFahrenheit() (Fahrenheit)', celsius: 'celsius() (Selsi)' },
      sockets: { celsius: 'celsius() (Selsi)', fahrenheit: 'fahrenheit() (Fahrenheit)' },
      adapterOff: 'Adapter əlavə et',
      adapterOn: 'Adapteri çıxar',
      adapterLabel: 'Adapter',
      noAdapter: 'adapter yoxdur',
      connect: 'Qoş',
      fits: 'Uyğun gəlir: tətbiq istədiyi çağırışı birbaşa alır.',
      doesNotFit: 'Uyğun gəlmir: fiş rozetkaya oturmur. Adapter əlavə et.',
      works: 'İşləyir: adapter çağırışı tərcümə etdi.',
      needless: 'İşləyir, amma adapter lazımsızdır: fiş və rozetka onsuz da uyğundur.',
      idle: 'Hələ heç nə qoşulmayıb.',
      console: 'Konsol (kodun çıxışı)',
      reading: 'Nəticə',
    },
    en: {
      hint: 'Pick the plug (sensor) and the socket (app), then press "Connect". If they do not match, add the adapter and connect again.',
      plugTitle: 'Plug: what the sensor offers',
      socketTitle: 'Socket: what the app expects',
      plugs: { fahrenheit: 'readFahrenheit() (Fahrenheit)', celsius: 'celsius() (Celsius)' },
      sockets: { celsius: 'celsius() (Celsius)', fahrenheit: 'fahrenheit() (Fahrenheit)' },
      adapterOff: 'Add adapter',
      adapterOn: 'Remove adapter',
      adapterLabel: 'Adapter',
      noAdapter: 'no adapter',
      connect: 'Connect',
      fits: 'It fits: the app gets the call it wants directly.',
      doesNotFit: 'Does not fit: the plug does not go into the socket. Add an adapter.',
      works: 'It works: the adapter translated the call.',
      needless: 'It works, but the adapter is needless: the plug and the socket already match.',
      idle: 'Nothing is connected yet.',
      console: 'Console (output of the code)',
      reading: 'Result',
    },
  };

  const MAX_LINES = 8;

  function mount(stage, lang) {
    const { h } = DP;
    const ui = UI[lang] || UI.en;
    const logic = DP.logic.adapter;
    let plug = 'fahrenheit';
    let socket = 'celsius';
    let withAdapter = false;

    const consoleEl = h('div', { class: 'console', role: 'log', 'aria-live': 'polite' });
    const statusEl = h('p', { class: 'adp-status', role: 'status', 'aria-live': 'polite' }, ui.idle);
    const valueEl = h('output', { class: 'adp-value' }, '—');

    const log = (text, kind) => {
      consoleEl.append(h('div', { class: 'console-line ' + (kind || '') }, text));
      while (consoleEl.children.length > MAX_LINES) consoleEl.firstChild.remove();
    };

    const plugBox = h('div', { class: 'adp-box adp-plug' });
    const adapterBox = h('div', { class: 'adp-box adp-adapter' });
    const socketBox = h('div', { class: 'adp-box adp-socket' });
    const toggle = h('button', { class: 'btn', type: 'button', 'aria-pressed': 'false' }, ui.adapterOff);

    function choiceGroup(labels, current, onPick) {
      const buttons = {};
      const group = h('div', { class: 'adp-choices', role: 'group' });
      logic.KINDS.forEach((k) => {
        buttons[k] = h(
          'button',
          {
            class: 'btn adp-choice',
            type: 'button',
            'aria-pressed': String(k === current()),
            onclick: () => {
              onPick(k);
              logic.KINDS.forEach((x) => buttons[x].setAttribute('aria-pressed', String(x === current())));
              refresh();
            },
          },
          labels[k]
        );
        group.append(buttons[k]);
      });
      return group;
    }

    function refresh() {
      const match = plug === socket;
      plugBox.textContent = '';
      socketBox.textContent = '';
      adapterBox.textContent = '';
      plugBox.append(
        h('span', { class: 'adp-icon', 'aria-hidden': 'true' }, '🔌'),
        h('code', {}, `sensor.${plug === 'celsius' ? 'celsius' : 'readFahrenheit'}()`)
      );
      socketBox.append(h('span', { class: 'adp-icon', 'aria-hidden': 'true' }, '🔲'), h('code', {}, `temperature.${socket}()`));
      adapterBox.append(h('strong', {}, ui.adapterLabel), h('code', {}, withAdapter ? 'adapter' : ui.noAdapter));
      adapterBox.classList.toggle('on', withAdapter);
      plugBox.classList.toggle('mismatch', !match && !withAdapter);
      toggle.textContent = withAdapter ? ui.adapterOn : ui.adapterOff;
      toggle.setAttribute('aria-pressed', String(withAdapter));
    }

    function connect() {
      const r = logic.connect(plug, socket, withAdapter);
      const call = r.via === 'adapter' ? `adapter.${socket}()` : `temperature.${socket}()`;
      log(call, 'call');
      if (!r.ok) {
        log(`TypeError: temperature.${socket} is not a function`, 'dim');
        statusEl.textContent = ui.doesNotFit;
        statusEl.className = 'adp-status bad';
        valueEl.textContent = '—';
        return;
      }
      r.lines.forEach((l) => log(l, 'out'));
      log(`→ ${r.value}°${r.unit}`, 'out');
      valueEl.textContent = `${r.value}°${r.unit}`;
      statusEl.textContent = r.needless ? ui.needless : r.via === 'adapter' ? ui.works : ui.fits;
      statusEl.className = 'adp-status ' + (r.needless ? 'warn' : 'good');
    }

    toggle.addEventListener('click', () => {
      withAdapter = !withAdapter;
      refresh();
    });

    stage.append(
      h(
        'div',
        { class: 'adp-demo' },
        h('p', { class: 'demo-hint' }, ui.hint),
        h('h3', { class: 'console-title' }, ui.plugTitle),
        choiceGroup(ui.plugs, () => plug, (k) => (plug = k)),
        h('h3', { class: 'console-title' }, ui.socketTitle),
        choiceGroup(ui.sockets, () => socket, (k) => (socket = k)),
        h('div', { class: 'adp-row' }, plugBox, adapterBox, socketBox),
        h('div', { class: 'adp-actions' }, toggle, h('button', { class: 'btn adp-connect', type: 'button', onclick: connect }, ui.connect)),
        statusEl,
        h('p', { class: 'muted' }, `${ui.reading}: `, valueEl),
        h('h3', { class: 'console-title' }, ui.console),
        consoleEl
      )
    );
    refresh();
  }

  DP.demos.adapter = mount;
})(window.DP);
