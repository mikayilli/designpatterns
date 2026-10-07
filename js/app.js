(function (DP) {
  const { state, i18n, render } = DP;
  const navEl = document.getElementById('nav');
  const pageEl = document.getElementById('page');
  const menuBtn = document.getElementById('menu-toggle');
  const systemTheme =
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  let settings = null;
  let currentId = null;

  function applyStaticText() {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = i18n.t(settings.lang, el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      el.setAttribute('aria-label', i18n.t(settings.lang, el.dataset.i18nAria));
    });
    document.documentElement.lang = settings.lang;
  }

  function applyControls() {
    document.querySelectorAll('[data-lang]').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.lang === settings.lang));
    });
    document.querySelectorAll('[data-code]').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.code === settings.code));
    });
    document.documentElement.dataset.theme = settings.theme;
  }

  function change(patch) {
    settings = { ...settings, ...patch };
    state.saveStored(settings);
    if ('theme' in patch) {
      applyControls();
      return;
    }
    location.hash = state.buildHash(currentId, settings); // triggers hashchange -> route()
  }

  function route() {
    const { id, params } = state.parseHash(location.hash);
    // in-memory settings win over storage, so choices survive even if storage is blocked
    const base = settings || state.loadStored();
    settings = state.resolveSettings(params, base, { ...state.DEFAULTS, theme: systemTheme });

    const pattern = DP.patterns.find((p) => p.id === id) || DP.patterns[0];
    if (!pattern) {
      pageEl.textContent = 'No patterns registered.';
      return;
    }
    const samePattern = pattern.id === currentId; // language / code-language change, not navigation
    const savedY = window.scrollY;
    currentId = pattern.id;
    history.replaceState(null, '', state.buildHash(pattern.id, settings)); // normalise, no hashchange
    state.saveStored(settings);

    applyControls();
    applyStaticText();
    render.renderNav(navEl, DP.patterns, pattern.id, settings.lang);
    render.renderPattern(pageEl, pattern, settings, { setCode: (code) => change({ code }) });
    document.title = `${pattern.name} · ${i18n.t(settings.lang, 'appTitle')}`;
    document.body.classList.remove('nav-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    // new pattern -> start at the top; same pattern re-rendered (language switch) -> keep the position
    window.scrollTo(0, samePattern ? savedY : 0);
  }

  document.querySelectorAll('[data-lang]').forEach((b) => {
    b.addEventListener('click', () => change({ lang: b.dataset.lang }));
  });
  document.querySelectorAll('[data-code]').forEach((b) => {
    b.addEventListener('click', () => change({ code: b.dataset.code }));
  });
  document.getElementById('theme-toggle').addEventListener('click', () => {
    change({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  });
  function setNav(open) {
    document.body.classList.toggle('nav-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
  }
  menuBtn.addEventListener('click', () => setNav(!document.body.classList.contains('nav-open')));
  document.getElementById('scrim').addEventListener('click', () => setNav(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setNav(false);
  });

  window.addEventListener('hashchange', route);
  route();
})(window.DP);
