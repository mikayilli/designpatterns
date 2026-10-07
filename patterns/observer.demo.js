(function (DP) {
  // Interactive demo that mirrors the code samples: a WeatherStation with a list of
  // listeners (phone, web, watch). subscribe() / unsubscribe() / setTemperature(t).
  const UI = {
    az: {
      hint: 'Əvvəl bir neçə cihazda "Abunə ol" düyməsini bas, sonra temperaturu dəyiş. Yalnız abunə olanlar xəbər alır.',
      station: 'Hava stansiyası',
      stationNote: 'Temperaturu ölçür və siyahıdakılara xəbər verir',
      colder: 'Temperaturu azalt',
      warmer: 'Temperaturu artır',
      devices: { phone: 'Telefon', web: 'Veb səhifə', watch: 'Saat' },
      subscribe: 'Abunə ol',
      unsubscribe: 'Abunəlikdən çıx',
      on: 'abunədir',
      off: 'abunə deyil',
      list: 'Stansiyanın siyahısı',
      listNote: 'Stansiya siyahıda yalnız çağıracağı funksiyaları görür (ƒ). Onların telefon, veb səhifə və ya saat olduğunu bilmir, bilməsinə də ehtiyac yoxdur.',
      console: 'Konsol (kodun çıxışı)',
      nobody: 'Siyahı boşdur, heç kimə xəbər verilmədi',
    },
    en: {
      hint: 'First press "Subscribe" on a few devices, then change the temperature. Only subscribed devices get the news.',
      station: 'Weather station',
      stationNote: 'Measures the temperature and notifies everyone on its list',
      colder: 'Decrease temperature',
      warmer: 'Increase temperature',
      devices: { phone: 'Phone', web: 'Web page', watch: 'Watch' },
      subscribe: 'Subscribe',
      unsubscribe: 'Unsubscribe',
      on: 'subscribed',
      off: 'not subscribed',
      list: "Station's list",
      listNote: 'The station only sees functions to call (ƒ) in its list. It does not know whether they are a phone, a web page or a watch, and it does not need to.',
      console: 'Console (output of the code)',
      nobody: 'The list is empty, nobody was notified',
    },
  };

  const DEVICES = [
    { id: 'phone', icon: '📱' },
    { id: 'web', icon: '🖥️' },
    { id: 'watch', icon: '⌚' },
  ];
  const MIN_T = 0;
  const MAX_T = 40;
  const MAX_LINES = 7;

  function mount(stage, lang) {
    const { h } = DP;
    const ui = UI[lang] || UI.en;
    const station = DP.logic.observer.createStation(22);

    const tempEl = h('output', { class: 'station-temp', 'aria-live': 'polite' }, `${station.getTemperature()}°C`);
    const listEl = h('code', { class: 'list-value' });
    const consoleEl = h('div', { class: 'console', role: 'log', 'aria-live': 'polite' });

    const log = (text, kind) => {
      consoleEl.append(h('div', { class: 'console-line ' + (kind || '') }, text));
      while (consoleEl.children.length > MAX_LINES) consoleEl.firstChild.remove();
    };
    const updateList = () => {
      const fns = Array(station.count()).fill('ƒ(t)');
      listEl.textContent = `[ ${fns.join(', ')} ]`;
    };

    const cards = DEVICES.map((dev) => {
      const name = ui.devices[dev.id];
      const value = h('span', { class: 'device-value' }, '—');
      const status = h('span', { class: 'device-status' }, ui.off);
      let subscribed = false;

      // this is the function the station stores; the station never sees "phone" or "watch"
      const listener = (t) => {
        value.textContent = `${t}°C`;
        card.classList.add('flash');
        setTimeout(() => card.classList.remove('flash'), 700);
        log(`${dev.id}: ${t}`, 'out');
      };

      const btn = h(
        'button',
        {
          class: 'btn',
          type: 'button',
          onclick: () => {
            subscribed = !subscribed;
            if (subscribed) station.subscribe(listener);
            else station.unsubscribe(listener);
            log(`station.${subscribed ? 'subscribe' : 'unsubscribe'}(${dev.id})`, 'call');
            btn.textContent = subscribed ? ui.unsubscribe : ui.subscribe;
            status.textContent = subscribed ? ui.on : ui.off;
            card.classList.toggle('on', subscribed);
            updateList();
          },
        },
        ui.subscribe
      );

      const card = h(
        'div',
        { class: 'device-card' },
        h('div', { class: 'device-icon', 'aria-hidden': 'true' }, dev.icon),
        h('strong', {}, name),
        value,
        status,
        btn
      );
      return card;
    });

    const change = (delta) => {
      const current = station.getTemperature();
      const next = Math.max(MIN_T, Math.min(MAX_T, current + delta));
      if (next === current) return;
      log(`station.setTemperature(${next})`, 'call');
      if (station.count() === 0) log(ui.nobody, 'dim');
      station.setTemperature(next);
      tempEl.textContent = `${next}°C`;
    };

    stage.append(
      h(
        'div',
        { class: 'obs-demo' },
        h('p', { class: 'demo-hint' }, ui.hint),
        h(
          'div',
          { class: 'station-card' },
          h('div', {}, h('strong', {}, `${ui.station} `), h('code', {}, 'WeatherStation'), h('p', { class: 'muted' }, ui.stationNote)),
          h(
            'div',
            { class: 'temp-control' },
            h('button', { class: 'btn round', type: 'button', 'aria-label': ui.colder, onclick: () => change(-1) }, '−'),
            tempEl,
            h('button', { class: 'btn round', type: 'button', 'aria-label': ui.warmer, onclick: () => change(1) }, '+')
          )
        ),
        h('div', { class: 'list-row' }, h('strong', {}, `${ui.list}: `), listEl, h('p', { class: 'muted' }, ui.listNote)),
        h('div', { class: 'devices' }, cards),
        h('h3', { class: 'console-title' }, ui.console),
        consoleEl
      )
    );
    updateList();
  }

  DP.demos.observer = mount;
})(window.DP);
