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
const cli = fileURLToPath(
  new URL(
    "../../src/skills/dough-product-backlog/scripts/product-backlog.mjs",
    import.meta.url,
  ),
);
const backlogPath = ".planning/PRODUCT-BACKLOG.md";

export const queued = [
  "- [Queue trunk integration for agents on the same machine](seeds/SEED-008-worktree-branch-trunk-sync.md#same-machine-merge-queue) — SEED-008",
  "- [Skip process retrospectives by default for new installations](seeds/SEED-001-install-and-update-open-dough.md#default-skip-process-retrospective) — SEED-001",
  "- [Strengthen architectural review after using the lightweight guidance](seeds/SEED-004-extract-and-adopt-project-guidance.md#proudly-found-elsewhere-design) — SEED-004",
];

export const takenEntry =
  "- [Update the product backlog without hand-editing the shared list](seeds/SEED-008-worktree-branch-trunk-sync.md#script-product-backlog-list-updates) — SEED-008 ([plan](quick/057-script-product-backlog/PLAN.md))";

// The identity each line above carries, spelled out rather than derived, so a
// test naming one of them does not take the product's own derivation as its
// expectation. Every operation names work this way, so they live beside the
// lines they belong to instead of being respelled per test file.
export const trunkQueue = "SEED-008#same-machine-merge-queue";
export const skipRetrospective = "SEED-001#default-skip-process-retrospective";
export const architecture = "SEED-004#proudly-found-elsewhere-design";
export const takenStory = "SEED-008#script-product-backlog-list-updates";

export const backlog = `# Product backlog

## Near-future direction

Enable agents to execute stories in parallel while collaborating through
trunk-based development, with each agent working in its own Git worktree.

## Taken

${takenEntry}

## Backlog list

${queued.join("\n")}
`;

export const added = {
  identity: "SEED-002#publish-the-release-notes",
  title: "Publish the release notes with the tagged release",
  link: "seeds/SEED-002-release-the-guidance.md#publish-the-release-notes",
};
export const addedLine = `- [${added.title}](${added.link}) — SEED-002`;

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

// How many times a document holds `needle`, for the tests that establish an
// entry is listed once, or not at all, rather than merely present or absent.
export function occurrences(text, needle) {
  return text.split(needle).length - 1;
}

// The backlog with the added entry at `index` places into the queue.
export function withEntry(index) {
  const lines = backlog.split("\n");
  const at = lines.indexOf(queued[0]) + index;
  lines.splice(at, 0, addedLine);
  return lines.join("\n");
}
