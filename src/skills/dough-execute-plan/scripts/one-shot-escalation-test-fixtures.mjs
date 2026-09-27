// One-shot escalation journeys: a one-shot workspace holding a grown
// attempt's edits (a modified, an untracked and a deleted file), the story
// the agent drafts for it in the originating checkout, the `start --admit
// --carry` escalation run through the real startup CLI, and observations of
// the workspace bytes, the carried ref and what remote trunk published.
import assert from "node:assert/strict";
import {
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join, relative } from "node:path";
import { git, revParse } from "./publication-test-fixtures.mjs";
import {
  admitArgs,
  listed,
  storySection,
  withFacts,
  writeDraft,
} from "./workspace-publication-admission-fixtures.mjs";
import { startCliResult } from "./workspace-publication-fixtures.mjs";

export const unlisted = {
  identity: "SEED-N#grown",
  link: "seeds/N.md#grown",
  title: "Grown request",
  seedPath: ".planning/seeds/N.md",
  planHref: "../slice-plans/N/PLAN.md",
};

// The one-shot start for an unlisted request in Trunk Mode.
export function startUnlistedOneShot(trunk, name = "grow") {
  return startCliResult(trunk, "trunk", ["--one-shot"], {
    identity: null,
    name,
  });
}

// The attempt's owned edits: a modified tracked file, a new untracked file in
// a new directory, and a deleted tracked file.
export function growAttempt(workspace) {
  writeFileSync(join(workspace, "trunk.txt"), "base\ngrown attempt\n");
  mkdirSync(join(workspace, "feature"), { recursive: true });
  writeFileSync(join(workspace, "feature/new.txt"), "untracked work\n");
  rmSync(join(workspace, ".planning/slice-plans/A/PLAN.md"));
}

// Every file's bytes in the workspace, Git metadata aside.
export function workspaceBytes(workspace) {
  const bytes = {};
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.name === ".git") continue;
      if (entry.isDirectory()) walk(path);
      else bytes[relative(workspace, path)] = readFileSync(path, "utf8");
    }
  };
  walk(workspace);
  return bytes;
}

// The attempt's bytes over the claim `sha`: each file the claim changed as
// the claim wrote it, every other file as the attempt left it.
export async function attemptOverClaim(trunk, attempt, sha) {
  const { stdout } = await git(
    trunk.origin,
    ...["diff", "--name-only", `${sha}^`, sha],
  );
  const bytes = { ...attempt };
  for (const path of stdout.trim().split("\n"))
    bytes[path] = (await git(trunk.origin, "show", `${sha}:${path}`)).stdout;
  return bytes;
}

// The unlisted story, drafted with recorded facts in the originating checkout.
export function draftUnlistedStory(trunk) {
  const { identity, link, title, seedPath } = unlisted;
  const seed = withFacts(
    `---\nid: SEED-N\n---\n\n# Seed N\n\n${storySection("grown", identity, title, "Finish the grown request.")}`,
    link,
    identity,
    "unselected",
  );
  writeDraft(trunk, seedPath, seed);
  return seed;
}

// Runs `start --admit --carry` for the story in the named one-shot workspace.
// A start killed before it reports has no receipt.
export async function escalate(trunk, mode, name, story, options = {}) {
  const { link, title, identity } = story;
  const extra = [...admitArgs(identity, link, title), "--carry"];
  try {
    return await startCliResult(
      trunk,
      mode,
      [...extra, ...(options.extra ?? [])],
      {
        identity: null,
        name,
        env: options.env,
      },
    );
  } catch {
    return { receipt: null };
  }
}

export const carriedRef = (name) => `refs/dough/carried/exec/${name}`;

export async function carriedSha(workspace, name) {
  try {
    return await revParse(workspace, carriedRef(name));
  } catch {
    return undefined;
  }
}

// The workspace sits on `sha` with no pending change.
export async function assertCleanAt(workspace, sha) {
  assert.equal(await revParse(workspace, "HEAD"), sha);
  assert.equal((await git(workspace, "status", "--porcelain")).stdout, "");
}

// Remote trunk at `rev` lists `identity` once, in Taken, and every commit
// since `base` is the one claim naming it.
export async function assertOneClaim(trunk, rev, base, identity) {
  const entries = (await listed(trunk, rev)).filter(
    (entry) => entry.identity === identity,
  );
  assert.deepEqual(
    entries.map((entry) => entry.list),
    ["Taken"],
  );
  const log = (
    await git(
      trunk.origin,
      "log",
      "--format=%(trailers:key=Claim-Identity,valueonly)",
      `${base}..${rev}`,
    )
  ).stdout;
  assert.deepEqual(log.trim().split("\n").filter(Boolean), [identity]);
}

// An environment whose Git kills the startup process once, at the first Git
// command whose arguments match the shell `pattern`: right after that command
// ran, or instead of it when `before`.
export function killOnce(trunk, pattern, { before = false } = {}) {
  const bin = join(trunk.fixture, "bin");
  const marker = join(trunk.fixture, "killed");
  mkdirSync(bin);
  const run = before ? "" : '/usr/bin/git "$@" || exit $?\n    ';
  writeFileSync(
    join(bin, "git"),
    `#!/bin/sh\ncase "$*" in\n  ${pattern})\n    if [ ! -e '${marker}' ]; then\n    touch '${marker}'\n    ${run}kill -9 $PPID\n    exit 1\n    fi ;;\nesac\nexec /usr/bin/git "$@"\n`,
    { mode: 0o755 },
  );
  return { ...process.env, PATH: `${bin}:${process.env.PATH}` };
}

// Kills the startup process right after its first push reaches the remote.
export const killAfterPush = (trunk) => killOnce(trunk, "push*");
