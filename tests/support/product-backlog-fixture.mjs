// Shared starting precondition and harness for the backlog CLI tests: a valid
// backlog of the real shape in a scratch project, and the real command run
// against it as a child process.
import { execFile } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const exec = promisify(execFile);
export const cli = fileURLToPath(
  new URL(
    "../../src/skills/dough-product-backlog/scripts/product-backlog.mjs",
    import.meta.url,
  ),
);
const backlogPath = ".planning/PRODUCT-BACKLOG.md";

export const queued = [
  "- [Queue trunk integration for agents on the same machine](seeds/SEED-008-worktree-branch-trunk-sync.md#same-machine-merge-queue) — SEED-008#same-machine-merge-queue",
  "- [Skip process retrospectives by default for new installations](seeds/SEED-001-install-and-update-open-dough.md#default-skip-process-retrospective) — SEED-001#default-skip-process-retrospective",
  "- [Strengthen architectural review after using the lightweight guidance](seeds/SEED-004-extract-and-adopt-project-guidance.md#proudly-found-elsewhere-design) — SEED-004#proudly-found-elsewhere-design",
];

export const takenEntry =
  "- [Update the product backlog without hand-editing the shared list](seeds/SEED-008-worktree-branch-trunk-sync.md#script-product-backlog-list-updates) — SEED-008#script-product-backlog-list-updates ([plan](slice-plans/057-script-product-backlog/PLAN.md))";

// The identity each line above records, spelled out rather than derived, so a
// test naming one of them does not take the product's own derivation as its
// expectation. Every operation names work this way, so they live beside the
// lines they belong to instead of being respelled per test file. An entry
// records its identity in full: the link beside it is where the canonical home
// is now, and moving it never re-identifies the work.
export const trunkQueue = "SEED-008#same-machine-merge-queue";
export const skipRetrospective = "SEED-001#default-skip-process-retrospective";
export const architecture = "SEED-004#proudly-found-elsewhere-design";
export const takenStory = "SEED-008#script-product-backlog-list-updates";

// The direction the established backlog carries, spelled out as one value: a
// wrapped paragraph, because that is the real shape a project writes.
export const direction =
  "Enable agents to execute stories in parallel while collaborating through\n" +
  "trunk-based development, with each agent working in its own Git worktree.";

// Everything the established backlog holds before its two lists. A backlog
// carrying no direction holds no such section at all.
function preambleOf(text) {
  const held = text === "" ? "" : `## Near-future direction\n\n${text}\n\n`;
  return `# Product backlog\n\n${held}`;
}

// The whole backlog a run is expected to leave behind, spelled from the two
// lists rather than derived from the product's own rendering, so an expectation
// cannot agree with a wrongly rendered document. A list holding nothing keeps
// its heading and the single blank line before the next one.
export function backlogOf(taken, queue, text = direction) {
  const held = taken.length > 0 ? `${taken.join("\n")}\n\n` : "";
  return `${preambleOf(text)}## Taken\n\n${held}## Backlog list\n\n${queue.join("\n")}\n`;
}

// The starting precondition every test shares: one taken entry, three queued.
export const backlog = backlogOf([takenEntry], queued);

export const added = {
  identity: "SEED-002#publish-the-release-notes",
  title: "Publish the release notes with the tagged release",
  link: "seeds/SEED-002-release-the-guidance.md#publish-the-release-notes",
};
export const addedLine = `- [${added.title}](${added.link}) — ${added.identity}`;

// The canonical home `added` links: a seed whose own "id:" plus the story's
// anchor already compose the identity `added` carries, so nothing needs to be
// recorded there beyond the ordinary shape a fresh, unadopted story has.
export const addedHomeSource = `---
id: SEED-002
---

# Release the guidance

<a id="publish-the-release-notes"></a>

### Publish the release notes with the tagged release

Ship the notes once tagging completes.
`;

// Plants the canonical home `added` links, resolved from `baseDirectory`
// exactly as the product resolves it: relative to wherever the backlog file
// an operation is run against actually sits. A test that relocates the
// backlog file plants this at the relocated backlog's own directory, not at
// the project's default one.
export function plantAddedHome(baseDirectory, source = addedHomeSource) {
  const path = join(baseDirectory, "seeds", "SEED-002-release-the-guidance.md");
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, source, "utf8");
  return path;
}

// The common case: the canonical home planted beside a project's own backlog
// file, at whichever path it currently reads from.
export function addedHome(project) {
  return plantAddedHome(dirname(project.file));
}

export function addArguments(
  request = added,
  placement = ["--after", skipRetrospective],
) {
  return [
    "add",
    "--identity",
    request.identity,
    "--title",
    request.title,
    "--link",
    request.link,
    ...placement,
  ];
}

// Supplies only the starting precondition: a valid backlog in a scratch project.
export function scratchProject(t, source = backlog) {
  const directory = mkdtempSync(join(tmpdir(), "dough-backlog-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const file = join(directory, backlogPath);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, source, "utf8");
  return { directory, file, read: () => readFileSync(file, "utf8") };
}

// Supplies only the starting precondition: a file that one of the backlog's
// links names, beside the backlog it is relative to.
export function projectFile(project, relative, contents = "# A plan\n") {
  const path = join(project.directory, dirname(backlogPath), relative);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents, "utf8");
  return path;
}

export async function run(project, arguments_, environment = {}) {
  try {
    const { stdout, stderr } = await exec(
      process.execPath,
      [cli, ...arguments_],
      {
        cwd: project.directory,
        env: { ...process.env, ...environment },
      },
    );
    return { code: 0, stdout, stderr };
  } catch (error) {
    return { code: error.code, stdout: error.stdout, stderr: error.stderr };
  }
}

// The entry lines one list holds, read back out of a written backlog, for the
// tests that establish where an entry sits or what a list still holds rather
// than comparing the whole document.
export function entries(source, name) {
  const body = source.split(`## ${name}\n`)[1] ?? "";
  return body
    .split("\n## ")[0]
    .split("\n")
    .filter((line) => line.startsWith("- "));
}

// How many times a document holds `needle`, for the tests that establish an
// entry is listed once, or not at all, rather than merely present or absent.
export function occurrences(text, needle) {
  return text.split(needle).length - 1;
}

// The backlog with the added entry at the queue position `index` places it
// into, counting from before the first queued entry.
export function withEntry(index) {
  return backlogOf(
    [takenEntry],
    [...queued.slice(0, index), addedLine, ...queued.slice(index)],
  );
}
