# Design Patterns Visualizer — Phase 1–2 Implementation Plan (Skeleton + Prototype)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the static-site skeleton (navigation, AZ/EN + code-language + theme switching, page renderer, validation tooling) and two fully finished patterns (Observer, Strategy) so the content format can be reviewed before the other 10 patterns are written.

**Architecture:** Plain HTML/CSS/vanilla JS, no build step, classic `<script>` tags (no ES modules, so `file://` works). Everything hangs off one global `window.DP` namespace. Each pattern is one data file (`patterns/<id>.js`) that calls `DP.register(...)`; its pure logic lives in `patterns/<id>.logic.js` so it can be unit-tested in Node. A tiny Node harness (`tests/run-node.js`) loads the same scripts with `window = global` and runs `tests/*.test.js`.

**Tech Stack:** HTML, CSS, vanilla JS (ES2020), Prism.js 1.29.0 from cdnjs (syntax highlighting only), Node (only to run tests; no npm packages).

**Notes**
- `C:\Users\kainmh\Desktop\myapp\designpatterns` is **not a git repo**, so tasks have no commit steps. If you run `git init`, commit after each task.
- Out of scope for this plan (later plans): the other 10 patterns, search box, README, final polish (spec phases 3–6).
- Adding a pattern later means: new `patterns/<id>.logic.js` (optional) + `patterns/<id>.js` + script tags in `index.html` and `tests/validate.html`.

---

## File Structure

| File | Responsibility |
|---|---|
| `js/registry.js` | Creates `window.DP`, `DP.patterns`, `DP.logic`, `DP.register()` |
| `js/i18n.js` | UI strings (AZ/EN), `t(lang,key)` with fallback, `text(pattern,lang)` with fallback |
| `js/dom.js` | `DP.h(tag, props, ...children)` DOM builder (browser only) |
| `js/state.js` | URL-hash parsing/building, settings resolution, localStorage load/save |
| `js/validate.js` | `DP.validate.validatePattern / validateAll` — checks pattern data completeness |
| `js/render.js` | Builds sidebar and pattern page DOM (browser only) |
| `js/app.js` | Wires routing, toggles, theme, mobile menu (browser only) |
| `patterns/observer.logic.js`, `patterns/strategy.logic.js` | Pure logic used by demos, unit-tested |
| `patterns/observer.js`, `patterns/strategy.js` | Pattern data: texts, SVG diagram, code in 4 languages, demo `mount()` |
| `css/style.css` | Theme variables, layout, code panels, demos, diagrams |
| `index.html` | App shell |
| `tests/run-node.js` | Node test harness |
| `tests/*.test.js` | Unit tests (`module.exports = (test, assert, DP) => {...}`) |
| `tests/validate.html` | Browser page listing data problems per pattern |

---

### Task 1: Test harness and registry

**Files:**
- Create: `tests/run-node.js`
- Create: `js/registry.js`

- [ ] **Step 1: Check Node is available**

Run: `node -v`
Expected: a version such as `v20.x` or newer. If the command is not found, install Node LTS before continuing.

- [ ] **Step 2: Create the test harness**

Create `tests/run-node.js`:

```js
const fs = require('fs');
const path = require('path');
const assert = require('assert');

global.window = global;
const root = path.join(__dirname, '..');

// Browser-only files (dom, render, app) are intentionally not loaded here.
['registry', 'i18n', 'state', 'validate'].forEach((name) => {
  const file = path.join(root, 'js', name + '.js');
  if (fs.existsSync(file)) require(file);
});

const patternFiles = fs.readdirSync(path.join(root, 'patterns')).filter((f) => f.endsWith('.js'));
patternFiles.filter((f) => f.endsWith('.logic.js')).forEach((f) => require(path.join(root, 'patterns', f)));
patternFiles.filter((f) => !f.endsWith('.logic.js')).forEach((f) => require(path.join(root, 'patterns', f)));

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log('  ok   ' + name);
  } catch (err) {
    failed += 1;
    console.log('  FAIL ' + name + '\n       ' + err.message);
  }
}

fs.readdirSync(__dirname)
  .filter((f) => f.endsWith('.test.js'))
  .forEach((f) => {
    console.log(f);
    require(path.join(__dirname, f))(test, assert, global.DP);
  });

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
```

- [ ] **Step 3: Create the patterns folder placeholder so the harness can read it**

Run: `mkdir -p patterns css js tests docs`
Expected: no output (folders already partly exist).

- [ ] **Step 4: Run the harness before registry exists**

Run: `node tests/run-node.js`
Expected: `0 passed, 0 failed` and exit code 0 (no test files yet). This proves the harness itself runs.

- [ ] **Step 5: Create the registry**

Create `js/registry.js`:

```js
(function (root) {
  const DP = (root.DP = root.DP || {});
  DP.patterns = [];
  DP.logic = {};
  DP.register = function (pattern) {
    DP.patterns.push(pattern);
  };
})(window);
```

- [ ] **Step 6: Re-run the harness**

Run: `node tests/run-node.js`
Expected: `0 passed, 0 failed`.

---

### Task 2: i18n module (TDD)

**Files:**
- Create: `tests/i18n.test.js`
- Create: `js/i18n.js`

- [ ] **Step 1: Write the failing test**

Create `tests/i18n.test.js`:

```js
module.exports = (test, assert, DP) => {
  const silently = (fn) => {
    const warn = console.warn;
    console.warn = () => {};
    try {
      return fn();
    } finally {
      console.warn = warn;
    }
  };

  test('t returns the string for a known key', () => {
    assert.strictEqual(DP.i18n.t('az', 'problem'), 'Problem');
    assert.strictEqual(DP.i18n.t('en', 'badCode'), 'Problematic code');
  });

  test('t falls back to en when the key is missing in the requested language', () => {
    DP.i18n.strings.en.__tmp = 'fallback';
    try {
      assert.strictEqual(silently(() => DP.i18n.t('az', '__tmp')), 'fallback');
    } finally {
      delete DP.i18n.strings.en.__tmp;
    }
  });

  test('t returns the key itself when missing everywhere', () => {
    assert.strictEqual(silently(() => DP.i18n.t('az', '__nope')), '__nope');
  });

  test('text returns the requested language block', () => {
    const p = { id: 'x', text: { az: { summary: 'AZ' }, en: { summary: 'EN' } } };
    assert.strictEqual(DP.i18n.text(p, 'az').summary, 'AZ');
  });

  test('text falls back to en when the language block is missing', () => {
    const p = { id: 'x', text: { en: { summary: 'EN' } } };
    assert.strictEqual(silently(() => DP.i18n.text(p, 'az')).summary, 'EN');
  });
};
```

- [ ] **Step 2: Run to verify it fails**

Run: `node tests/run-node.js`
Expected: FAIL lines mentioning `Cannot read properties of undefined (reading 't')` (DP.i18n does not exist yet); exit code 1.

- [ ] **Step 3: Implement i18n**

Create `js/i18n.js`:

```js
(function (DP) {
  const strings = {
    az: {
      appTitle: 'Dizayn Pattern-ləri',
      problem: 'Problem',
      badCode: 'Problemli kod',
      goodCode: 'Həll olunmuş kod',
      solution: 'Həll',
      diagram: 'Diaqram',
      animation: 'İnteraktiv demo',
      usedIn: 'Harada işlənir',
      avoid: 'Nə vaxt işlətmə',
      noCode: 'Bu dildə nümunə hələ əlavə olunmayıb',
      showJs: 'JavaScript nümunəsinə bax',
      animFailed: 'Animasiya yüklənmədi',
      menu: 'Menyu',
      language: 'Sayt dili',
      codeLanguage: 'Kod dili',
      theme: 'Temanı dəyiş',
      category_creational: 'Yaradıcı (Creational)',
      category_structural: 'Struktur (Structural)',
      category_behavioral: 'Davranış (Behavioral)',
    },
    en: {
      appTitle: 'Design Patterns',
      problem: 'Problem',
      badCode: 'Problematic code',
      goodCode: 'Fixed code',
      solution: 'Solution',
      diagram: 'Diagram',
      animation: 'Interactive demo',
      usedIn: 'Where it is used',
      avoid: 'When not to use it',
      noCode: 'No example in this language yet',
      showJs: 'Show the JavaScript example',
      animFailed: 'Animation failed to load',
      menu: 'Menu',
      language: 'Site language',
      codeLanguage: 'Code language',
      theme: 'Toggle theme',
      category_creational: 'Creational',
      category_structural: 'Structural',
      category_behavioral: 'Behavioral',
    },
  };

  function t(lang, key) {
    const own = strings[lang] && strings[lang][key];
    if (own !== undefined) return own;
    console.warn(`[i18n] missing "${key}" for "${lang}"`);
    return strings.en[key] !== undefined ? strings.en[key] : key;
  }

  function text(pattern, lang) {
    if (pattern.text && pattern.text[lang]) return pattern.text[lang];
    console.warn(`[i18n] pattern "${pattern.id}" has no "${lang}" text, using en`);
    return pattern.text.en;
  }

  DP.i18n = { strings, t, text };
})(window.DP);
```

