// Trunk Mode closure fixture: the managed-delivery fixture's execution
// worktree with story wrap-up and Dough Land installed beside execute-plan,
// a real observer mailbox, and a controlled CI adapter. `finish` runs as the
// agent runs it: the installed command in a child process.
import { execFile } from "node:child_process";
import { appendFileSync, cpSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { publishJson } from "../../dough-execute-plan/scripts/ci-mailbox-json-file.mjs";
import {
  createManagedFixture,
  git,
} from "../../dough-execute-plan/scripts/execution-increment-managed-delivery-test-fixtures.mjs";
import { revParse } from "../../dough-execute-plan/scripts/publication-test-fixtures.mjs";

const skills = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
export const session = "trunk-closure-coordinator";

function install(fixture, name) {
  const source = join(skills, name);
  const skill = join(fixture.execution, ".claude/skills", name);
  mkdirSync(skill, { recursive: true });
  cpSync(source, skill, {
    recursive: true,
    filter: (path) => !/test|fixture/.test(path.slice(source.length)),
  });
}

// The execution worktree stays clean: installed skills and the project's CI
// configuration are ignored as a project would commit or ignore them.
export async function createTrunkClosureFixture(t) {
  const fixture = await createManagedFixture({ platforms: [".claude"] });
  t.after(fixture.cleanup);
  install(fixture, "dough-story-wrap-up");
  install(fixture, "dough-land");
  const common = (
    await git(
      fixture.execution,
      "rev-parse",
      "--path-format=absolute",
      "--git-common-dir",
    )
  ).stdout.trim();
  appendFileSync(
    join(common, "info/exclude"),
    ".claude/\n.planning/open-dough.json\n",
  );
  fixture.env = { ...fixture.env, CLAUDE_CODE_SESSION_ID: session };
  return fixture;
}

// Commits the final closure in the execution worktree and returns its SHA.
export async function commitFinalClosure(fixture, file = "closure.txt") {
  writeFileSync(join(fixture.execution, file), "final closure\n");
  await git(fixture.execution, "add", file);
  await git(fixture.execution, "commit", "-m", "final closure");
  return revParse(fixture.execution, "exec/story");
}

// CI reports `outcome` for each SHA once the observer discovers attempts.
export function releaseCi(fixture, outcomes) {
  publishJson(fixture.fixture, "release.json", {
    attempts: Object.entries(outcomes).map(([sha, outcome], index) => ({
      runId: `run:opaque/closure-${index}`,
      attemptId: `attempt:opaque/closure-${index}`,
      sha,
      outcome,
      url: `https://ci.example.test/run/closure-${index}`,
    })),
  });
}

// Runs the installed `finish`; the observer it reports stops at teardown.
export async function finishThroughCli(
  fixture,
  {
    beforeCleanup,
    final,
    base = beforeCleanup,
    targetRef = "refs/heads/main",
    extra = [],
    env = fixture.env,
  },
) {
  const script = join(
    fixture.execution,
    ".claude/skills/dough-story-wrap-up/scripts/trunk-closure.mjs",
  );
  const args = [
    "finish",
    "--workspace",
    fixture.execution,
    "--branch",
    "exec/story",
    "--before-cleanup",
    beforeCleanup,
    "--final",
    final,
    "--previously-published-base",
    base,
    "--target-ref",
    targetRef,
    "--repo",
    "owner/project",
    "--host",
    "claude",
    ...extra,
  ];
  const { stdout, stderr, code } = await promisify(execFile)(
    process.execPath,
    [script, ...args],
    { cwd: fixture.fixture, env },
  ).catch((error) => error);
  const result = stdout.trim()
    ? JSON.parse(stdout.trim().split("\n").at(-1))
    : null;
  fixture.stopAtTeardown(result?.observation?.directory);
  return { result, stderr, code: code ?? 0 };
}

export async function branchSha(fixture, branch = "exec/story") {
  return (
    await git(fixture.integration, "rev-parse", "--verify", "-q", branch).catch(
      () => ({ stdout: "" }),
    )
  ).stdout.trim();
}
