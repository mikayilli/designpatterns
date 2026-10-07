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

// Optional filter: `node tests/run-node.js singleton builder` runs only test files whose
// name contains one of the words (use it while a pattern is still being written).
const filters = process.argv.slice(2);

// A pattern file that fails to load is reported and skipped instead of crashing every run.
let loadErrors = 0;
function safeRequire(file) {
  try {
    require(file);
  } catch (err) {
    loadErrors += 1;
    console.log(`  LOAD ERROR ${path.basename(file)}: ${err.message}`);
  }
}

const patternFiles = fs.readdirSync(path.join(root, 'patterns')).filter((f) => f.endsWith('.js'));
patternFiles.filter((f) => f.endsWith('.logic.js')).forEach((f) => safeRequire(path.join(root, 'patterns', f)));
patternFiles.filter((f) => !f.endsWith('.logic.js')).forEach((f) => safeRequire(path.join(root, 'patterns', f)));

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
  .filter((f) => filters.length === 0 || filters.some((word) => f.includes(word)))
  .forEach((f) => {
    console.log(f);
    require(path.join(__dirname, f))(test, assert, global.DP);
  });

console.log(`\n${passed} passed, ${failed} failed${loadErrors ? `, ${loadErrors} file(s) failed to load` : ''}`);
process.exit(failed || loadErrors ? 1 : 0);