- [ ] **Step 4: Run to verify it passes**

Run: `node tests/run-node.js`
Expected: all five i18n tests `ok`, `5 passed, 0 failed`.

---

### Task 3: State module (TDD)

**Files:**
- Create: `tests/state.test.js`
- Create: `js/state.js`

- [ ] **Step 1: Write the failing test**

Create `tests/state.test.js`:

```js
module.exports = (test, assert, DP) => {
  const S = DP.state;

  test('parseHash splits id and params', () => {
    assert.deepStrictEqual(S.parseHash('#observer?lang=en&code=java'), {
      id: 'observer',
      params: { lang: 'en', code: 'java' },
    });
  });

  test('parseHash handles empty input', () => {
    assert.deepStrictEqual(S.parseHash(''), { id: '', params: {} });
    assert.deepStrictEqual(S.parseHash(undefined), { id: '', params: {} });
  });

  test('parseHash skips malformed percent-encoding instead of throwing', () => {
    assert.deepStrictEqual(S.parseHash('#x?lang=%E0%A4%A&code=php'), {
      id: 'x',
      params: { code: 'php' },
    });
  });

  test('buildHash writes id, lang and code', () => {
    assert.strictEqual(
      S.buildHash('strategy', { lang: 'az', code: 'php', theme: 'dark' }),
      '#strategy?lang=az&code=php'
    );
  });

  test('params beat stored, stored beats defaults', () => {
    const r = S.resolveSettings({ lang: 'en' }, { lang: 'az', code: 'php', theme: 'dark' });
    assert.deepStrictEqual(r, { lang: 'en', code: 'php', theme: 'dark' });
  });

  test('invalid values are ignored', () => {
    const r = S.resolveSettings({ lang: 'fr', code: 'rust' }, { theme: 'neon' });
    assert.deepStrictEqual(r, { lang: 'az', code: 'js', theme: 'light' });
  });

  test('resolveSettings works with no input', () => {
    assert.deepStrictEqual(S.resolveSettings(undefined, null), { lang: 'az', code: 'js', theme: 'light' });
  });

  test('loadStored returns an object even when storage is unavailable', () => {
    assert.deepStrictEqual(S.loadStored(), {});
  });
};
```

- [ ] **Step 2: Run to verify it fails**

Run: `node tests/run-node.js`
Expected: state tests FAIL with `Cannot read properties of undefined (reading 'parseHash')`.

- [ ] **Step 3: Implement state**

Create `js/state.js`:

```js
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
```

- [ ] **Step 4: Run to verify it passes**

Run: `node tests/run-node.js`
Expected: all state tests `ok`; total `13 passed, 0 failed`. (If Node prints an experimental-localStorage warning, that is harmless.)

---

### Task 4: Validation module (TDD)

**Files:**
- Create: `tests/validate.test.js`
- Create: `js/validate.js`

- [ ] **Step 1: Write the failing test**

Create `tests/validate.test.js`:

```js
module.exports = (test, assert, DP) => {
  const V = DP.validate;

  const good = () => ({
    id: 'x',
    name: 'X',
    category: 'behavioral',
    text: {
      az: { summary: 's', problem: 'p', solution: 'so', avoid: 'a', usedIn: ['u'] },
      en: { summary: 's', problem: 'p', solution: 'so', avoid: 'a', usedIn: ['u'] },
    },
    diagram: '<svg></svg>',
    diagramLabel: { az: 'd', en: 'd' },
    mount() {},
    code: {
      bad: { cpp: 'c', java: 'c', js: 'c', php: 'c' },
      good: { cpp: 'c', java: 'c', js: 'c', php: 'c' },
    },
  });

  test('a complete pattern has no problems', () => {
    assert.deepStrictEqual(V.validatePattern(good()), []);
  });

  test('missing az text is reported', () => {
    const p = good();
    delete p.text.az;
    assert.ok(V.validatePattern(p).includes('text.az missing'));
  });

  test('empty text field is reported', () => {
    const p = good();
    p.text.en.problem = '  ';
    assert.ok(V.validatePattern(p).includes('text.en.problem missing'));
  });

  test('empty usedIn is reported', () => {
    const p = good();
    p.text.en.usedIn = [];
    assert.ok(V.validatePattern(p).includes('text.en.usedIn missing'));
  });

  test('invalid category is reported', () => {
    const p = good();
    p.category = 'weird';
    assert.ok(V.validatePattern(p).includes('invalid category: weird'));
  });

  test('missing code snippet is reported', () => {
    const p = good();
    delete p.code.good.php;
    assert.ok(V.validatePattern(p).includes('code.good.php missing'));
  });

  test('diagram must be an svg string', () => {
    const p = good();
    p.diagram = '<div></div>';
    assert.ok(V.validatePattern(p).includes('diagram must be an <svg> string'));
  });

  test('missing mount is reported', () => {
    const p = good();
    delete p.mount;
    assert.ok(V.validatePattern(p).includes('mount() missing'));
  });

  test('validateAll flags duplicate ids', () => {
    const results = V.validateAll([good(), good()]);
    assert.deepStrictEqual(results[0].problems, []);
    assert.ok(results[1].problems.includes('duplicate id'));
  });
};
```

- [ ] **Step 2: Run to verify it fails**

Run: `node tests/run-node.js`
Expected: validate tests FAIL with `Cannot read properties of undefined (reading 'validatePattern')`.

- [ ] **Step 3: Implement validate**

Create `js/validate.js`:

```js
(function (DP) {
  const CATEGORIES = ['creational', 'structural', 'behavioral'];
  const CODE_LANGS = ['cpp', 'java', 'js', 'php'];
  const TEXT_FIELDS = ['summary', 'problem', 'solution', 'avoid'];
  const nonEmpty = (v) => typeof v === 'string' && v.trim().length > 0;

  function validatePattern(p) {
    const problems = [];
    if (!nonEmpty(p.id)) problems.push('id missing');
    if (!nonEmpty(p.name)) problems.push('name missing');
    if (!CATEGORIES.includes(p.category)) problems.push(`invalid category: ${p.category}`);

    ['az', 'en'].forEach((lang) => {
      const t = p.text && p.text[lang];
      if (!t) {
        problems.push(`text.${lang} missing`);
        return;
      }
      TEXT_FIELDS.forEach((f) => {
        if (!nonEmpty(t[f])) problems.push(`text.${lang}.${f} missing`);
      });
      if (!Array.isArray(t.usedIn) || t.usedIn.length === 0) problems.push(`text.${lang}.usedIn missing`);
    });

    if (!nonEmpty(p.diagram) || !p.diagram.trim().startsWith('<svg')) {
      problems.push('diagram must be an <svg> string');
    }
    ['az', 'en'].forEach((lang) => {
      if (!nonEmpty(p.diagramLabel && p.diagramLabel[lang])) problems.push(`diagramLabel.${lang} missing`);
    });
    if (typeof p.mount !== 'function') problems.push('mount() missing');

    ['bad', 'good'].forEach((kind) => {
      CODE_LANGS.forEach((l) => {
        if (!nonEmpty(p.code && p.code[kind] && p.code[kind][l])) problems.push(`code.${kind}.${l} missing`);
      });
    });
    return problems;
  }

  function validateAll(patterns) {
    const seen = new Set();
    return patterns.map((p) => {
      const problems = validatePattern(p);
      if (seen.has(p.id)) problems.push('duplicate id');
      seen.add(p.id);
      return { id: p.id || '(no id)', problems };
    });
  }

  DP.validate = { validatePattern, validateAll };
})(window.DP);
```

