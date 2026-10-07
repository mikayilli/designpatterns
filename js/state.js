(function (DP) {
  const LANGS = ['az', 'en'];
  const CODE_LANGS = ['cpp', 'java', 'js', 'php'];
  const THEMES = ['light', 'dark'];
  const DEFAULTS = { lang: 'az', code: 'js', theme: 'light' };
  const STORAGE_KEY = 'dp-settings';

  function parseHash(hash) {
    const raw = String(hash || '').replace(/^#/, '');
    const [id, query = ''] = raw.split('?');
    const params = {};
    query
      .split('&')
      .filter(Boolean)
      .forEach((pair) => {
        const [k, v = ''] = pair.split('=');
        try {
          params[decodeURIComponent(k)] = decodeURIComponent(v);
        } catch (e) {
          /* malformed encoding: skip this pair */
        }
      });
    return { id, params };
  }

  function buildHash(id, settings) {
    return `#${id}?lang=${settings.lang}&code=${settings.code}`;
  }

  function pick(value, allowed, fallback) {
    return allowed.includes(value) ? value : fallback;
  }

  // Priority: URL params > stored/in-memory settings > defaults. Invalid values are ignored.
  // Theme is never in the URL.
  function resolveSettings(params, stored, defaults = DEFAULTS) {
    const s = stored || {};
    const p = params || {};
    return {
      lang: pick(p.lang, LANGS, pick(s.lang, LANGS, defaults.lang)),
      code: pick(p.code, CODE_LANGS, pick(s.code, CODE_LANGS, defaults.code)),
      theme: pick(s.theme, THEMES, defaults.theme),
    };
  }

  function loadStored() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function saveStored(settings) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      /* private mode / blocked storage: settings just aren't remembered */
    }
  }

  DP.state = {
    LANGS,
    CODE_LANGS,
    THEMES,
    DEFAULTS,
    parseHash,
    buildHash,
    resolveSettings,
    loadStored,
    saveStored,
  };
})(window.DP);
