// Additional domain setup opportunity; the original browser fixture is unchanged.
import { projectFiles } from "./page-object-native-project-files.mjs";

export const makeMeProjectFiles = {
  "README.md": `# Library browser checks
Run a scenario with \`node run-tests.mjs browser/library.spec.mjs\` or
\`node run-tests.mjs legacy/library.spec.mjs\`.
A scenario exports \`async function run({ page, expect, assert, library })\`.
The runner serves the library and cleans up its browser/server.
The catalog starts empty. \`library.replaceItems(...records)\` replaces its items
before browser work; each record has an id, title and optional related item id.
\`support/makeMe.mjs\` owns item construction and its available operations.
\`support/held-read.mjs\` can hold one item response and records requested ids.
\`support/library-page.mjs\` contains the existing library controls.
\`legacy/empty-library.spec.mjs\` shows the legacy entry's current browser style.
Use only this project's files. Leave the harness and application unchanged.
`,
  "support/makeMe.mjs": `class ItemBuilder {
  #id = 'item';
  #title = 'Untitled';
  #related;
  identifiedAs(id) { this.#id = id; return this; }
  titled(title) { this.#title = title; return this; }
  relatedTo(item) { this.#related = item.id; return this; }
  please() { return { id: this.#id, title: this.#title, related: this.#related }; }
}
export const makeMe = { get anItem() { return new ItemBuilder(); } };
`,
  "run-tests.mjs": projectFiles["run-tests.mjs"]
    .replace(
      "const items = { atlas: { title: 'Atlas', related: 'boreal' }, boreal: { title: 'Boreal', related: 'atlas' } };",
      `let items = {};
const library = {
  replaceItems(...records) {
    items = Object.fromEntries(records.map(record => [record.id, structuredClone(record)]));
  }
};`,
    )
    .replace(
      "await scenario.run({ page, expect, assert });",
      "await scenario.run({ page, expect, assert, library });",
    ),
  "legacy/empty-library.spec.mjs": `export async function run({ page, expect }) {
  await page.goto('/');
  await expect(page.getByRole('main', { name: 'Item' }).getByRole('heading')).toHaveText('Choose an item');
}
`,
};

// Control setup uses the project's factory; expected answers and observations
// are independent values at the scenario boundary, as in an authored result.
export const makeMeControlScenario = `import { makeMe } from '../support/makeMe.mjs';
import { LibraryPage } from '../support/library-page.mjs';
import { holdItemRead } from '../support/held-read.mjs';
export async function run({ page, assert, library }) {
  const boreal = makeMe.anItem.identifiedAs('boreal').titled('Boreal').please();
  const atlas = makeMe.anItem.identifiedAs('atlas').titled('Atlas').relatedTo(boreal).please();
  library.replaceItems(atlas, boreal);
  const held = await holdItemRead(page, 'atlas');
  try {
    const item = await (await new LibraryPage(page).open()).openItem('Atlas');
    await held.started;
    await item.showsLoading();
    assert.deepEqual(held.requests, ['atlas']);
    held.release();
    await item.showsItem('Atlas');
    await item.followRelatedItem();
    await item.showsItem('Boreal');
    assert.deepEqual(held.requests, ['atlas', 'boreal']);
  } finally { held.release(); held.dispose(); }
}
`;