- [ ] **Step 4: Run to verify it passes**

Run: `node tests/run-node.js`
Expected: all validate tests `ok`; total `22 passed, 0 failed`.

---

### Task 5: Observer logic (TDD)

**Files:**
- Create: `tests/observer.test.js`
- Create: `patterns/observer.logic.js`

- [ ] **Step 1: Write the failing test**

Create `tests/observer.test.js`:

```js
module.exports = (test, assert, DP) => {
  const { createSubject } = DP.logic.observer;

  test('notify calls every subscriber with the data', () => {
    const s = createSubject();
    const got = [];
    s.subscribe((d) => got.push('a:' + d));
    s.subscribe((d) => got.push('b:' + d));
    s.notify('hi');
    assert.deepStrictEqual(got, ['a:hi', 'b:hi']);
  });

  test('the function returned by subscribe unsubscribes', () => {
    const s = createSubject();
    let calls = 0;
    const off = s.subscribe(() => (calls += 1));
    off();
    s.notify();
    assert.strictEqual(calls, 0);
    assert.strictEqual(s.count(), 0);
  });

  test('subscribing the same function twice registers it once', () => {
    const s = createSubject();
    const fn = () => {};
    s.subscribe(fn);
    s.subscribe(fn);
    assert.strictEqual(s.count(), 1);
  });

  test('unsubscribing during notify does not skip other subscribers', () => {
    const s = createSubject();
    const calls = [];
    const a = () => {
      calls.push('a');
      s.unsubscribe(a);
    };
    const b = () => calls.push('b');
    s.subscribe(a);
    s.subscribe(b);
    s.notify();
    assert.deepStrictEqual(calls, ['a', 'b']);
    assert.strictEqual(s.count(), 1);
  });

  test('subscribing a non-function throws', () => {
    const s = createSubject();
    assert.throws(() => s.subscribe('nope'), TypeError);
  });
};
```

- [ ] **Step 2: Run to verify it fails**

Run: `node tests/run-node.js`
Expected: observer test file FAILs with `Cannot destructure property 'createSubject' of 'DP.logic.observer'`; exit code 1.

- [ ] **Step 3: Implement**

Create `patterns/observer.logic.js`:

```js
(function (DP) {
  function createSubject() {
    const observers = [];
    const subject = {
      subscribe(fn) {
        if (typeof fn !== 'function') throw new TypeError('observer must be a function');
        if (!observers.includes(fn)) observers.push(fn);
        return () => subject.unsubscribe(fn);
      },
      unsubscribe(fn) {
        const i = observers.indexOf(fn);
        if (i !== -1) observers.splice(i, 1);
      },
      notify(data) {
        // iterate a copy so observers may unsubscribe while being notified
        observers.slice().forEach((fn) => fn(data));
      },
      count() {
        return observers.length;
      },
    };
    return subject;
  }

  DP.logic.observer = { createSubject };
})(window.DP);
```

- [ ] **Step 4: Run to verify it passes**

Run: `node tests/run-node.js`
Expected: `27 passed, 0 failed`.

---

### Task 6: Strategy logic (TDD)

**Files:**
- Create: `tests/strategy.test.js`
- Create: `patterns/strategy.logic.js`

- [ ] **Step 1: Write the failing test**

Create `tests/strategy.test.js`:

```js
module.exports = (test, assert, DP) => {
  const { shippingPrice, STRATEGY_NAMES } = DP.logic.strategy;

  test('lists the three strategies in display order', () => {
    assert.deepStrictEqual(STRATEGY_NAMES, ['post', 'courier', 'express']);
  });

  test('post, courier and express prices for 10 kg', () => {
    assert.strictEqual(shippingPrice('post', 10), 8);
    assert.strictEqual(shippingPrice('courier', 10), 14);
    assert.strictEqual(shippingPrice('express', 10), 27);
  });

  test('prices are rounded to 2 decimals', () => {
    assert.strictEqual(shippingPrice('courier', 0.1), 6.08);
  });

  test('unknown strategy throws', () => {
    assert.throws(() => shippingPrice('drone', 5), /Unknown strategy: drone/);
    assert.throws(() => shippingPrice('constructor', 5), /Unknown strategy/);
  });

  test('negative or non-numeric weight throws RangeError', () => {
    assert.throws(() => shippingPrice('post', -1), RangeError);
    assert.throws(() => shippingPrice('post', NaN), RangeError);
  });
};
```

- [ ] **Step 2: Run to verify it fails**

Run: `node tests/run-node.js`
Expected: strategy test file FAILs with `Cannot destructure property 'shippingPrice' of 'DP.logic.strategy'`.

- [ ] **Step 3: Implement**

Create `patterns/strategy.logic.js`:

```js
(function (DP) {
  const strategies = {
    post: (kg) => 3 + kg * 0.5,
    courier: (kg) => 6 + kg * 0.8,
    express: (kg) => 12 + kg * 1.5,
  };
  const STRATEGY_NAMES = Object.keys(strategies);

  function shippingPrice(name, kg) {
    if (!STRATEGY_NAMES.includes(name)) throw new Error(`Unknown strategy: ${name}`);
    if (!(kg >= 0)) throw new RangeError('kg must be a number >= 0');
    return Math.round(strategies[name](kg) * 100) / 100;
  }

  DP.logic.strategy = { shippingPrice, STRATEGY_NAMES };
})(window.DP);
```

- [ ] **Step 4: Run to verify it passes**

Run: `node tests/run-node.js`
Expected: `32 passed, 0 failed`.

---

### Task 7: App shell (HTML, CSS, DOM helper, renderer, app wiring)

**Files:**
- Create: `js/dom.js`
- Create: `js/render.js`
- Create: `js/app.js`
- Create: `css/style.css`
- Create: `index.html`

These are browser-only; they are verified in Task 11 (no Node test).

- [ ] **Step 1: Create the DOM helper**

Create `js/dom.js`:

```js
(function (DP) {
  // h('div', { class: 'x', onclick: fn }, 'text', childEl, [moreChildren])
  function h(tag, props, ...children) {
    const el = document.createElement(tag);
    Object.keys(props || {}).forEach((k) => {
      const v = props[k];
      if (k === 'class') el.className = v;
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (v === true) el.setAttribute(k, '');
      else if (v !== false && v != null) el.setAttribute(k, v);
    });
    children.flat().forEach((c) => {
      if (c == null || c === false) return;
      el.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
    });
    return el;
  }

  DP.h = h;
})(window.DP);
```

- [ ] **Step 2: Create the renderer**

Create `js/render.js`:

