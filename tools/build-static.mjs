/**
 * Build script: minify JS and CSS into dist/styles/ and dist/scripts/.
 * HTML files stay in the project root and are updated in-place so their
 * stylesheet/script references point at the dist/*.min.* files.
 * Rewrites are idempotent — safe to run multiple times.
 *
 * Usage: npm run build
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, statSync } from 'fs';
import { join, extname, basename, dirname } from 'path';
import { fileURLToPath } from 'url';
import CleanCSS from 'clean-css';
import { minify } from 'terser';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT  = join(__dirname, '..');
const DIST  = join(ROOT, 'dist');

// ─── helpers ────────────────────────────────────────────────────────────────

function ensureDir(dir) {
  mkdirSync(dir, { recursive: true });
}

/**
 * Idempotently rewrite CSS/JS references in HTML to point at dist/*.min.* files.
 * Matches both the original form (styles/foo.css) and an already-rewritten form
 * (dist/styles/foo.min.css) so re-running build never corrupts the file.
 */
function rewriteHtmlRefs(html) {
  return html
    .replace(/(href=["'])(?:dist\/)?styles\/([^"']+?)(?:\.min)?\.css(["'])/g,
             '$1dist/styles/$2.min.css$3')
    .replace(/(src=["'])(?:dist\/)?scripts\/([^"']+?)(?:\.min)?\.js(["'])/g,
             '$1dist/scripts/$2.min.js$3');
}

// ─── steps ──────────────────────────────────────────────────────────────────

function cleanDist() {
  if (statSync(DIST, { throwIfNoEntry: false })) {
    rmSync(DIST, { recursive: true, force: true });
  }
  ensureDir(DIST);
  console.log('Cleaned: dist/');
}

function rewriteHtml() {
  for (const name of readdirSync(ROOT)) {
    const full = join(ROOT, name);
    if (!statSync(full).isFile() || extname(name) !== '.html') continue;
    const original = readFileSync(full, 'utf8');
    const updated  = rewriteHtmlRefs(original);
    if (updated !== original) {
      writeFileSync(full, updated);
      console.log(`HTML updated: ${name}`);
    } else {
      console.log(`HTML unchanged: ${name}`);
    }
  }
}

async function minifyCSS() {
  const srcDir = join(ROOT, 'styles');
  const outDir = join(DIST, 'styles');
  ensureDir(outDir);

  const cleancss = new CleanCSS({ level: 2, returnPromise: false });

  for (const file of readdirSync(srcDir)) {
    if (extname(file) !== '.css') continue;
    const src    = readFileSync(join(srcDir, file), 'utf8');
    const result = cleancss.minify(src);
    if (result.errors.length) {
      console.error(`CSS error in ${file}:`, result.errors);
      process.exit(1);
    }
    const outName = basename(file, '.css') + '.min.css';
    writeFileSync(join(outDir, outName), result.styles);
    const saving = Math.round((1 - result.stats.minifiedSize / result.stats.originalSize) * 100);
    console.log(`CSS: ${file} → dist/styles/${outName}  (${saving}% smaller)`);
  }
}

async function minifyJS() {
  const srcDir = join(ROOT, 'scripts');
  const outDir = join(DIST, 'scripts');
  ensureDir(outDir);

  for (const file of readdirSync(srcDir)) {
    if (extname(file) !== '.js') continue;
    const src    = readFileSync(join(srcDir, file), 'utf8');
    const result = await minify(src, {
      compress: { drop_console: false, passes: 2 },
      mangle:   true,
      format:   { comments: false },
    });
    const outName = basename(file, '.js') + '.min.js';
    writeFileSync(join(outDir, outName), result.code);
    const saving = Math.round((1 - result.code.length / src.length) * 100);
    console.log(`JS:  ${file} → dist/scripts/${outName}  (${saving}% smaller)`);
  }
}

// ─── main ────────────────────────────────────────────────────────────────────

(async () => {
  console.log('Building dist/...\n');

  cleanDist();
  await minifyCSS();
  await minifyJS();
  rewriteHtml();

  console.log('\nDone. dist/ contains only minified CSS and JS.');
  console.log('Deploy the whole project root (including dist/) to public_html.');
})();
