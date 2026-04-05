/**
 * Build script: minify JS and CSS into dist/styles/ and dist/scripts/.
 * Output filenames include a content hash (e.g. common.a1b2c3d4.min.css)
 * so assets can be served with a 1-year Cache-Control header safely —
 * the hash changes whenever the source changes, busting the cache automatically.
 * HTML files are updated in-place to reference the hashed filenames.
 * Rewrites are idempotent — safe to run multiple times.
 *
 * Usage: npm run build
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, statSync } from 'fs';
import { join, extname, basename, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';
import CleanCSS from 'clean-css';
import { minify } from 'terser';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT  = join(__dirname, '..');
const DIST  = join(ROOT, 'dist');

// Maps base name → hashed output filename, populated during the minify steps.
// e.g. 'common' → 'common.a1b2c3d4.min.css'
const cssMap = {};
const jsMap  = {};

// ─── helpers ────────────────────────────────────────────────────────────────

function ensureDir(dir) {
  mkdirSync(dir, { recursive: true });
}

function contentHash(str) {
  return createHash('sha256').update(str).digest('hex').slice(0, 8);
}

/**
 * Idempotently rewrite CSS/JS references using the generated hash maps.
 * Matches all three forms a file reference can be in across repeated builds:
 *   styles/foo.css
 *   dist/styles/foo.min.css           (non-hashed, from a previous build)
 *   dist/styles/foo.a1b2c3d4.min.css  (hashed, from a previous build)
 */
function rewriteHtmlRefs(html) {
  for (const [base, outName] of Object.entries(cssMap)) {
    html = html.replace(
      new RegExp(`(href=["'])(?:dist\\/)?styles\\/${base}(?:\\.[a-f0-9]+)?(?:\\.min)?\\.css(["'])`, 'g'),
      `$1dist/styles/${outName}$2`
    );
  }
  for (const [base, outName] of Object.entries(jsMap)) {
    html = html.replace(
      new RegExp(`(src=["'])(?:dist\\/)?scripts\\/${base}(?:\\.[a-f0-9]+)?(?:\\.min)?\\.js(["'])`, 'g'),
      `$1dist/scripts/${outName}$2`
    );
  }
  return html;
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

  const cleancss = new CleanCSS({ level: 1, returnPromise: false });

  for (const file of readdirSync(srcDir)) {
    if (extname(file) !== '.css') continue;
    const src = readFileSync(join(srcDir, file), 'utf8');

    // Extract @keyframes blocks before passing to CleanCSS (CleanCSS v5
    // corrupts percentage-stop keyframes with level-1 optimisations).
    // Strategy: pull every @keyframes { … } block out of the source,
    // minify the rest normally, then prepend the raw (whitespace-stripped)
    // keyframe blocks.
    const keyframeBlocks = [];
    const srcWithoutKeyframes = src.replace(/@keyframes\s+[\w-]+\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g, (match) => {
      // Compact the raw block: collapse runs of whitespace to a single space,
      // strip spaces around { } : ; , so it reads like minified CSS.
      const compact = match
        .replace(/\/\*.*?\*\//gs, '')     // strip comments
        .replace(/\s+/g, ' ')             // collapse whitespace
        .replace(/\s*\{\s*/g, '{')
        .replace(/\s*\}\s*/g, '}')
        .replace(/\s*:\s*/g, ':')
        .replace(/\s*;\s*/g, ';')
        .replace(/\s*,\s*/g, ',')
        .trim();
      keyframeBlocks.push(compact);
      return '';                          // remove from src passed to CleanCSS
    });

    const result = cleancss.minify(srcWithoutKeyframes);
    if (result.errors.length) {
      console.error(`CSS error in ${file}:`, result.errors);
      process.exit(1);
    }

    const styles = keyframeBlocks.join('') + result.styles;
    const base    = basename(file, '.css');
    const hash    = contentHash(styles);
    const outName = `${base}.${hash}.min.css`;
    cssMap[base]  = outName;
    writeFileSync(join(outDir, outName), styles);
    const saving = Math.round((1 - styles.length / src.length) * 100);
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
    const base    = basename(file, '.js');
    const hash    = contentHash(result.code);
    const outName = `${base}.${hash}.min.js`;
    jsMap[base]   = outName;
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
