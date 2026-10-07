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
    const title = t(lang, { bad: 'badCode', good: 'goodCode', overkill: 'overkillCode', simple: 'simpleCode' }[kind]);
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
    return h('section', { class: 'block block-' + titleKey }, h('h2', {}, t(lang, titleKey)), ...children);
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
      h('aside', { class: 'analogy' }, h('strong', {}, t(lang, 'analogy')), h('p', {}, txt.analogy)),
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
      section(
        lang,
        'avoid',
        h('p', { class: 'avoid-lead' }, txt.avoid),
        h('h3', {}, t(lang, 'avoidWhen')),
        h('ul', { class: 'avoid-list' }, txt.avoidWhen.map((x) => h('li', {}, x))),
        h('p', { class: 'overkill-note' }, txt.overkillNote),
        h(
          'div',
          { class: 'compare' },
          codePanel('overkill', pattern, settings, actions),
          codePanel('simple', pattern, settings, actions)
        )
      )
    );

    if (window.Prism) {
      container.querySelectorAll('pre code').forEach((el) => window.Prism.highlightElement(el));
    }
  }

  DP.render = { renderNav, renderPattern };
})(window.DP);
