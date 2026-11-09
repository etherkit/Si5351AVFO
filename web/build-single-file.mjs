import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));

const result = await build({
  entryPoints: [join(root, 'app.js')],
  bundle: true,
  format: 'iife',
  minify: true,
  write: false,
  logLevel: 'warning'
});

const js = result.outputFiles[0].text;
const html = readFileSync(join(root, 'index.html'), 'utf8');
const css = readFileSync(join(root, 'styles.css'), 'utf8');

const inlined = html
  .replace('<link rel="stylesheet" href="styles.css">', () => `<style>\n${css}\n</style>`)
  .replace('<script type="module" src="app.js"></script>', () => `<script>\n${js}\n</script>`);

writeFileSync(join(root, 'single-file.html'), inlined);
console.log('Wrote single-file.html');
