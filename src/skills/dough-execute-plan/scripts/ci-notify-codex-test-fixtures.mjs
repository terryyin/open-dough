import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const documentedCell = Symbol("documented-codex-cell-exit");

function documentedCodexHostBindings() {
  const markdown = readFileSync(
    new URL("../references/ci-notify-codex.md", import.meta.url),
    "utf8",
  );
  const fence = "```js\n";
  const cells = [];
  let from = 0;
  while (from < markdown.length) {
    const start = markdown.indexOf(fence, from);
    if (start === -1) break;
    const end = markdown.indexOf("\n```", start + fence.length);
    assert.notEqual(end, -1, "ci-notify-codex.md host binding fence must close");
    cells.push(markdown.slice(start + fence.length, end));
    from = end + 4;
  }
  assert.equal(cells.length, 2, "ci-notify-codex.md must fence launch and stop");
  return cells;
}

function evaluateDocumentedCell(cell, bindings) {
  const names = Object.keys(bindings);
  return new Function(
    ...names,
    `"use strict"; return (async () => {\n${cell}\n})();`,
  )(...Object.values(bindings));
}

export function documentedCodexHostBinding() {
  const [cell] = documentedCodexHostBindings();
  assert.match(cell, /tools\.exec_command/);
  assert.match(cell, /yield_control/);
  assert.match(cell, /ci-mailbox\.mjs stream/);
  return cell;
}

export function documentedCodexStopBinding() {
  const [, cell] = documentedCodexHostBindings();
  assert.match(cell, /ci-mailbox\.mjs stop/);
  assert.doesNotMatch(cell, /write_stdin/);
  assert.doesNotMatch(cell, /yield_control/);
  return cell;
}

export async function runDocumentedCodexHostBinding({
  load,
  tools,
  text,
  yield_control,
  notify,
  store,
}) {
  try {
    await evaluateDocumentedCell(documentedCodexHostBinding(), {
      load,
      exit: () => {
        throw documentedCell;
      },
      tools,
      text,
      yield_control,
      notify,
      store,
    });
    return { completed: true };
  } catch (error) {
    if (error === documentedCell) return { skipped: true };
    throw error;
  }
}

export async function runDocumentedCodexStopBinding({
  directory,
  tools,
  text,
  notify,
}) {
  await evaluateDocumentedCell(documentedCodexStopBinding(), {
    directory,
    tools,
    text,
    notify,
  });
}
