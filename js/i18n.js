(function (DP) {
  const strings = {
    az: {
      appTitle: 'Dizayn Pattern-ləri',
      analogy: 'Gündəlik həyatdan misal',
      problem: 'Problem',
      badCode: 'Problemli kod',
      goodCode: 'Həll olunmuş kod',
      solution: 'Həll',
      diagram: 'Diaqram',
      animation: 'İnteraktiv demo',
      usedIn: 'Harada işlənir',
      avoid: 'Nə vaxt işlətmə',
      avoidWhen: 'Bu hallarda lazım deyil',
      overkillCode: 'Lazımsız mürəkkəb kod',
      simpleCode: 'Sadə həll kifayətdir',
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
      analogy: 'Everyday example',
      problem: 'Problem',
      badCode: 'Problematic code',
      goodCode: 'Fixed code',
      solution: 'Solution',
      diagram: 'Diagram',
      animation: 'Interactive demo',
      usedIn: 'Where it is used',
      avoid: 'When not to use it',
      avoidWhen: 'Situations where you do not need it',
      overkillCode: 'Needlessly complicated code',
      simpleCode: 'A simple solution is enough',
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
