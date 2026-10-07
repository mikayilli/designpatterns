(function (DP) {
  // Interactive demo that mirrors the code samples: a home theater with four subsystems
  // (lights, projector, sound, player). The "manual way" calls them one by one in the right
  // order; HomeTheaterFacade.watchMovie() / endMovie() does all of it with one call.
  const UI = {
    az: {
      hint: 'Əvvəl "əl ilə" düymələri səhv ardıcıllıqla bas və xətanı gör. Sonra "Filmə bax" düyməsini sına: hamısı bir kliklə düzgün sırada işləyir.',
      status: 'Sistemlərin vəziyyəti',
      lamps: { lights: 'İşıq', projector: 'Proyektor', sound: 'Səs', player: 'Pleyer' },
      lightsDim: 'sönük',
      lightsBright: 'parlaq',
      on: 'açıq',
      off: 'bağlı',
      playing: 'oynayır',
      manualTitle: 'Əl ilə yol (müştəri hər şeyi özü edir)',
      manualNote: 'Düzgün sıra: yuxarıdan aşağıya. Sıranı səhv salsan, xəta alarsan.',
      facadeTitle: 'Fasad ilə yol (müştəri yalnız bir çağırış edir)',
      facadeNote: 'Müştəri alt sistemləri tanımır. Sıranı fasad bilir.',
      watch: 'Filmə bax',
      end: 'Filmi bitir',
      reset: 'Sıfırla',
      console: 'Konsol (kodun çıxışı)',
      error: 'Xəta',
    },
    en: {
      hint: 'First press the "manual" buttons in the wrong order and see the error. Then try "Watch movie": everything runs in the right order with one click.',
      status: 'State of the subsystems',
      lamps: { lights: 'Lights', projector: 'Projector', sound: 'Sound', player: 'Player' },
      lightsDim: 'dimmed',
      lightsBright: 'bright',
      on: 'on',
      off: 'off',
      playing: 'playing',
      manualTitle: 'Manual way (the client does everything itself)',
      manualNote: 'The right order is top to bottom. Get the order wrong and you get an error.',
      facadeTitle: 'Facade way (the client makes just one call)',
      facadeNote: 'The client does not know the subsystems. The facade knows the order.',
      watch: 'Watch movie',
      end: 'End movie',
      reset: 'Reset',
      console: 'Console (output of the code)',
      error: 'Error',
    },
  };

  const TITLE = 'Inception';
  const MAX_LINES = 9;

  function mount(stage, lang) {
    const { h } = DP;
    const ui = UI[lang] || UI.en;
    const consoleEl = h('div', { class: 'console', role: 'log', 'aria-live': 'polite' });

    const log = (text, kind) => {
      consoleEl.append(h('div', { class: 'console-line ' + (kind || '') }, text));
      while (consoleEl.children.length > MAX_LINES) consoleEl.firstChild.remove();
    };

    // every subsystem call that really happens is printed by the logic through this callback
    const theater = DP.logic.facade.createTheater((line) => log(line, 'out'));
    const facade = DP.logic.facade.createFacade(theater);

    // ----- status lamps -----
    const lampEls = {};
    ['lights', 'projector', 'sound', 'player'].forEach((id) => {
      const value = h('span', { class: 'fc-lamp-value' });
      lampEls[id] = { el: h('div', { class: 'fc-lamp' }, h('span', { class: 'fc-dot', 'aria-hidden': 'true' }), h('strong', {}, ui.lamps[id]), value), value };
    });

    function renderState() {
      const s = theater.state();
      const set = (id, on, text) => {
        lampEls[id].el.classList.toggle('on', on);
        lampEls[id].value.textContent = text;
      };
      set('lights', s.lights === 'dim', s.lights === 'dim' ? ui.lightsDim : ui.lightsBright);
      set('projector', s.projector === 'on', s.projector === 'on' ? ui.on : ui.off);
      set('sound', s.sound === 'on', s.sound === 'on' ? ui.on : ui.off);
      set('player', s.player !== 'off', s.player === 'playing' ? `${ui.playing}: ${s.title}` : s.player === 'on' ? ui.on : ui.off);
    }

    // run an action; show errors in the console instead of crashing
    const run = (label, action) => {
      try {
        action();
      } catch (err) {
        log(`${label} → ${ui.error}: ${err.message}`, 'err');
      }
      renderState();
    };

    const manual = [
      ['lights.dim()', () => theater.lights.dim()],
      ['projector.on()', () => theater.projector.on()],
      ['sound.on()', () => theater.sound.on()],
      ['player.on()', () => theater.player.on()],
      [`player.play("${TITLE}")`, () => theater.player.play(TITLE)],
    ];

    const manualButtons = manual.map(([label, fn], i) =>
      h('button', { class: 'btn fc-step', type: 'button', onclick: () => run(label, fn) }, h('span', { class: 'fc-num' }, String(i + 1)), h('code', {}, label))
    );

    stage.append(
      h(
        'div',
        { class: 'facade-demo' },
        h('p', { class: 'demo-hint' }, ui.hint),
        h('h3', { class: 'console-title' }, ui.status),
        h('div', { class: 'fc-lamps' }, Object.values(lampEls).map((l) => l.el)),
        h(
          'div',
          { class: 'fc-panels' },
          h('div', { class: 'fc-panel' }, h('strong', {}, ui.manualTitle), h('p', { class: 'muted' }, ui.manualNote), h('div', { class: 'fc-steps' }, manualButtons)),
          h(
            'div',
            { class: 'fc-panel fc-panel-accent' },
            h('strong', {}, ui.facadeTitle),
            h('p', { class: 'muted' }, ui.facadeNote),
            h(
              'div',
              { class: 'fc-steps' },
              h(
                'button',
                {
                  class: 'btn fc-main',
                  type: 'button',
                  onclick: () => {
                    log(`facade.watchMovie("${TITLE}")`, 'call');
                    run('watchMovie', () => facade.watchMovie(TITLE));
                  },
                },
                ui.watch
              ),
              h(
                'button',
                {
                  class: 'btn',
                  type: 'button',
                  onclick: () => {
                    log('facade.endMovie()', 'call');
                    run('endMovie', () => facade.endMovie());
                  },
                },
                ui.end
              )
            )
          )
        ),
        h(
          'button',
          {
            class: 'btn fc-reset',
            type: 'button',
            onclick: () => {
              theater.reset();
              consoleEl.replaceChildren();
              renderState();
            },
          },
          ui.reset
        ),
        h('h3', { class: 'console-title' }, ui.console),
        consoleEl
      )
    );
    renderState();
  }

  DP.demos.facade = mount;
})(window.DP);
