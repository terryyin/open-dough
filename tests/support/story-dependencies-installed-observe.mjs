// Installed runtime proof. Supplied paths are in the disposable installed
// project; no source skill imports are available or used here.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const [scripts, project, scratch] = process.argv.slice(2);
const cli = join(scripts, "product-backlog.mjs");
const link = "seeds/SEED-PAYLOAD-STATE.md#first-story";
const call = (...args) =>
  execFileSync(process.execPath, [cli, ...args], {
    cwd: project,
    encoding: "utf8",
  });
const read = () => JSON.parse(call("read-dependencies", "--link", link));
const input = join(scratch, "installed-dependency.json");
assert.deepEqual(read().blocking, []);
writeFileSync(
  input,
  JSON.stringify({
    supplier: {
      identity: "SEED-PAYLOAD#second-story",
      href: "seeds/SEED-PAYLOAD-STATE.md#second-story",
    },
    implementation: "Installed shared contract",
    rationale:
      "The shared contract must be integrated before this consumer can validate its outcome; normal reconciliation cannot create that missing contract.",
    condition: "The supplier contract is completed and integrated.",
    state: "waiting",
  }),
);
call(
  "update-dependency",
  "--identity",
  "SEED-PAYLOAD#first-story",
  "--link",
  link,
  "--dependency-file",
  input,
  "--expect-dependencies",
  read().basis,
);
assert.equal(read().blocking[0].supplier.identity, "SEED-PAYLOAD#second-story");
assert.equal(
  JSON.parse(call("read-state", "--link", link)).assessment.changedSinceReview,
  true,
);
const git = (...args) =>
  execFileSync("git", args, {
    cwd: project,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
const origin = join(scratch, "installed-dependencies.git");
git("init", "--quiet", "--bare", "-b", "main", origin);
git("add", ".planning");
git("commit", "--quiet", "-m", "Publish installed prerequisite");
git("remote", "add", "dependencies-origin", origin);
git("push", "--quiet", "dependencies-origin", "main");
const before = git("rev-parse", "HEAD");
const start = resolve(
  scripts,
  "../../dough-execute-plan/scripts/execution-start.mjs",
);
for (const oneShot of [false, true]) {
  const workspace = join(
    scratch,
    oneShot ? "installed-one-shot" : "installed-ordinary",
  );
  let receipt;
  assert.throws(() => {
    try {
      execFileSync(
        process.execPath,
        [
          start,
          "start",
          "--integration",
          project,
          "--workspace",
          workspace,
          "--branch",
          "exec/installed-dependency",
          "--identity",
          "SEED-PAYLOAD#first-story",
          "--publisher-id",
          "installed-dependency-proof",
          "--mode",
          "story-branch",
          "--remote",
          "dependencies-origin",
          "--target",
          "main",
          "--push-authorized",
          "--workspace-authorized",
          ...(oneShot ? ["--one-shot"] : []),
        ],
        { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
      );
    } catch (error) {
      receipt = JSON.parse(error.stdout);
      throw error;
    }
  });
  assert.equal(receipt.status, "source-refused");
  assert.match(
    receipt.error,
    /execution is blocked by SEED-PAYLOAD#second-story/,
  );
  assert.equal(existsSync(workspace), false);
  assert.equal(git("--git-dir", origin, "rev-parse", "main"), before);
  assert.equal(
    git(
      "--git-dir",
      origin,
      "ls-tree",
      "--name-only",
      "main",
      ".planning/agents/",
    ),
    "",
  );
}

// Installed-only completion/discovery imports run with source unavailable.
const discovered = JSON.parse(
  call(
    "discover-consumers",
    "--supplier-identity",
    "SEED-PAYLOAD#second-story",
  ),
);
assert.equal(
  discovered.consumers.some(
    (entry) => entry.identity === "SEED-PAYLOAD#first-story",
  ),
  true,
);
assert.deepEqual(discovered.problems, []);
writeFileSync(
  join(project, ".planning/installed-outcome.md"),
  "Selected installed supplier contract outcome was observed.\n",
);
git("add", ".planning/installed-outcome.md");
git("commit", "--quiet", "-m", "Preserve installed supplier completion proof");
git("push", "--quiet", "dependencies-origin", "main");
const evidence = git("rev-parse", "HEAD");
const original = read().dependencies[0];
writeFileSync(
  input,
  JSON.stringify({
    ...original,
    state: "satisfied",
    resolution: {
      revision: evidence,
      path: ".planning/seeds/SEED-PAYLOAD-STATE.md#second-story",
      summary:
        "Observed supplier contract directly fulfills the selected condition.",
    },
  }),
);
call(
  "resolve-dependency",
  "--identity",
  "SEED-PAYLOAD#first-story",
  "--link",
  link,
  "--dependency-file",
  input,
  "--expect-dependencies",
  read().basis,
  "--remote",
  "dependencies-origin",
  "--target",
  "main",
  "--accepted-revision",
  evidence,
  "--planless-complete",
  "--completion-file",
  ".planning/installed-outcome.md",
);
assert.equal(read().blocking.length, 0);
const satisfied = read();
call(
  "resolve-dependency",
  "--identity",
  "SEED-PAYLOAD#first-story",
  "--link",
  link,
  "--dependency-file",
  input,
  "--expect-dependencies",
  satisfied.basis,
  "--remote",
  "dependencies-origin",
  "--target",
  "main",
  "--accepted-revision",
  evidence,
  "--planless-complete",
  "--completion-file",
  ".planning/installed-outcome.md",
);
assert.deepEqual(read(), satisfied);
assert.match(
  satisfied.dependencies[0].resolution.summary,
  new RegExp(evidence),
);