```js
(function (DP) {
  const { h } = DP;
  const t = (lang, key) => DP.i18n.t(lang, key);
  const CATEGORIES = ['creational', 'structural', 'behavioral'];
  const PRISM_LANG = { cpp: 'cpp', java: 'java', js: 'javascript', php: 'php' };

  function renderNav(container, patterns, activeId, lang) {
    const groups = CATEGORIES.map((cat) => {
      const items = patterns.filter((p) => p.category === cat);
      if (!items.length) return null;
      return h(
        'section',
        { class: 'nav-group' },
        h('h2', {}, t(lang, 'category_' + cat)),
        h(
          'ul',
          {},
          items.map((p) =>
            h(
              'li',
              {},
              h(
                'a',
                {
                  href: '#' + p.id,
                  class: p.id === activeId ? 'active' : '',
                  'aria-current': p.id === activeId ? 'page' : false,
                },
                p.name
              )
            )
          )
        )
      );
    });
    container.replaceChildren(...groups.filter(Boolean));
  }

  function codePanel(kind, pattern, settings, actions) {
    const lang = settings.lang;
    const snippet = pattern.code && pattern.code[kind] && pattern.code[kind][settings.code];
    const title = t(lang, kind === 'bad' ? 'badCode' : 'goodCode');
    let body;
    if (snippet) {
      const cls = 'language-' + PRISM_LANG[settings.code];
      body = h('pre', { class: cls }, h('code', { class: cls }, snippet));
    } else {
      body = h(
        'div',
        { class: 'no-code' },
        h('p', {}, t(lang, 'noCode')),
        h('button', { class: 'btn', type: 'button', onclick: () => actions.setCode('js') }, t(lang, 'showJs'))
      );
    }
    return h('div', { class: 'code-panel ' + kind }, h('header', {}, title), body);
  }

  function section(lang, titleKey, ...children) {
    return h('section', { class: 'block' }, h('h2', {}, t(lang, titleKey)), ...children);
  }

  function renderPattern(container, pattern, settings, actions) {
    const lang = settings.lang;
    const txt = DP.i18n.text(pattern, lang);

    const diagram = h('figure', {
      class: 'diagram',
      role: 'img',
      'aria-label': (pattern.diagramLabel && (pattern.diagramLabel[lang] || pattern.diagramLabel.en)) || pattern.name,
    });
    diagram.innerHTML = pattern.diagram; // trusted: authored in our own pattern files

    const stage = h('div', { class: 'stage' });
    try {
      pattern.mount(stage, lang);
    } catch (err) {
      console.error(`[${pattern.id}] demo failed`, err);
      stage.replaceChildren(h('p', { class: 'error' }, t(lang, 'animFailed')));
    }

    container.replaceChildren(
      h(
        'header',
        { class: 'pattern-head' },
        h('p', { class: 'badge' }, t(lang, 'category_' + pattern.category)),
        h('h1', {}, pattern.name),
        h('p', { class: 'lead' }, txt.summary)
      ),
      section(lang, 'problem', h('p', {}, txt.problem)),
      h(
        'div',
        { class: 'compare' },
        codePanel('bad', pattern, settings, actions),
        codePanel('good', pattern, settings, actions)
      ),
      section(lang, 'solution', h('p', {}, txt.solution)),
      section(lang, 'diagram', diagram),
      section(lang, 'animation', stage),
      section(lang, 'usedIn', h('ul', {}, txt.usedIn.map((x) => h('li', {}, x)))),
      section(lang, 'avoid', h('p', {}, txt.avoid))
    );

    if (window.Prism) {
      container.querySelectorAll('pre code').forEach((el) => window.Prism.highlightElement(el));
    }
  }

  DP.render = { renderNav, renderPattern };
})(window.DP);
```

- [ ] **Step 3: Create app wiring**

Create `js/app.js`:

```js
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
    window.scrollTo(0, 0);
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
  menuBtn.addEventListener('click', () => {
    const open = document.body.classList.toggle('nav-open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });

  window.addEventListener('hashchange', route);
  route();
})(window.DP);
```

- [ ] **Step 4: Create the stylesheet**

Create `css/style.css`:

```css
:root {
  --bg: #f7f8fa;
  --surface: #ffffff;
  --text: #1c2230;
  --muted: #5b6579;
  --border: #e1e5ec;
  --border-strong: #b9c1d0;
  --accent: #2f6fed;
  --accent-soft: #e6eeff;
  --good: #1b8a4b;
  --good-soft: #e5f6ec;
  --bad: #c43b3b;
  --bad-soft: #fdeaea;
  --radius: 10px;
}
:root[data-theme='dark'] {
  --bg: #12151c;
  --surface: #1b2030;
  --text: #e8ebf2;
  --muted: #9aa4b8;
  --border: #2a3144;
  --border-strong: #46506b;
  --accent: #6c9bff;
  --accent-soft: #1f2c4d;
  --good: #4cc888;
  --good-soft: #15301f;
  --bad: #ff7b7b;
  --bad-soft: #3a1d1d;
}

* { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font: 16px/1.6 system-ui, -apple-system, 'Segoe UI', sans-serif;
}
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

/* top bar */
.topbar {
  position: sticky; top: 0; z-index: 10;
  display: flex; align-items: center; gap: 12px;
  padding: 10px 16px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
}
.brand { flex: 1; }
.controls { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.seg { display: inline-flex; border: 1px solid var(--border-strong); border-radius: 8px; overflow: hidden; }
.seg button {
  border: 0; background: transparent; color: var(--text);
  padding: 6px 10px; cursor: pointer; font: inherit; font-size: 14px;
}
.seg button[aria-pressed='true'] { background: var(--accent); color: #fff; }
.icon-btn {
  border: 1px solid var(--border-strong); background: transparent; color: var(--text);
  border-radius: 8px; padding: 6px 10px; cursor: pointer; font: inherit; line-height: 1;
}

/* layout */
.layout { display: grid; grid-template-columns: 260px 1fr; min-height: calc(100vh - 56px); }
.sidebar { padding: 16px; border-right: 1px solid var(--border); background: var(--surface); }
.nav-group h2 {
  font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em;
  color: var(--muted); margin: 16px 0 6px;
}
.nav-group ul { list-style: none; margin: 0; padding: 0; }
.nav-group a {
  display: block; padding: 6px 10px; border-radius: 6px;
  color: var(--text); text-decoration: none;
}
.nav-group a:hover { background: var(--accent-soft); }
.nav-group a.active { background: var(--accent); color: #fff; }
.content { padding: 24px 32px 64px; max-width: 1100px; min-width: 0; }

/* pattern page */
.pattern-head h1 { margin: 4px 0; font-size: 32px; }
.badge {
  display: inline-block; margin: 0; padding: 2px 10px; border-radius: 999px;
  background: var(--accent-soft); color: var(--accent); font-size: 13px; font-weight: 600;
}
.lead { font-size: 18px; color: var(--muted); margin-top: 4px; }
.block h2 { font-size: 20px; margin: 28px 0 8px; }

.compare { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 24px; }
.code-panel { border: 2px solid var(--border); border-radius: var(--radius); overflow: hidden; min-width: 0; }
.code-panel > header { padding: 6px 12px; font-weight: 600; font-size: 14px; }
.code-panel.bad { border-color: var(--bad); }
.code-panel.bad > header { background: var(--bad-soft); color: var(--bad); }
.code-panel.good { border-color: var(--good); }
.code-panel.good > header { background: var(--good-soft); color: var(--good); }
.code-panel pre { margin: 0; border-radius: 0; font-size: 13px; overflow-x: auto; }
.no-code { padding: 16px; }

.diagram { margin: 0; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 12px; }
.diagram svg { width: 100%; height: auto; max-height: 300px; }
.d-box { fill: var(--surface); stroke: var(--border-strong); stroke-width: 1.5; }
.d-box-accent { fill: var(--accent-soft); stroke: var(--accent); stroke-width: 1.5; }
.d-text { fill: var(--text); font: 600 13px system-ui, sans-serif; }
.d-sub { fill: var(--muted); font: 12px system-ui, sans-serif; }
.d-line { stroke: var(--muted); stroke-width: 1.5; fill: none; }
.d-dash { stroke-dasharray: 5 4; }
.d-arrow { fill: var(--muted); }

/* demos */
.stage { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; }
.btn {
  border: 1px solid var(--border-strong); background: var(--surface); color: var(--text);
  padding: 6px 12px; border-radius: 8px; cursor: pointer; font: inherit;
}
.btn.primary { background: var(--accent); border-color: var(--accent); color: #fff; }
.error { color: var(--bad); }

.publisher { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; }
.subs { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; }
.sub-card {
  display: flex; flex-direction: column; gap: 6px; padding: 12px;
  border: 2px solid var(--border); border-radius: var(--radius);
  transition: background 0.3s, border-color 0.3s;
}
.sub-card .status { font-size: 13px; color: var(--muted); }
.sub-card.on { border-color: var(--good); }
.sub-card.flash { background: var(--good-soft); }
.log-wrap h3 { font-size: 14px; margin: 16px 0 4px; }
.log { list-style: none; padding: 0; margin: 0; font-size: 14px; color: var(--muted); min-height: 24px; }

.strategy-options { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin: 12px 0; }
.strategy-card {
  position: relative; display: flex; flex-direction: column; gap: 2px; padding: 12px;
  border: 2px solid var(--border); border-radius: var(--radius); cursor: pointer;
}
.strategy-card input { position: absolute; opacity: 0; pointer-events: none; }
.strategy-card:focus-within { outline: 2px solid var(--accent); outline-offset: 2px; }
.strategy-card.selected { border-color: var(--accent); background: var(--accent-soft); }
.strategy-card small { color: var(--muted); }
.weight-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.weight-row input[type='range'] { flex: 1; min-width: 160px; }
.price { display: block; font-size: 28px; font-weight: 700; margin-top: 8px; }
.call { display: inline-block; margin-top: 4px; color: var(--muted); font-size: 14px; }

@media (max-width: 800px) {
  .layout { grid-template-columns: 1fr; }
  .sidebar { display: none; }
  body.nav-open .sidebar { display: block; }
  .content { padding: 16px; }
  .compare { grid-template-columns: 1fr; }
  .pattern-head h1 { font-size: 26px; }
}
@media (min-width: 801px) {
  #menu-toggle { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; animation: none !important; }
}
```

