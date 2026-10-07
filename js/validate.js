(function (DP) {
  const CATEGORIES = ['creational', 'structural', 'behavioral'];
  const CODE_LANGS = ['cpp', 'java', 'js', 'php'];
  // bad/good = the problem and its fix; overkill/simple = the pattern used where it is not needed
  const CODE_KINDS = ['bad', 'good', 'overkill', 'simple'];
  const TEXT_FIELDS = ['summary', 'analogy', 'problem', 'solution', 'avoid', 'overkillNote'];
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
      ['usedIn', 'avoidWhen'].forEach((f) => {
        if (!Array.isArray(t[f]) || t[f].length === 0) problems.push(`text.${lang}.${f} missing`);
      });
    });

    if (!nonEmpty(p.diagram) || !p.diagram.trim().startsWith('<svg')) {
      problems.push('diagram must be an <svg> string');
    }
    ['az', 'en'].forEach((lang) => {
      if (!nonEmpty(p.diagramLabel && p.diagramLabel[lang])) problems.push(`diagramLabel.${lang} missing`);
    });
    if (typeof p.mount !== 'function') problems.push('mount() missing');

    CODE_KINDS.forEach((kind) => {
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
