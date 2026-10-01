// Installed one-shot refinement commands for tests: one candidate payload
// installation serves every case, so `preparation-assignment.mjs start` and
// the preparation recorder run from the installed payload, never from this
// source tree.
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { after, before } from "node:test";
import { fileURLToPath } from "node:url";
import {
  exec,
  git,
  identityC,
  refineStoryC,
  revParse,
  seedC,
} from "./preparation-assignment-test-fixtures.mjs";

const repository = resolve(
  fileURLToPath(new URL("../../../..", import.meta.url)),
);
const linkC = "seeds/C.md#c";
let installation, assignmentCli, backlogCli;

// Installs the payload before the file's cases and removes it after them.
export function useInstalledPayload() {
  before(async () => {
    installation = realpathSync(mkdtempSync(join(tmpdir(), "one-shot-prep-")));
    await git(installation, "init", "--quiet");
    await exec("bash", [
      join(repository, "install.sh"),
      "--target",
      installation,
      "--source",
      repository,
      "--platform",
      "codex",
    ]);
    const skills = join(installation, ".agents/skills");
    assignmentCli = join(
      skills,
      "dough-story-refinement/scripts/preparation-assignment.mjs",
    );
    backlogCli = join(
      skills,
      "dough-product-backlog/scripts/product-backlog.mjs",
    );
    assert.equal(existsSync(assignmentCli), true);
  });
  after(() => rmSync(installation, { recursive: true, force: true }));
}

async function runJson(args) {
  try {
    const { stdout } = await exec(process.execPath, args);
    return { code: 0, receipt: JSON.parse(stdout) };
  } catch (error) {
    return {
      code: error.code,
      receipt: error.stdout ? JSON.parse(error.stdout) : null,
      stderr: error.stderr,
    };
  }
}

// The installed `start` for story C from the integration checkout; `extra`
// carries `--one-shot` or the assigned start's publication authority.
export function start(
  trunk,
  workspace,
  extra,
  branch,
  { integration = trunk.integration } = {},
) {
  return runJson([
    assignmentCli,
    "start",
    ...(integration === null ? [] : ["--integration", integration]),
    "--workspace",
    workspace,
    ...(branch ? ["--branch", branch] : []),
    "--identity",
    identityC,
    "--remote",
    "origin",
    "--target",
    "main",
    ...extra,
  ]);
}

export const oneShot = (trunk, workspace, branch, extra = []) =>
  start(trunk, workspace, ["--one-shot", ...extra], branch);

// The installed `recheck` of story C from `workspace`.
export const recheck = (workspace) =>
  runJson([
    assignmentCli,
    "recheck",
    "--workspace",
    workspace,
    "--identity",
    identityC,
    "--remote",
    "origin",
    "--target",
    "main",
  ]);

// The installed `recheck` as the candidate check a landing runs on each
// fetched trunk tip: its stop, or undefined when it reports `queued`. Each
// receipt is kept in `receipts`.
export const recheckOnFetch =
  (workspace, receipts = []) =>
  async () => {
    const { receipt } = await recheck(workspace);
    receipts.push(receipt);
    if (receipt.ok) return undefined;
    const { status, ownership, error } = receipt;
    return { status, fields: { ownership, error } };
  };

async function recorder(cwd, ...args) {
  const { stdout } = await exec(process.execPath, [backlogCli, ...args], {
    cwd,
  });
  return stdout;
}

// Records story C in `cwd` as refined with an unselected approach; `extra`
// adds an assessment.
export const recordRefined = (cwd, extra = []) =>
  recorder(
    cwd,
    "record-state",
    "--identity",
    identityC,
    "--link",
    linkC,
    "--refinement",
    "refined",
    "--approach",
    "unselected",
    ...extra,
  );

// Records story C in `cwd` as refined and assessed not-ready for `reason`,
// returning the basis the assessment names.
export async function recordNotReady(cwd, reason) {
  await recordRefined(cwd);
  const { basis } = JSON.parse(
    await recorder(cwd, "read-state", "--link", linkC),
  );
  await recordRefined(cwd, [
    "--assessment",
    "not-ready",
    "--reason",
    reason,
    "--expect-document",
    basis.document,
  ]);
  return basis;
}

// The story-state block story C's seed carries at `rev` in `cwd`.
export async function stateBlock(cwd, rev) {
  const seed = (await git(cwd, "show", `${rev}:${seedC}`)).stdout;
  const block = seed.match(/```json dough-story-state\n(.*)\n```/);
  return block && JSON.parse(block[1]);
}

// Every ref the origin holds: unchanged means nothing was pushed.
export const originRefs = async (trunk) =>
  (await git(trunk.origin, "for-each-ref", "--format=%(refname) %(objectname)"))
    .stdout;

// Records not-ready preparation for story C on remote trunk, as an earlier
// preparation would have left it.
export async function publishNotReady(trunk, reason) {
  const { integration } = trunk;
  refineStoryC(integration);
  await recordNotReady(integration, reason);
  await git(integration, "commit", "--quiet", "-am", "record C not-ready");
  await git(integration, "push", "--quiet", "origin", "HEAD:main");
  return revParse(integration, "HEAD");
}