- [ ] **Step 5: Create the HTML shell**

Create `index.html`:

```html
<!doctype html>
<html lang="az" data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Design Patterns</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <header class="topbar">
    <button id="menu-toggle" class="icon-btn" type="button" aria-controls="nav" aria-expanded="false" data-i18n-aria="menu">☰</button>
    <strong class="brand" data-i18n="appTitle">Design Patterns</strong>
    <div class="controls">
      <div class="seg" role="group" data-i18n-aria="language">
        <button type="button" data-lang="az" aria-pressed="true">AZ</button>
        <button type="button" data-lang="en" aria-pressed="false">EN</button>
      </div>
      <div class="seg" role="group" data-i18n-aria="codeLanguage">
        <button type="button" data-code="cpp" aria-pressed="false">C++</button>
        <button type="button" data-code="java" aria-pressed="false">Java</button>
        <button type="button" data-code="js" aria-pressed="true">JS</button>
        <button type="button" data-code="php" aria-pressed="false">PHP</button>
      </div>
      <button id="theme-toggle" class="icon-btn" type="button" data-i18n-aria="theme">◐</button>
    </div>
  </header>

  <div class="layout">
    <nav id="nav" class="sidebar"></nav>
    <main id="page" class="content"></main>
  </div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-c.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-cpp.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-java.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-markup-templating.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-php.min.js"></script>

  <script src="js/registry.js"></script>
  <script src="js/i18n.js"></script>
  <script src="js/dom.js"></script>
  <script src="js/state.js"></script>
  <!-- PATTERN SCRIPTS -->
  <script src="js/render.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
```

- [ ] **Step 6: Make sure Node tests still pass**

Run: `node tests/run-node.js`
Expected: `32 passed, 0 failed` (the new browser-only files are not loaded by the harness).

---

### Task 8: Observer pattern (data, diagram, code, demo)

**Files:**
- Create: `tests/patterns.test.js`
- Create: `patterns/observer.js`
- Modify: `index.html` (replace the `<!-- PATTERN SCRIPTS -->` marker line)

- [ ] **Step 1: Write the failing test**

Create `tests/patterns.test.js`:

```js
module.exports = (test, assert, DP) => {
  test('observer and strategy are registered', () => {
    const ids = DP.patterns.map((p) => p.id);
    assert.ok(ids.includes('observer'), 'observer missing');
    assert.ok(ids.includes('strategy'), 'strategy missing');
  });

  test('every registered pattern passes validation', () => {
    const bad = DP.validate.validateAll(DP.patterns).filter((r) => r.problems.length);
    assert.deepStrictEqual(bad, []);
  });
};
```

- [ ] **Step 2: Run to verify it fails**

Run: `node tests/run-node.js`
Expected: `observer and strategy are registered` FAILs with `observer missing`. The validation test passes vacuously until patterns exist.

- [ ] **Step 3: Create the Observer pattern file**

Create `patterns/observer.js`:

```js
(function (DP) {
  const UI = {
    az: {
      publisher: 'Nəşriyyatçı',
      publish: 'Xəbər yay',
      subscribe: 'Abunə ol',
      unsubscribe: 'Abunəlikdən çıx',
      subscriber: 'Abunəçi',
      subscribers: 'Abunəçi sayı',
      news: 'Xəbər',
      received: 'aldı',
      nobody: 'Heç kim dinləmir',
      on: 'abunədir',
      off: 'abunə deyil',
      log: 'Jurnal',
    },
    en: {
      publisher: 'Publisher',
      publish: 'Publish news',
      subscribe: 'Subscribe',
      unsubscribe: 'Unsubscribe',
      subscriber: 'Subscriber',
      subscribers: 'Subscribers',
      news: 'News',
      received: 'received',
      nobody: 'Nobody is listening',
      on: 'subscribed',
      off: 'not subscribed',
      log: 'Log',
    },
  };

  const diagram = `<svg viewBox="0 0 520 220" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-observer" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0L10 5L0 10z" class="d-arrow"/>
    </marker>
  </defs>
  <rect class="d-box-accent" x="20" y="75" width="160" height="70" rx="8"/>
  <text class="d-text" x="100" y="105" text-anchor="middle">Subject</text>
  <text class="d-sub" x="100" y="125" text-anchor="middle">subscribe() · notify()</text>
  <path class="d-line" d="M180 100 L340 42" marker-end="url(#arr-observer)"/>
  <path class="d-line" d="M180 110 L340 110" marker-end="url(#arr-observer)"/>
  <path class="d-line" d="M180 120 L340 178" marker-end="url(#arr-observer)"/>
  <text class="d-sub" x="236" y="94" text-anchor="middle">notify()</text>
  <rect class="d-box" x="340" y="15" width="160" height="55" rx="8"/>
  <text class="d-text" x="420" y="38" text-anchor="middle">Observer A</text>
  <text class="d-sub" x="420" y="56" text-anchor="middle">update()</text>
  <rect class="d-box" x="340" y="83" width="160" height="55" rx="8"/>
  <text class="d-text" x="420" y="106" text-anchor="middle">Observer B</text>
  <text class="d-sub" x="420" y="124" text-anchor="middle">update()</text>
  <rect class="d-box" x="340" y="151" width="160" height="55" rx="8"/>
  <text class="d-text" x="420" y="174" text-anchor="middle">Observer C</text>
  <text class="d-sub" x="420" y="192" text-anchor="middle">update()</text>
</svg>`;

  const code = {
    bad: {
      js: String.raw`class WeatherStation {
  constructor(phoneApp, webWidget) {
    this.phoneApp = phoneApp;
    this.webWidget = webWidget;
  }

  setTemperature(t) {
    this.phoneApp.update(t);   // must know every consumer
    this.webWidget.update(t);  // new display = edit this class
  }
}`,
      java: String.raw`class WeatherStation {
    private PhoneApp phoneApp;
    private WebWidget webWidget;

    WeatherStation(PhoneApp phoneApp, WebWidget webWidget) {
        this.phoneApp = phoneApp;
        this.webWidget = webWidget;
    }

    void setTemperature(double t) {
        phoneApp.update(t);   // must know every consumer
        webWidget.update(t);  // new display = edit this class
    }
}`,
      cpp: String.raw`class WeatherStation {
    PhoneApp& phoneApp;
    WebWidget& webWidget;

public:
    WeatherStation(PhoneApp& p, WebWidget& w) : phoneApp(p), webWidget(w) {}

    void setTemperature(double t) {
        phoneApp.update(t);   // must know every consumer
        webWidget.update(t);  // new display = edit this class
    }
};`,
      php: String.raw`<?php
class WeatherStation
{
    public function __construct(
        private PhoneApp $phoneApp,
        private WebWidget $webWidget,
    ) {}

