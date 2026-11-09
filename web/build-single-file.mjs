import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const check = process.argv.includes('--check');

const excludeMockPlugin = {
  name: 'exclude-mock-serial',
  setup(build) {
    build.onLoad({ filter: /tests[\\/]mock-serial\.mjs$/ }, () => ({
      contents: 'export function installMockSerial() {}',
      loader: 'js'
    }));
  }
};

const result = await build({
  entryPoints: [join(root, 'app.js')],
  bundle: true,
  format: 'iife',
  minify: true,
  write: false,
  logLevel: 'warning',
  plugins: [excludeMockPlugin]
});

const js = result.outputFiles[0].text;
const html = readFileSync(join(root, 'index.html'), 'utf8');
const css = readFileSync(join(root, 'styles.css'), 'utf8');

const styled = html.replace('<link rel="stylesheet" href="styles.css">', () => `<style>\n${css}\n</style>`);
if (styled === html) {
  throw new Error('Failed to inline styles.css: <link> tag not found');
}

const inlined = styled.replace('<script type="module" src="app.js"></script>', () => `<script>\n${js}\n</script>`);
if (inlined === styled) {
  throw new Error('Failed to inline app.js: <script> tag not found');
}

if (check) {
  const existing = readFileSync(join(root, 'single-file.html'), 'utf8');
  if (existing !== inlined) {
    console.error('single-file.html is out of date. Run npm run build:single.');
    process.exit(1);
  }
  console.log('single-file.html is up to date.');
} else {
  writeFileSync(join(root, 'single-file.html'), inlined);
  console.log('Wrote single-file.html');
}
