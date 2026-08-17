/* Page assembly.
 *
 * The three homepage variants were standalone files, and the masthead and footer
 * were copied between them by hand — 49 and 76 lines each in index2's case. That
 * is survivable at three files and not at six: the failure mode is not a broken
 * build, it is a phone number that got changed in four places out of five and
 * nobody noticing which one was missed.
 *
 * So: pages are authored in src/pages/ with the shared chrome pulled in, and this
 * writes them to the repo root. Deliberately small — no dependency, no template
 * language to learn, and the output is still plain static HTML that opens from
 * the filesystem.
 *
 *   {{> name }}      inline src/partials/name.html
 *   {{ key }}        substitute a value from the page's front matter
 *   {{# key }}…{{/}} keep the block only when `key` is truthy
 *
 * Front matter is the leading <!--- … ---> comment: `key: value` per line. It is
 * a comment so an unbuilt source page still opens in a browser.
 *
 * Partials may contain partials. Substitution runs after inlining, so a value set
 * by a page reaches the chrome it was pulled into.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT     = join(dirname(fileURLToPath(import.meta.url)), '..');
const PAGES    = join(ROOT, 'src', 'pages');
const PARTIALS = join(ROOT, 'src', 'partials');

const MAX_DEPTH = 10;                       // partial recursion guard

/* ── front matter ──────────────────────────────────────────────────────────
   The opening <!--- … ---> block, if present. Four dashes so it cannot collide
   with an ordinary comment somebody writes at the top of a page. */
function frontMatter(src) {
  const m = src.match(/^\s*<!---([\s\S]*?)--->\s*/);
  if (!m) return [{}, src];

  const vars = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^\s*([\w-]+)\s*:\s*(.*?)\s*$/);
    if (kv) vars[kv[1]] = kv[2];
  }
  return [vars, src.slice(m[0].length)];
}

/* ── {{> partial }} ─────────────────────────────────────────────────────── */
function inlinePartials(src, page, depth = 0) {
  if (depth > MAX_DEPTH) {
    throw new Error(`${page}: partials nested more than ${MAX_DEPTH} deep — probably a cycle`);
  }
  return src.replace(/([ \t]*)\{\{>\s*([\w-]+)\s*\}\}/g, (_, indent, name) => {
    const file = join(PARTIALS, `${name}.html`);
    if (!existsSync(file)) throw new Error(`${page}: no partial "${name}" (looked in src/partials/${name}.html)`);
    const body = readFileSync(file, 'utf8').replace(/\s*$/, '');
    // Re-indent so the assembled file reads like something a person wrote.
    const indented = body.split('\n').map((l, i) => (i === 0 || !l ? l : indent + l)).join('\n');
    return indent + inlinePartials(indented, page, depth + 1);
  });
}

/* ── {{# key }} … {{/ key }} ────────────────────────────────────────────────
   One level, no nesting of the same key. Enough for "is this the current page",
   which is the only conditional the chrome actually needs. */
function conditionals(src, vars) {
  return src.replace(/\{\{#\s*([\w-]+)\s*\}\}([\s\S]*?)\{\{\/\s*\1?\s*\}\}/g,
    (_, key, body) => (vars[key] && vars[key] !== 'false' ? body : ''));
}

/* ── {{ key }} ─────────────────────────────────────────────────────────────
   An unknown key is a build error, not an empty string. A page that silently
   ships "{{ PHONE }}" or a blank <title> is exactly what this file exists to
   stop happening quietly. */
function substitute(src, vars, page) {
  const missing = new Set();
  const out = src.replace(/\{\{\s*([\w-]+)\s*\}\}/g, (whole, key) => {
    if (!(key in vars)) { missing.add(key); return whole; }
    return vars[key];
  });
  if (missing.size) {
    throw new Error(`${page}: no value for ${[...missing].map((k) => `{{ ${k} }}`).join(', ')}`);
  }
  return out;
}

/* ── site-wide values ──────────────────────────────────────────────────────
   The confirmed facts, in one place. Both of these are verified — see
   docs/CONTENT-TODO.md §1 and §2. Anything NOT confirmed deliberately does not
   live here: a shared constant is how an unverified value quietly becomes the
   thing every page agrees on. */
const SITE = {
  PHONE_DISPLAY: '(516) 820-0360',
  PHONE_NBSP:    '(516)&nbsp;820-0360',
  PHONE_HREF:    'tel:+15168200360',
  ADDRESS:       '10 N Prospect Ave, Lynbrook, NY 11563',
  YEAR:          '2026',
};

function build() {
  if (!existsSync(PAGES)) { console.error('src/pages/ does not exist'); process.exit(1); }

  const sources = readdirSync(PAGES).filter((f) => f.endsWith('.html')).sort();
  if (!sources.length) { console.error('src/pages/ has no .html files'); process.exit(1); }

  let failed = 0;

  for (const file of sources) {
    const name = basename(file);
    try {
      const raw = readFileSync(join(PAGES, file), 'utf8');
      const [pageVars, body] = frontMatter(raw);
      const vars = { ...SITE, ...pageVars };

      let out = inlinePartials(body, name);
      out = conditionals(out, vars);
      out = substitute(out, vars, name);

      const target = join(ROOT, pageVars.OUT || name);
      const prev = existsSync(target) ? readFileSync(target, 'utf8') : null;

      if (prev === out) {
        console.log(`  = ${pageVars.OUT || name}`);
      } else {
        writeFileSync(target, out);
        console.log(`  ${prev === null ? '+' : '~'} ${pageVars.OUT || name}`);
      }
    } catch (err) {
      failed++;
      console.error(`  ✗ ${err.message}`);
    }
  }

  if (failed) { console.error(`\n${failed} page${failed > 1 ? 's' : ''} failed`); process.exit(1); }
  console.log(`\n✓ ${sources.length} page${sources.length > 1 ? 's' : ''}`);
}

build();
