// Running browser fixture code. The repository description owns its project
// files; this harness injects only the installed browser runtime location.
import { fileURLToPath } from "node:url";

const playwright = fileURLToPath(
  new URL("../../node_modules/@playwright/test/index.mjs", import.meta.url),
);

export const projectFiles = {
  "README.md": `# Library browser checks
Run a scenario with \`node run-tests.mjs browser/library.spec.mjs\`.
A scenario module exports \`async function run({ page, expect, assert })\`.
The runner serves this project's library and cleans up the browser/server.
\`support/library-page.mjs\` contains the current library controls.
\`support/held-read.mjs\` can hold one item response and records requested item ids.
Use only this project's files. Leave the harness and application unchanged.
`,
  "package.json": JSON.stringify({
    name: "library-browser-fixture",
    private: true,
    type: "module",
  }),
  "support/browser.mjs": `export { chromium, expect } from ${JSON.stringify(playwright)};\n`,
  "library.html": `<!doctype html><title>Library</title>
<nav aria-label="Library"><button data-item="atlas">Atlas</button><button data-item="boreal">Boreal</button></nav>
<main aria-label="Item"><h1>Choose an item</h1></main>
<script>
async function openItem(id) {
  const main = document.querySelector('main');
  main.innerHTML = '<p role="status">Loading item</p>';
  const item = await (await fetch('/api/items/' + id)).json();
  main.innerHTML = '<h1></h1><button>Open related item</button>';
  main.querySelector('h1').textContent = item.title;
  main.querySelector('button').onclick = () => openItem(item.related);
}
document.querySelectorAll('[data-item]').forEach(button => {
  button.onclick = () => openItem(button.dataset.item);
});
</script>`,
  "support/library-page.mjs": `import { expect } from './browser.mjs';
export class LibraryPage {
  constructor(page) { this.page = page; }
  async open() { await this.page.goto('/'); return this; }
  async openItem(title) {
    await this.page.getByRole('navigation', { name: 'Library' }).getByRole('button', { name: title, exact: true }).click();
    return new ItemPanel(this.page);
  }
}
export class ItemPanel {
  constructor(page) { this.region = page.getByRole('main', { name: 'Item' }); }
  async showsLoading() { await expect(this.region.getByRole('status')).toHaveText('Loading item'); return this; }
  async showsItem(expectedTitle) { await expect(this.region.getByRole('heading')).toHaveText(expectedTitle); return this; }
  async followRelatedItem() { await this.region.getByRole('button', { name: 'Open related item', exact: true }).click(); return this; }
}
`,
  "support/held-read.mjs": `export async function holdItemRead(page, id) {
  let received, release;
  const started = new Promise(resolve => { received = resolve; });
  const released = new Promise(resolve => { release = resolve; });
  const requests = [];
  const capture = request => {
    if (request.url().includes('/api/items/')) requests.push(request.url().split('/').at(-1));
  };
  page.on('request', capture);
  await page.route('**/api/items/' + id, async route => {
    received();
    await released;
    await route.continue();
  });
  return { started, requests, release, dispose: () => page.off('request', capture) };
}
`,
  "run-tests.mjs": `import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { chromium, expect } from './support/browser.mjs';
const items = { atlas: { title: 'Atlas', related: 'boreal' }, boreal: { title: 'Boreal', related: 'atlas' } };
const server = createServer(async (request, response) => {
  if (request.url.startsWith('/api/items/')) {
    const item = items[request.url.split('/').at(-1)];
    response.writeHead(item ? 200 : 404, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(item ?? {}));
  } else {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end(await readFile(new URL('./library.html', import.meta.url)));
  }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
try {
  browser = await chromium.launch();
  const context = await browser.newContext({ baseURL: 'http://127.0.0.1:' + server.address().port });
  const page = await context.newPage();
  const scenario = await import(pathToFileURL(resolve(process.argv[2])));
  await scenario.run({ page, expect, assert });
  console.log('SCENARIO PASSED');
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
`,
  "browser/.gitkeep": "",
  "legacy/.gitkeep": "",
};

// A control scenario exercises the fixture itself, not native agent behavior.
// Expected values and independent observations remain at this call site.
export const controlScenario = `import { LibraryPage } from '../support/library-page.mjs';
import { holdItemRead } from '../support/held-read.mjs';
export async function run({ page, assert }) {
  const held = await holdItemRead(page, 'atlas');
  const library = await new LibraryPage(page).open();
  const item = await library.openItem('Atlas');
  await held.started;
  await item.showsLoading();
  assert.deepEqual(held.requests, ['atlas']);
  held.release();
  await item.showsItem('Atlas');
  await item.followRelatedItem();
  await item.showsItem('Boreal');
  assert.deepEqual(held.requests, ['atlas', 'boreal']);
  held.dispose();
}
`;
