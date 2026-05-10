#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SRC_DIR = path.join(__dirname, 'src');
const DIST_DIR = path.join(__dirname, 'dist');
const TEMPLATE = path.join(SRC_DIR, 'template.html');
const OUTPUT = path.join(DIST_DIR, 'annies-cozy-day.html');

// 1. Read template
const template = fs.readFileSync(TEMPLATE, 'utf8');

// 2. Collect and sort source files (alphabetical = execution order)
const srcFiles = fs.readdirSync(SRC_DIR)
  .filter(f => f.endsWith('.js'))
  .sort();

console.log(`Bundling ${srcFiles.length} source files...`);

// 3. Concatenate
const scripts = srcFiles.map(f => {
  const content = fs.readFileSync(path.join(SRC_DIR, f), 'utf8');
  console.log(`  ${f} (${content.split('\n').length} lines)`);
  return content;
});
const bundle = scripts.join('');

// 4. Inject into template
// The regex consumes the newline after {{GAME_SCRIPT}} so the bundle's
// own trailing blank lines control spacing before })();
if (!template.includes('{{GAME_SCRIPT}}')) {
  console.error('ERROR: template.html missing {{GAME_SCRIPT}} placeholder');
  process.exit(1);
}
const output = template.replace(/\{\{GAME_SCRIPT\}\}\r?\n/, bundle);

// 5. Write output
fs.mkdirSync(DIST_DIR, { recursive: true });
fs.writeFileSync(OUTPUT, output);

// 6. Count lines
const totalLines = output.split('\n').length;
const scriptLines = bundle.split('\n').length;
console.log(`\nOutput: ${OUTPUT}`);
console.log(`  Total: ${totalLines} lines`);
console.log(`  Script: ${scriptLines} lines`);

// 7. Syntax check
try {
  const jsCheck = `(() => {\n${bundle}\n})();`;
  const tmpFile = path.join(__dirname, '.syntax-check.js');
  fs.writeFileSync(tmpFile, jsCheck);
  execSync(`"${process.execPath}" --check "${tmpFile}"`, { stdio: 'pipe' });
  fs.unlinkSync(tmpFile);
  console.log('  Syntax: OK');
} catch (e) {
  console.error('  Syntax: FAILED');
  console.error(e.stderr?.toString() || e.message);
  process.exit(1);
}

console.log('\nBuild complete.');
