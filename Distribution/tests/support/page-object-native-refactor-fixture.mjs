// A mixed-entry uncommitted change for the native refactoring journey.
import { execFileSync } from "node:child_process";
import { cpSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createPageObjectProject } from "./page-object-native-fixture.mjs";

export async function createPageObjectRefactorProject(directory, host) {
  const fixture = await createPageObjectProject(directory, host);
  const skills = join(fixture.installed, "..");
  for (const name of [
    "dough-execute-plan",
    "dough-post-change-refactor",
    "dough-story-refinement",
  ]) {
    cpSync(
      new URL(`../../src/skills/${name}`, import.meta.url),
      join(skills, name),
      { recursive: true },
    );
  }
  writeFileSync(
    join(fixture.project, "AGENTS.md"),
    `# Library project guidance
The Library and Item are the domain vocabulary. README.md owns running checks.
The production subsystem is library.html; support/ owns the browser test harness.
There are no ADRs, generation triggers, or formatter hooks in this small project.
Use git diff --check for whitespace. Preserve the application and test harness.
`,
  );
  const git = (...args) =>
    execFileSync("git", ["-C", fixture.project, ...args]);
  git("add", ".");
  git("commit", "-m", "install candidate guidance");
  writeFileSync(
    join(fixture.project, "browser/library.spec.mjs"),
    `import { holdItemRead } from './held-read.mjs';
export async function run({ page, expect, assert }) {
  const held = await holdItemRead(page, 'atlas');
  try {
    await page.goto('/');
    await page.getByRole('navigation', { name: 'Library' }).getByRole('button', { name: 'Atlas', exact: true }).click();
    await held.started;
    const item = page.getByRole('main', { name: 'Item' });
    await expect(item.getByRole('status')).toHaveText('Loading item');
    assert.deepEqual(held.requests, ['atlas']);
    held.release();
    await expect(item.getByRole('heading')).toHaveText('Atlas');
    await item.getByRole('button', { name: 'Open related item', exact: true }).click();
    await expect(item.getByRole('heading')).toHaveText('Boreal');
    assert.deepEqual(held.requests, ['atlas', 'boreal']);
  } finally { held.release(); held.dispose(); }
}
`,
  );
  git("add", "browser/library.spec.mjs");
  writeFileSync(
    join(fixture.project, "legacy/library.spec.mjs"),
    `export async function run({ page, expect }) {
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Library' }).getByRole('button', { name: 'Boreal', exact: true }).click();
  await expect(page.getByRole('main', { name: 'Item' }).getByRole('heading')).toHaveText('Boreal');
}
`,
  );
  return fixture;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [directory, host] = process.argv.slice(2);
  console.log(
    JSON.stringify(await createPageObjectRefactorProject(directory, host)),
  );
}
