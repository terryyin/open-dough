import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { once } from "node:events";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

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
    assert.notEqual(
      end,
      -1,
      "ci-notify-codex.md host binding fence must close",
    );
    cells.push(markdown.slice(start + fence.length, end));
    from = end + 4;
  }
  assert.equal(
    cells.length,
    2,
    "ci-notify-codex.md must fence launch and stop",
  );
  return cells;
}

function evaluateDocumentedCell(cell, bindings) {
  const names = Object.keys(bindings);
  // eslint-disable-next-line no-new-func -- Exercise the documented cell with injected host bindings.
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

const resolvedSkill = fileURLToPath(new URL("..", import.meta.url));
const documentedPlaceholders = {
  "OWNER/REPO": "owner/repo",
  BRANCH: "main",
  COORDINATOR: "coordinator",
};

// The arguments `node` receives for a documented cell's command line, with
// its placeholders resolved to `skill` and the fixture's `placeholders`.
function documentedNodeArguments(cmd, skill, placeholders) {
  const [program, ...words] = cmd.split(" ");
  assert.equal(program, "node");
  return words.map(
    (word) =>
      placeholders[word] ??
      word.replace("/ABSOLUTE/RESOLVED/SKILL/", join(skill, "/")),
  );
}

// Serves a documented Codex cell's `tools` from real processes. The `stream`
// command's child, spawned by `startStream(nodeArguments)`, answers
// `exec_command` and `write_stdin` with its genuine stdout, so the cell's own
// consume/deliver/store logic runs against real bytes. Any other command runs
// to completion under `env` and is listed in `commands`. After
// `stopReading()`, the host stops returning that session's output, as when the
// coordinator no longer reads it; the child keeps running. `skill` is the
// resolved skill the cell runs, this source by default, and `placeholders`
// replaces the fixture values the cell's placeholders resolve to.
export function processBackedCodexTools({
  env,
  startStream,
  skill = resolvedSkill,
  placeholders,
}) {
  const resolved = { ...documentedPlaceholders, ...placeholders };
  let child;
  let closed = false;
  let reading = true;
  let buffer = "";
  let closeEvent;
  let readingStopped;
  const stopped = new Promise((resolve) => {
    readingStopped = resolve;
  });
  const commands = [];
  const nextChunk = async () => {
    if (buffer === "" && !closed && reading)
      await Promise.race([once(child.stdout, "data"), closeEvent, stopped]);
    if (!reading) return { output: "", session_id: undefined };
    const output = buffer;
    buffer = "";
    return { output, session_id: closed ? undefined : String(child.pid) };
  };
  const run = promisify(execFile);
  return {
    commands,
    stopReading() {
      reading = false;
      readingStopped();
    },
    tools: {
      exec_command: async ({ cmd }) => {
        const nodeArguments = documentedNodeArguments(cmd, skill, resolved);
        if (nodeArguments[1] !== "stream") {
          commands.push(nodeArguments.slice(1));
          const { stdout, stderr } = await run(
            process.execPath,
            nodeArguments,
            {
              env,
            },
          );
          return { output: `${stdout}${stderr}`, session_id: undefined };
        }
        child = startStream(nodeArguments);
        child.stdout.on("data", (chunk) => {
          buffer += chunk.toString();
        });
        closeEvent = once(child, "close").then(() => {
          closed = true;
        });
        return nextChunk();
      },
      write_stdin: async () => nextChunk(),
    },
  };
}
