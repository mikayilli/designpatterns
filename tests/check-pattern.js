// Usage: node tests/check-pattern.js singleton builder
// Loads every pattern and prints the validation problems of the given pattern ids only,
// so you can check your own patterns while other patterns are still being written.
const fs = require('fs');
const path = require('path');

global.window = global;
const root = path.join(__dirname, '..');
['registry', 'i18n', 'state', 'validate'].forEach((name) => require(path.join(root, 'js', name + '.js')));

const dir = path.join(root, 'patterns');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.js'));
[...files.filter((f) => f.endsWith('.logic.js')), ...files.filter((f) => !f.endsWith('.logic.js'))].forEach((f) => {
  try {
    require(path.join(dir, f));
  } catch (err) {
    console.log(`LOAD ERROR ${f}: ${err.message}`);
  }
});

const ids = process.argv.slice(2);
if (ids.length === 0) {
  console.log('Usage: node tests/check-pattern.js <pattern-id> [...]');
  process.exit(2);
}
const results = global.DP.validate.validateAll(global.DP.patterns);
let bad = 0;
ids.forEach((id) => {
  const r = results.find((x) => x.id === id);
  if (!r) {
    bad += 1;
    console.log(`MISSING  ${id}: not registered (check patterns/${id}.js)`);
  } else if (r.problems.length) {
    bad += 1;
    console.log(`PROBLEMS ${id}:\n  - ${r.problems.join('\n  - ')}`);
  } else {
    console.log(`OK       ${id}`);
  }
});
process.exit(bad ? 1 : 0);
