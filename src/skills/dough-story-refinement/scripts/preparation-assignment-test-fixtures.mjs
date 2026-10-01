// Disposable trunk for preparation-assignment journeys. Fixtures supply only
// what exists before preparation starts: a queued story to prepare, other
// developers' assignments, the owned workspace the exploration lifecycle
// creates, and remote contention. The announcement, its release, and its
// abandonment are made by the production CLI, never here.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  agentIdentity,
  renderAgentProfile,
} from "../../dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import {
  exec,
  git,
  lsRemoteSha,
  revParse,
} from "../../dough-execute-plan/scripts/publication-test-fixtures.mjs";
import { createQueuedTrunk } from "../../dough-execute-plan/scripts/workspace-publication-fixtures.mjs";
import {
  coAuthors,
  developer,
} from "../../dough-execute-plan/scripts/workspace-publication-startup-test-fixtures.mjs";

export { exec, git, lsRemoteSha, revParse };
export {
  startPreparation,
  continuePreparation,
  abandonPreparation,
  abandonLostPreparation,
  releasePreparation,
} from "./preparation-assignment-cli-fixtures.mjs";

export const backlogCli = fileURLToPath(
  new URL(
    "../../dough-product-backlog/scripts/product-backlog.mjs",
    import.meta.url,
  ),
);

export const backlogFile = ".planning/PRODUCT-BACKLOG.md";
export const identityC = "SEED-C#c";
export const seedC = ".planning/seeds/C.md";
export const planC = ".planning/slice-plans/C/PLAN.md";

export const profileOf = (name) => `.planning/${agentIdentity(name).path}`;

// Queued trunk (stories A and B from the startup fixture) plus story C, queued
// last and not yet refined: the story preparation will take up. `options`
// pass through to the queued trunk, such as its `parent` directory.
export async function createPreparationTrunk(options = {}) {
  const trunk = await createQueuedTrunk(options);
  const { integration } = trunk;
  writeFileSync(
    join(integration, seedC),
    '---\nid: SEED-C\n---\n\n# Seed C\n\n<a id="c"></a>\n\n### Story C\n\n**Identity:** SEED-C#c\n\nRough idea for C.\n',
  );
  await exec(
    process.execPath,
    [
      backlogCli,
      "add",
      "--identity",
      identityC,
      "--title",
      "Story C",
      "--link",
      "seeds/C.md#c",
      "--position",
      "last",
    ],
    { cwd: integration },
  );
  await git(integration, "add", ".planning");
  await git(integration, "commit", "--quiet", "-m", "queue story C");
  await git(integration, "push", "--quiet", "origin", "main");
  return { ...trunk, trunkSha: await revParse(integration, "HEAD") };
}

// Another developer's assignment, already published on remote trunk.
export async function publishAssignment(trunk, name, facts) {
  const { integration } = trunk;
  mkdirSync(join(integration, ".planning/agents"), { recursive: true });
  writeFileSync(
    join(integration, profileOf(name)),
    renderAgentProfile({ name, ...facts }),
  );
  await git(integration, "add", profileOf(name));
  await git(integration, "commit", "--quiet", "-m", `assign ${name}`);
  await git(integration, "push", "--quiet", "origin", "HEAD:main");
}

// The owned preparation workspace, created from the verified trunk revision
// as the exploration-workspace lifecycle does.
export async function createWorkspace(trunk, name) {
  const workspace = join(trunk.fixture, `prep-${name}`);
  await git(trunk.integration, "fetch", "--quiet", "origin");
  await git(
    trunk.integration,
    "worktree",
    "add",
    "--quiet",
    "-b",
    `prep/${name}`,
    workspace,
    "origin/main",
  );
  return { workspace, branch: `prep/${name}` };
}

// Runs the canonical preparation recorder in `cwd`.
export async function recorder(cwd, ...args) {
  const { stdout } = await exec(process.execPath, [backlogCli, ...args], {
    cwd,
  });
  return stdout;
}

export async function remoteFile(trunk, rev, path) {
  try {
    return (await git(trunk.origin, "show", `${rev}:${path}`)).stdout;
  } catch {
    return null;
  }
}

export async function remoteChanges(trunk, rev) {
  return (
    await git(trunk.origin, "show", "--name-status", "--format=", rev)
  ).stdout
    .trim()
    .split("\n");
}

// Who a published commit names: its author and committer, then each
// co-author it credits.
export const remoteCredit = async (trunk, rev) => [
  (
    await git(trunk.origin, "log", "-1", "--format=%an <%ae>|%cn <%ce>", rev)
  ).stdout.trim(),
  await coAuthors(trunk.origin, rev),
];

// Yui-chan authors; the configured developer commits and is credited.
export const yuiCredited = [
  `Yui-chan <yui-chan@example.org>|${developer}`,
  developer,
];

export async function remoteProfileNames(trunk, rev = "main") {
  const { stdout } = await git(
    trunk.origin,
    "ls-tree",
    "--name-only",
    rev,
    "--",
    ".planning/agents/",
  );
  return stdout.trim().split("\n").filter(Boolean);
}

export const read = (directory, path) =>
  readFileSync(join(directory, path), "utf8");

// Refinement's write: goal, scope, and key examples in story C's seed.
export function refineStoryC(workspace) {
  writeFileSync(
    join(workspace, seedC),
    read(workspace, seedC).replace(
      "Rough idea for C.\n",
      "#### Goal\n\nC is useful.\n\n#### Scope\n\n- One thing.\n\n#### Key examples\n\n1. It works.\n",
    ),
  );
}

// Planning's write: an executable plan for story C.
export function planStoryC(workspace) {
  mkdirSync(join(workspace, ".planning/slice-plans/C"), { recursive: true });
  writeFileSync(
    join(workspace, planC),
    "# Story C plan\n\n### 1. Do C\n\nType: Behavior\nStatus: planned\n",
  );
}