    public function setTemperature(float $t): void
    {
        $this->phoneApp->update($t);   // must know every consumer
        $this->webWidget->update($t);  // new display = edit this class
    }
}`,
    },
    good: {
      js: String.raw`class WeatherStation {
  #listeners = [];

  subscribe(fn) { this.#listeners.push(fn); }
  unsubscribe(fn) { this.#listeners = this.#listeners.filter((l) => l !== fn); }

  setTemperature(t) {
    this.#listeners.forEach((fn) => fn(t));
  }
}

const station = new WeatherStation();
station.subscribe((t) => console.log('Phone:', t));
station.subscribe((t) => console.log('Web:', t));
station.setTemperature(25);`,
      java: String.raw`import java.util.ArrayList;
import java.util.List;

interface Observer {
    void update(double temperature);
}

class WeatherStation {
    private final List<Observer> observers = new ArrayList<>();

    void subscribe(Observer o)   { observers.add(o); }
    void unsubscribe(Observer o) { observers.remove(o); }

    void setTemperature(double t) {
        for (Observer o : observers) o.update(t);
    }
}

// usage
WeatherStation station = new WeatherStation();
station.subscribe(t -> System.out.println("Phone: " + t));
station.subscribe(t -> System.out.println("Web: " + t));
station.setTemperature(25);`,
      cpp: String.raw`#include <functional>
#include <iostream>
#include <utility>
#include <vector>

class WeatherStation {
    std::vector<std::function<void(double)>> listeners;

public:
    // to support unsubscribe, return an id/token from subscribe()
    void subscribe(std::function<void(double)> fn) {
        listeners.push_back(std::move(fn));
    }

    void setTemperature(double t) {
        for (auto& fn : listeners) fn(t);
    }
};

int main() {
    WeatherStation station;
    station.subscribe([](double t) { std::cout << "Phone: " << t << '\n'; });
    station.subscribe([](double t) { std::cout << "Web: " << t << '\n'; });
    station.setTemperature(25);
}`,
      php: String.raw`<?php
interface Observer
{
    public function update(float $temperature): void;
}

class WeatherStation
{
    /** @var Observer[] */
    private array $observers = [];

    public function subscribe(Observer $o): void
    {
        $this->observers[] = $o;
    }

    public function unsubscribe(Observer $o): void
    {
        $this->observers = array_values(array_filter(
            $this->observers,
            fn (Observer $x) => $x !== $o
        ));
    }

    public function setTemperature(float $t): void
    {
        foreach ($this->observers as $o) {
            $o->update($t);
        }
    }
}`,
    },
  };

  function mount(stage, lang) {
    const { h } = DP;
    const ui = UI[lang] || UI.en;
    const subject = DP.logic.observer.createSubject();
    let news = 0;

    const count = h('span', {}, '0');
    const log = h('ul', { class: 'log', 'aria-live': 'polite' });
    const addLog = (line) => {
      log.prepend(h('li', {}, line));
      while (log.children.length > 6) log.lastChild.remove();
    };
    const updateCount = () => {
      count.textContent = String(subject.count());
    };

    const cards = [1, 2, 3].map((n) => {
      const name = `${ui.subscriber} ${n}`;
      const status = h('span', { class: 'status' }, ui.off);
      let unsubscribe = null;

      const onNews = (msg) => {
        card.classList.add('flash');
        setTimeout(() => card.classList.remove('flash'), 700);
        addLog(`${name} ${ui.received}: ${msg}`);
      };

      const btn = h(
        'button',
        {
          class: 'btn',
          type: 'button',
          onclick: () => {
            if (unsubscribe) {
              unsubscribe();
              unsubscribe = null;
            } else {
              unsubscribe = subject.subscribe(onNews);
            }
            const on = unsubscribe !== null;
            status.textContent = on ? ui.on : ui.off;
            btn.textContent = on ? ui.unsubscribe : ui.subscribe;
            card.classList.toggle('on', on);
            updateCount();
          },
        },
        ui.subscribe
      );
      const card = h('div', { class: 'sub-card' }, h('strong', {}, name), status, btn);
      return card;
    });

    const publish = h(
      'button',
      {
        class: 'btn primary',
        type: 'button',
        onclick: () => {
          news += 1;
          if (subject.count() === 0) {
            addLog(ui.nobody);
            return;
          }
          subject.notify(`${ui.news} #${news}`);
        },
      },
      ui.publish
    );

    stage.append(
      h(
        'div',
        { class: 'observer-demo' },
        h('div', { class: 'publisher' }, h('strong', {}, ui.publisher), publish, h('small', {}, `${ui.subscribers}: `, count)),
        h('div', { class: 'subs' }, cards),
        h('div', { class: 'log-wrap' }, h('h3', {}, ui.log), log)
      )
    );
  }

  DP.register({
    id: 'observer',
    name: 'Observer',
    category: 'behavioral',
    text: {
      az: {
        summary: `Bir obyekt dəyişəndə ona abunə olan hamı avtomatik xəbər tutur.`,
        problem: `Hava stansiyası temperaturu hər ekrana (telefon, veb vidjet) birbaşa özü ötürür. Yeni ekran əlavə etmək üçün stansiyanın kodunu dəyişmək lazım gəlir və stansiya ilə ekranlar bir-birindən ayrılmaz olur.`,
        solution: `Stansiya yalnız "abunəçilər siyahısını" saxlayır. Dəyişiklik olanda siyahıdakı hər kəsə eyni metodu çağırır. Kimin abunə olduğunu stansiya bilmir və bilməli də deyil.`,
        usedIn: [
          `Brauzerdə DOM hadisələri (addEventListener)`,
          `Redux / Vuex: store dəyişəndə komponentlər yenilənir`,
          `YouTube kanalına abunə və bildirişlər`,
          `Mesajlaşma tətbiqlərində yeni mesaj bildirişi`,
        ],
        avoid: `Abunəçilər çoxdursa və ya bir-birini zəncirvari işə salırsa, hadisələrin ardıcıllığını izləmək çətinləşir. Unsubscribe unudulsa yaddaş sızması yaranır.`,
      },
      en: {
        summary: `When one object changes, everyone subscribed to it is notified automatically.`,
        problem: `A weather station pushes the temperature to every display (phone, web widget) directly. Adding a new display means editing the station's code, and the station and displays can no longer be separated.`,
        solution: `The station only keeps a list of subscribers. When something changes it calls the same method on everyone in the list. It does not know who subscribed, and does not need to.`,
        usedIn: [
          `DOM events in the browser (addEventListener)`,
          `Redux / Vuex: components update when the store changes`,
          `Subscribing to a YouTube channel and getting notifications`,
          `New-message notifications in chat apps`,
        ],
        avoid: `With many subscribers, or subscribers that trigger each other, the order of events gets hard to follow. Forgetting to unsubscribe causes memory leaks.`,
      },
    },
    diagram,
    diagramLabel: {
      az: 'Observer diaqramı: Subject abunəçilərin hamısına notify() göndərir',
      en: 'Observer diagram: the Subject sends notify() to every subscribed Observer',
    },
    code,
    mount,
  });
})(window.DP);
```

- [ ] **Step 4: Add the script tags to index.html**

In `index.html`, replace the line `  <!-- PATTERN SCRIPTS -->` with:

```html
  <script src="patterns/observer.logic.js"></script>
  <script src="patterns/observer.js"></script>
  <!-- PATTERN SCRIPTS -->
