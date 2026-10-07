(function (DP) {
  // Interactive demo that mirrors the code samples: a gallery where every picture is an
  // ImageProxy. The heavy RealImage is created only on the first display() and then reused.
  // The private picture is protected by the proxy's access check.
  const UI = {
    az: {
      hint: 'Bir şəkildə display() düyməsini bas: ilk dəfə yüklənir (RealImage yaranır). İkinci dəfə bas: yenidən yüklənmir, yaddaşdan gəlir. Gizli şəkil üçün əvvəlcə daxil ol.',
      notLoaded: 'yüklənməyib',
      loading: 'yüklənir...',
      cached: 'yaddaşdadır (cache)',
      display: 'display()',
      private: 'gizli',
      login: 'Daxil ol',
      logout: 'Çıx',
      loggedIn: 'Daxil olmusan',
      loggedOut: 'Daxil olmamısan',
      calls: 'display() çağırışları',
      loads: 'Real yükləmələr (new RealImage)',
      without: 'Proksi olmasa yükləmə olardı',
      console: 'Konsol (kodun çıxışı)',
      loadingLine: 'yüklənir... (ağır iş)',
      cacheLine: 'yenidən yüklənmədi, yaddaşdan verildi',
      error: 'Xəta',
      reset: 'Sıfırla',
    },
    en: {
      hint: 'Press display() on a picture: the first time it loads (a RealImage is created). Press it again: no new load, it comes from the cache. For the private picture, log in first.',
      notLoaded: 'not loaded',
      loading: 'loading...',
      cached: 'in cache',
      display: 'display()',
      private: 'private',
      login: 'Log in',
      logout: 'Log out',
      loggedIn: 'You are logged in',
      loggedOut: 'You are logged out',
      calls: 'display() calls',
      loads: 'Real loads (new RealImage)',
      without: 'Loads without a proxy',
      console: 'Console (output of the code)',
      loadingLine: 'loading... (heavy work)',
      cacheLine: 'no new load, served from the cache',
      error: 'Error',
      reset: 'Reset',
    },
  };

  const PICTURES = [
    { file: 'sunset.jpg', icon: '🌅', secret: false },
    { file: 'mountain.jpg', icon: '🏔️', secret: false },
    { file: 'passport.jpg', icon: '🪪', secret: true },
  ];
  const LOAD_MS = 500;
  const MAX_LINES = 8;

  function mount(stage, lang) {
    const { h } = DP;
    const ui = UI[lang] || UI.en;
    const { createStats, createRealImage, createImageProxy } = DP.logic.proxy;
    let loggedIn = false;
    let timers = [];

    let stats = createStats();
    const consoleEl = h('div', { class: 'console', role: 'log', 'aria-live': 'polite' });
    const callsEl = h('strong', {}, '0');
    const loadsEl = h('strong', {}, '0');
    const withoutEl = h('strong', {}, '0');
    const loginState = h('span', { class: 'muted' }, ui.loggedOut);
    const loginBtn = h('button', { class: 'btn', type: 'button', onclick: () => toggleLogin() }, ui.login);

    const log = (text, kind) => {
      consoleEl.append(h('div', { class: 'console-line ' + (kind || '') }, text));
      while (consoleEl.children.length > MAX_LINES) consoleEl.firstChild.remove();
    };

    // the factory only adds a log line; the real counting happens in createRealImage
    const factory = (file, st) => {
      log(`new RealImage("${file}")`, 'out');
      return createRealImage(file, st);
    };

    function renderStats() {
      callsEl.textContent = String(stats.displayCalls);
      loadsEl.textContent = String(stats.realLoads);
      withoutEl.textContent = String(stats.displayCalls); // no proxy = load on every call
    }

    function toggleLogin() {
      loggedIn = !loggedIn;
      loginBtn.textContent = loggedIn ? ui.logout : ui.login;
      loginState.textContent = loggedIn ? ui.loggedIn : ui.loggedOut;
    }

    const cards = PICTURES.map((pic) => {
      const proxy = createImageProxy(pic.file, { stats, canView: () => !pic.secret || loggedIn, factory });
      let busy = false;
      const status = h('span', { class: 'px-status' }, ui.notLoaded);
      const view = h('div', { class: 'px-view', 'aria-hidden': 'true' }, '?');
      const btn = h('button', { class: 'btn', type: 'button', onclick: () => click() }, ui.display);

      function show() {
        try {
          const result = proxy.display();
          log(`→ ${result}`, 'out');
          view.textContent = pic.icon;
          status.textContent = ui.cached;
          card.classList.add('loaded');
        } catch (err) {
          log(`${ui.error}: ${err.message}`, 'err');
        }
        renderStats();
      }

      function click() {
        if (busy) return;
        log(`${pic.file.split('.')[0]}.display()`, 'call');
        if (proxy.isLoaded() || (pic.secret && !loggedIn)) {
          if (proxy.isLoaded() && (!pic.secret || loggedIn)) log(ui.cacheLine, 'dim');
          show();
          return;
        }
        // first display(): fake a short "heavy" load, then call the proxy for real
        busy = true;
        btn.disabled = true;
        status.textContent = ui.loading;
        log(ui.loadingLine, 'dim');
        timers.push(
          setTimeout(() => {
            busy = false;
            btn.disabled = false;
            show();
          }, LOAD_MS)
        );
      }

      const card = h(
        'div',
        { class: 'px-card' },
        view,
        h('strong', {}, pic.file),
        pic.secret ? h('span', { class: 'px-badge' }, ui.private) : null,
        status,
        btn
      );
      return card;
    });

    stage.append(
      h(
        'div',
        { class: 'proxy-demo' },
        h('p', { class: 'demo-hint' }, ui.hint),
        h('div', { class: 'px-login' }, loginBtn, loginState),
        h('div', { class: 'px-gallery' }, cards),
        h(
          'div',
          { class: 'px-stats', 'aria-live': 'polite' },
          h('div', {}, h('span', { class: 'muted' }, ui.calls), callsEl),
          h('div', { class: 'px-good' }, h('span', { class: 'muted' }, ui.loads), loadsEl),
          h('div', { class: 'px-bad' }, h('span', { class: 'muted' }, ui.without), withoutEl)
        ),
        h('h3', { class: 'console-title' }, ui.console),
        consoleEl
      )
    );
    renderStats();
  }

  DP.demos.proxy = mount;
})(window.DP);