```

- [ ] **Step 5: Run to verify**

Run: `node tests/run-node.js`
Expected: `every registered pattern passes validation` is `ok` (observer has no problems). `observer and strategy are registered` still FAILs with `strategy missing` until Task 9.

---

### Task 9: Strategy pattern (data, diagram, code, demo)

**Files:**
- Create: `patterns/strategy.js`
- Modify: `index.html`

- [ ] **Step 1: Create the Strategy pattern file**

Create `patterns/strategy.js`:

```js
(function (DP) {
  const UI = {
    az: {
      weight: 'Çəki',
      names: { post: 'Poçt', courier: 'Kuryer', express: 'Ekspress' },
      price: 'Çatdırılma qiyməti',
    },
    en: {
      weight: 'Weight',
      names: { post: 'Post', courier: 'Courier', express: 'Express' },
      price: 'Shipping price',
    },
  };
  const FORMULA = {
    post: '3 + kg × 0.5',
    courier: '6 + kg × 0.8',
    express: '12 + kg × 1.5',
  };

  const diagram = `<svg viewBox="0 0 560 250" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-strategy" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0L10 5L0 10z" class="d-arrow"/>
    </marker>
  </defs>
  <rect class="d-box-accent" x="20" y="20" width="150" height="56" rx="8"/>
  <text class="d-text" x="95" y="45" text-anchor="middle">Order (Context)</text>
  <text class="d-sub" x="95" y="63" text-anchor="middle">strategy</text>
  <path class="d-line" d="M170 48 L260 48" marker-end="url(#arr-strategy)"/>
  <text class="d-sub" x="215" y="40" text-anchor="middle">uses</text>
  <rect class="d-box" x="260" y="20" width="200" height="56" rx="8"/>
  <text class="d-text" x="360" y="43" text-anchor="middle">«interface»</text>
  <text class="d-sub" x="360" y="62" text-anchor="middle">ShippingStrategy · price()</text>
  <path class="d-line d-dash" d="M240 170 L320 76" marker-end="url(#arr-strategy)"/>
  <path class="d-line d-dash" d="M360 170 L360 76" marker-end="url(#arr-strategy)"/>
  <path class="d-line d-dash" d="M480 170 L400 76" marker-end="url(#arr-strategy)"/>
  <rect class="d-box" x="185" y="170" width="110" height="50" rx="8"/>
  <text class="d-text" x="240" y="200" text-anchor="middle">Post</text>
  <rect class="d-box" x="305" y="170" width="110" height="50" rx="8"/>
  <text class="d-text" x="360" y="200" text-anchor="middle">Courier</text>
  <rect class="d-box" x="425" y="170" width="110" height="50" rx="8"/>
  <text class="d-text" x="480" y="200" text-anchor="middle">Express</text>
</svg>`;

  const code = {
    bad: {
      js: String.raw`function shippingPrice(type, kg) {
  if (type === 'post') {
    return 3 + kg * 0.5;
  } else if (type === 'courier') {
    return 6 + kg * 0.8;
  } else if (type === 'express') {
    return 12 + kg * 1.5;
  }
  // every new method = edit this function (and re-test all branches)
  throw new Error('Unknown type');
}`,
      java: String.raw`double shippingPrice(String type, double kg) {
    if (type.equals("post")) {
        return 3 + kg * 0.5;
    } else if (type.equals("courier")) {
        return 6 + kg * 0.8;
    } else if (type.equals("express")) {
        return 12 + kg * 1.5;
    }
    // every new method = edit this method
    throw new IllegalArgumentException("Unknown type");
}`,
      cpp: String.raw`#include <stdexcept>
#include <string>

double shippingPrice(const std::string& type, double kg) {
    if (type == "post") {
        return 3 + kg * 0.5;
    } else if (type == "courier") {
        return 6 + kg * 0.8;
    } else if (type == "express") {
        return 12 + kg * 1.5;
    }
    // every new method = edit this function
    throw std::invalid_argument("Unknown type");
}`,
      php: String.raw`<?php
function shippingPrice(string $type, float $kg): float
{
    if ($type === 'post') {
        return 3 + $kg * 0.5;
    } elseif ($type === 'courier') {
        return 6 + $kg * 0.8;
    } elseif ($type === 'express') {
        return 12 + $kg * 1.5;
    }
    // every new method = edit this function
    throw new InvalidArgumentException('Unknown type');
}`,
    },
    good: {
      js: String.raw`const strategies = {
  post:    (kg) => 3 + kg * 0.5,
  courier: (kg) => 6 + kg * 0.8,
  express: (kg) => 12 + kg * 1.5,
};

function shippingPrice(type, kg) {
  const strategy = strategies[type];
  if (!strategy) throw new Error('Unknown type');
  return strategy(kg);
}

// new method = add one entry, nothing else changes
strategies.drone = (kg) => 20 + kg * 2;`,
      java: String.raw`interface ShippingStrategy {
    double price(double kg);
}

class Post implements ShippingStrategy {
    public double price(double kg) { return 3 + kg * 0.5; }
}
class Courier implements ShippingStrategy {
    public double price(double kg) { return 6 + kg * 0.8; }
}
class Express implements ShippingStrategy {
    public double price(double kg) { return 12 + kg * 1.5; }
}

class Order {
    private ShippingStrategy strategy;

    Order(ShippingStrategy strategy) { this.strategy = strategy; }
    void setStrategy(ShippingStrategy s) { this.strategy = s; }
    double shippingPrice(double kg) { return strategy.price(kg); }
}

// usage
Order order = new Order(new Post());
order.setStrategy(new Express());   // swap at runtime
System.out.println(order.shippingPrice(10));`,
      cpp: String.raw`#include <iostream>
#include <memory>
#include <utility>

struct ShippingStrategy {
    virtual ~ShippingStrategy() = default;
    virtual double price(double kg) const = 0;
};

struct Post : ShippingStrategy {
    double price(double kg) const override { return 3 + kg * 0.5; }
};
struct Courier : ShippingStrategy {
    double price(double kg) const override { return 6 + kg * 0.8; }
};
struct Express : ShippingStrategy {
    double price(double kg) const override { return 12 + kg * 1.5; }
};

class Order {
    std::unique_ptr<ShippingStrategy> strategy;

public:
    explicit Order(std::unique_ptr<ShippingStrategy> s) : strategy(std::move(s)) {}
    void setStrategy(std::unique_ptr<ShippingStrategy> s) { strategy = std::move(s); }
    double shippingPrice(double kg) const { return strategy->price(kg); }
};

int main() {
    Order order(std::make_unique<Post>());
    order.setStrategy(std::make_unique<Express>());  // swap at runtime
    std::cout << order.shippingPrice(10) << '\n';
}`,
      php: String.raw`<?php
interface ShippingStrategy
{
    public function price(float $kg): float;
}

class Post implements ShippingStrategy
{
    public function price(float $kg): float { return 3 + $kg * 0.5; }
}
class Courier implements ShippingStrategy
{
    public function price(float $kg): float { return 6 + $kg * 0.8; }
}
class Express implements ShippingStrategy
{
    public function price(float $kg): float { return 12 + $kg * 1.5; }
}

class Order
{
    public function __construct(private ShippingStrategy $strategy) {}

    public function setStrategy(ShippingStrategy $s): void
    {
        $this->strategy = $s;
    }

    public function shippingPrice(float $kg): float
    {
        return $this->strategy->price($kg);
    }
}

$order = new Order(new Post());
$order->setStrategy(new Express());   // swap at runtime
echo $order->shippingPrice(10);`,
    },
  };

  function mount(stage, lang) {
    const { h } = DP;
    const ui = UI[lang] || UI.en;
    const { shippingPrice, STRATEGY_NAMES } = DP.logic.strategy;
    let current = 'post';
    let kg = 5;

    const price = h('output', { class: 'price', 'aria-live': 'polite' });
    const weightLabel = h('strong', {}, '');
    const call = h('code', { class: 'call' });

    const options = STRATEGY_NAMES.map((name) => {
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
      const el = h('label', { class: 'strategy-card' }, input, h('strong', {}, ui.names[name]), h('small', {}, FORMULA[name]));
      return { name, el };
    });

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
      const value = shippingPrice(current, kg);
      price.textContent = `${value.toFixed(2)} ₼`;
      weightLabel.textContent = `${kg} kg`;
      call.textContent = `strategies.${current}(${kg}) → ${value.toFixed(2)}`;
      options.forEach((o) => o.el.classList.toggle('selected', o.name === current));
    }

    stage.append(
      h(
        'div',
        { class: 'strategy-demo' },
        h('div', { class: 'weight-row' }, h('span', {}, `${ui.weight}:`), range, weightLabel),
        h('div', { class: 'strategy-options', role: 'radiogroup' }, options.map((o) => o.el)),
        h('div', {}, h('span', {}, `${ui.price}:`), price, call)
      )
    );
    render();
  }

  DP.register({
    id: 'strategy',
    name: 'Strategy',
    category: 'behavioral',
    text: {
      az: {
        summary: `Alqoritmi ayrı obyektə çıxarırsan və işləmə vaxtı onu dəyişə bilirsən.`,
        problem: `Çatdırılma qiymətini hesablayan funksiyada hər üsul üçün ayrıca if/else budağı var. Yeni üsul əlavə edəndə eyni funksiyanı dəyişirsən və bütün budaqları yenidən test etmək lazım gəlir.`,
        solution: `Hər üsul ayrıca strategiya olur (eyni interfeys). Sifariş yalnız seçilmiş strategiyanı çağırır. Yeni üsul = yeni strategiya, mövcud kod toxunulmaz qalır.`,
        usedIn: [
          `Çatdırılma və ya vergi hesablanması`,
          `Sıralama alqoritminin seçimi (comparator)`,
          `Ödəniş üsulları (kart, nağd, köçürmə)`,
          `Autentifikasiya növləri (parol, OAuth, SSO)`,
        ],
        avoid: `Yalnız 2–3 sabit variant varsa və heç dəyişmirsə, sadə if/else kifayətdir. Strategiya onu artıq mürəkkəbləşdirər.`,
      },
      en: {
        summary: `Pull an algorithm out into its own object and swap it at runtime.`,
        problem: `The function that computes shipping price has a separate if/else branch for every method. Adding a method means editing the same function and re-testing all the branches.`,
        solution: `Each method becomes its own strategy (same interface). The order just calls whichever strategy is selected. New method = new strategy; existing code stays untouched.`,
        usedIn: [
          `Shipping or tax calculation`,
          `Choosing a sorting algorithm (comparator)`,
          `Payment methods (card, cash, transfer)`,
          `Authentication types (password, OAuth, SSO)`,
        ],
        avoid: `With only 2–3 fixed variants that never change, a plain if/else is enough. A strategy would just over-complicate it.`,
      },
    },
    diagram,
    diagramLabel: {
      az: 'Strategy diaqramı: Order ShippingStrategy interfeysindən istifadə edir, Post, Courier və Express onu həyata keçirir',
      en: 'Strategy diagram: Order uses the ShippingStrategy interface, implemented by Post, Courier and Express',
    },
    code,
    mount,
  });
})(window.DP);
```

- [ ] **Step 2: Add the script tags to index.html**

In `index.html`, replace the line `  <!-- PATTERN SCRIPTS -->` with:

```html
  <script src="patterns/strategy.logic.js"></script>
  <script src="patterns/strategy.js"></script>
  <!-- PATTERN SCRIPTS -->
```

(The observer tags added in Task 8 stay above it.)

- [ ] **Step 3: Run the Node tests**

Run: `node tests/run-node.js`
Expected: all tests `ok`, `34 passed, 0 failed`.

---

### Task 10: Browser validation page

**Files:**
- Create: `tests/validate.html`

- [ ] **Step 1: Create the page**

Create `tests/validate.html`:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Pattern validation</title>
  <style>
    body { font: 16px/1.5 system-ui, sans-serif; margin: 24px; }
    table { border-collapse: collapse; }
    th, td { border: 1px solid #ccc; padding: 6px 12px; text-align: left; vertical-align: top; }
    .ok { background: #e5f6ec; }
    .fail { background: #fdeaea; }
  </style>
</head>
<body>
  <h1>Pattern validation</h1>
  <p id="summary"></p>
  <table>
    <thead><tr><th>Pattern</th><th>Status</th><th>Problems</th></tr></thead>
    <tbody id="rows"></tbody>
  </table>

  <script src="../js/registry.js"></script>
  <script src="../js/validate.js"></script>
  <script src="../patterns/observer.logic.js"></script>
  <script src="../patterns/observer.js"></script>
  <script src="../patterns/strategy.logic.js"></script>
  <script src="../patterns/strategy.js"></script>
  <!-- PATTERN SCRIPTS -->
  <script>
    const results = DP.validate.validateAll(DP.patterns);
    const rows = document.getElementById('rows');
    results.forEach((r) => {
      const tr = document.createElement('tr');
      tr.className = r.problems.length ? 'fail' : 'ok';
      [r.id, r.problems.length ? 'PROBLEMS' : 'OK', r.problems.join('; ')].forEach((text) => {
        const td = document.createElement('td');
        td.textContent = text;
        tr.appendChild(td);
      });
      rows.appendChild(tr);
    });
    const failing = results.filter((r) => r.problems.length).length;
    document.getElementById('summary').textContent =
      `${results.length} patterns, ${failing} with problems.`;
  </script>
</body>
</html>
```

- [ ] **Step 2: Verify in a browser (done in Task 11)**

Open it together with the main page in Task 11, Step 2.

---

### Task 11: Browser verification and review gate

**Files:** none (verification only; fix defects in the files above if found)

- [ ] **Step 1: Serve the folder**

Run (from `C:\Users\kainmh\Desktop\myapp\designpatterns`): `python -m http.server 8080`
Expected: `Serving HTTP on ... port 8080`. (Alternative: `npx http-server -p 8080`. Opening `index.html` directly via `file://` also works because there are no ES modules.)

- [ ] **Step 2: Check the validation page**

Open `http://localhost:8080/tests/validate.html`.
Expected: summary `2 patterns, 0 with problems.`, both rows green.

- [ ] **Step 3: Check the app against this checklist**

Open `http://localhost:8080/` and verify each item (screenshot + console check; no red errors expected):

- Page opens on Observer; URL becomes `#observer?lang=az&code=js`.
- Sidebar shows `Davranış (Behavioral)` with Observer and Strategy; clicking Strategy switches page and keeps the chosen languages.
- AZ → EN switch translates the title bar, headings, texts, and demo labels; EN → AZ switches back.
- Code toggle C++ / Java / JS / PHP changes both code panels and they are syntax-highlighted (PHP and C++ coloured, not plain).
- Theme toggle switches light/dark; diagram colours follow the theme; reloading keeps the theme.
- Observer demo: subscribe 2 of 3 cards → count shows 2; "Publish news" flashes only those 2 and adds log lines; unsubscribing one stops its flashes; publishing with nobody subscribed logs "Heç kim dinləmir".
- Strategy demo: moving the slider and choosing Post/Courier/Express updates price (10 kg → 8.00 / 14.00 / 27.00 ₼) and the call text; arrow keys change the radio selection.
- Visiting `#nonexistent` redirects to Observer.
- Width ≤ 800 px: sidebar hidden, ☰ opens it, code panels stack vertically, no horizontal page scroll.
- Keyboard: Tab reaches every button/radio with a visible focus ring.

- [ ] **Step 4: Fix any defect found, then re-run Node tests**

Run: `node tests/run-node.js`
Expected: `34 passed, 0 failed`.

- [ ] **Step 5: Review gate with the user**

Show the user the running prototype and ask them to confirm the format (text blocks, bad/good code layout, diagram style, demo style). Their feedback decides any changes before the follow-up plan for the remaining 10 patterns (spec phases 3–6).

---

## Self-Review

**Spec coverage**
- Static site, no build, vanilla JS, Prism CDN → Tasks 7, 8 (index.html, scripts).
- File structure → matches File Structure table (adds `js/dom.js`, `js/state.js`, `js/validate.js`, `*.logic.js`; spec's `i18n.js`, `render.js`, `app.js`, `validate.html` all present).
- Layout (sidebar by category, top bar with AZ/EN, 4 code languages, theme; page sections in spec order) → Task 7 `render.js`, `index.html`, `style.css`.
- Settings persisted in URL hash + localStorage → `state.js` + `app.js`.
- Error handling: missing translation (i18n fallback), missing snippet (`codePanel` fallback + JS button), animation failure (try/catch in `renderPattern`), unknown hash (app route falls back to first pattern), blocked localStorage (try/catch + in-memory settings), Prism CDN failure (`window.Prism` guard).
- Accessibility: real buttons, focus-visible, `prefers-reduced-motion`, diagram `role="img"` + `aria-label`, `aria-pressed`, `aria-live`.
- Testing: `validate.html` (Task 10), Node unit tests for pure logic (Tasks 5–6) and data validation (Tasks 4, 8), manual checklist (Task 11).
- Phase 1 + Phase 2 (Observer, Strategy) → Tasks 1–11. Phases 3–6 (10 patterns, search, README, polish) are deliberately left to follow-up plans after the Task 11 review gate, as the spec requires.

**Placeholder scan:** no TBD/TODO; every code step contains full code.

**Consistency:** `DP.logic.observer.createSubject` / `DP.logic.strategy.{shippingPrice,STRATEGY_NAMES}`, `DP.validate.{validatePattern,validateAll}`, `DP.state.{parseHash,buildHash,resolveSettings,loadStored,saveStored,DEFAULTS}`, `DP.i18n.{t,text,strings}`, `DP.render.{renderNav,renderPattern}`, `DP.h`, and the pattern object keys (`id,name,category,text,diagram,diagramLabel,code,mount`) are used identically across tasks, tests, and validation.
