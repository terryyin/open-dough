import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import {
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { makeMe } from "./makeMe.mjs";
import { materializeLocalCheckout } from "./repository-fixture.mjs";
import { changedForRefactoring } from "../../src/skills/dough-execute-plan/scripts/git-changes.mjs";

const command = fileURLToPath(
  new URL(
    "../../src/skills/dough-execute-plan/scripts/test-entry-rules.mjs",
    import.meta.url,
  ),
);
const git = (root, args) =>
  execFileSync("git", ["-C", root, ...args], { encoding: "utf8" });
const put = (root, path, contents) => {
  mkdirSync(dirname(join(root, path)), { recursive: true });
  writeFileSync(join(root, path), contents);
};

async function project(t, files, later = []) {
  const settings = makeMe.intentSettings
    .withLocations(
      makeMe.anIntentLocation
        .at("browser")
        .ofKind("javascript", ["**/*.spec.mjs"])
        .withRules({ pageObjects: true })
        .please(),
      makeMe.anIntentLocation
        .at("legacy")
        .ofKind("javascript", ["**/*.spec.mjs"])
        .withRules({ makeMe: true })
        .please(),
    )
    .please();
  let repository = makeMe.aRepository.withRevision("base", {
    backlog: null,
    files: { ...files, ".planning/open-dough.json": JSON.stringify(settings) },
  });
  for (const revision of later)
    repository = repository.withRevision(revision.name, revision);
  return materializeLocalCheckout(t, repository.please());
}

function selected(root, ...extra) {
  const result = spawnSync(
    process.execPath,
    [command, "--project", root, "--changed", ...extra],
    { encoding: "utf8" },
  );
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

const pages = (path) => ({ path, makeMe: false, pageObjects: true });
const data = (path) => ({ path, makeMe: true, pageObjects: false });
const off = (path) => ({ path, makeMe: false, pageObjects: false });

test("the public changed command includes staged, unstaged and untracked sources independently using file membership", async (t) => {
  const { integration: root } = await project(t, {
    "browser/staged.spec.mjs": "original\n",
    "browser/unstaged.spec.mjs": "original\n",
    "browser/not-a-test.mjs": "production\n",
    "legacy/data.spec.mjs": "original\n",
  });
  put(root, "browser/staged.spec.mjs", "staged\n");
  git(root, ["add", "browser/staged.spec.mjs"]);
  // Reverse only the worktree: diff HEAD alone misses this staged source.
  put(root, "browser/staged.spec.mjs", "original\n");
  put(root, "browser/unstaged.spec.mjs", "unstaged\n");
  put(root, "browser/new.spec.mjs", "untracked\n");
  put(root, "browser/not-a-test.mjs", "changed production\n");
  put(root, "legacy/data.spec.mjs", "changed data\n");
  assert.deepEqual(selected(root), {
    status: "resolved",
    sources: [
      pages("browser/new.spec.mjs"),
      off("browser/not-a-test.mjs"),
      pages("browser/staged.spec.mjs"),
      pages("browser/unstaged.spec.mjs"),
      data("legacy/data.spec.mjs"),
    ],
  });
});

test("moves discover both paths but current membership determines selection, including a staged move into a custom test extension", async (t) => {
  const { integration: root } = await project(t, {
    "legacy/into.spec.mjs": "moving in\n",
    "browser/out.spec.mjs": "moving out\n",
  });
  const settings = makeMe.intentSettings
    .withLocations(
      makeMe.anIntentLocation
        .at("browser")
        .withSources({ include: ["**/*.check"] })
        .withRules({ pageObjects: true })
        .please(),
      makeMe.anIntentLocation
        .at("legacy")
        .ofKind("javascript", ["**/*.spec.mjs"])
        .withRules({ pageObjects: false })
        .please(),
    )
    .please();
  put(root, ".planning/open-dough.json", JSON.stringify(settings));
  git(root, ["add", ".planning/open-dough.json"]);
  git(root, ["commit", "-m", "select custom tests"]);
  git(root, ["mv", "legacy/into.spec.mjs", "browser/into.check"]);
  git(root, ["mv", "browser/out.spec.mjs", "legacy/out.spec.mjs"]);
  assert.deepEqual(changedForRefactoring(git, root), [
    "browser/into.check",
    "browser/out.spec.mjs",
    "legacy/into.spec.mjs",
    "legacy/out.spec.mjs",
  ]);
  assert.deepEqual(selected(root).sources, [
    pages("browser/into.check"),
    off("legacy/out.spec.mjs"),
  ]);
});

test("unstaged moves include the untracked destination; deletion and production-only changes invent no conversion", async (t) => {
  const { integration: root } = await project(t, {
    "browser/moved.spec.mjs": "moving\n",
    "browser/deleted.spec.mjs": "deleted\n",
    "browser/code.mjs": "production\n",
  });
  renameSync(
    join(root, "browser/moved.spec.mjs"),
    join(root, "browser/current.spec.mjs"),
  );
  rmSync(join(root, "browser/deleted.spec.mjs"));
  assert.deepEqual(selected(root).sources, [pages("browser/current.spec.mjs")]);
  rmSync(join(root, "browser/current.spec.mjs"));
  assert.deepEqual(selected(root).sources, []);
  put(root, "browser/code.mjs", "changed production\n");
  assert.deepEqual(selected(root).sources, [off("browser/code.mjs")]);
});

test("only supplied committed dispositions join refactor scope, at current paths and current settings", async (t) => {
  const { integration: root, revisions } = await project(
    t,
    {
      "browser/old.spec.mjs": "old\n",
      "browser/unrelated.spec.mjs": "unrelated\n",
      "legacy/into.spec.mjs": "moving\n",
    },
    [
      {
        name: "disposition",
        files: {
          "browser/old.spec.mjs": "accepted repair\n",
          "browser/into.spec.mjs": "moving\n",
        },
        remove: ["legacy/into.spec.mjs"],
      },
      {
        name: "other history",
        files: { "browser/unrelated.spec.mjs": "other work\n" },
      },
    ],
  );
  assert.deepEqual(selected(root).sources, []);
  mkdirSync(join(root, "legacy"), { recursive: true });
  git(root, ["mv", "browser/old.spec.mjs", "legacy/current.spec.mjs"]);
  const result = selected(root, "--committed", revisions.disposition);
  assert.deepEqual(result.sources, [
    pages("browser/into.spec.mjs"),
    data("legacy/current.spec.mjs"),
  ]);
  assert.deepEqual(
    selected(
      root,
      "--committed",
      revisions.disposition,
      "--committed",
      revisions.disposition,
    ),
    result,
  );
});

test("invalid Git scope and unresolved settings cannot appear as a successful opt-out", async (t) => {
  const { integration: root } = await project(t, {
    "browser/a.spec.mjs": "a\n",
  });
  put(root, "browser/a.spec.mjs", "changed\n");
  const args = [command, "--project", root, "--changed"];
  const invalid = spawnSync(
    process.execPath,
    [...args, "--committed", "missing-revision"],
    { encoding: "utf8" },
  );
  assert.equal(invalid.status, 2);
  assert.equal(invalid.stdout, "");
  put(root, ".planning/open-dough.json", "{ malformed");
  const unresolved = spawnSync(process.execPath, args, { encoding: "utf8" });
  assert.equal(unresolved.status, 1);
  assert.deepEqual(JSON.parse(unresolved.stdout), {
    status: "unresolved",
    problem: "malformed",
    sources: [],
  });
  assert.equal(
    readFileSync(join(root, "browser/a.spec.mjs"), "utf8"),
    "changed\n",
  );
});

test("a changed symlink test keeps current source membership while missing or deleted targets require no conversion", async (t) => {
  const { integration: root } = await project(t, {
    "support/scenario.mjs": "export {};\n",
    "browser/.gitkeep": "",
  });
  symlinkSync("../support/scenario.mjs", join(root, "browser/linked.spec.mjs"));
  git(root, ["add", "browser/linked.spec.mjs"]);
  const explicit = spawnSync(
    process.execPath,
    [command, "--project", root, "--source", "browser/linked.spec.mjs"],
    { encoding: "utf8" },
  );
  assert.equal(explicit.status, 0, explicit.stderr);
  assert.deepEqual(JSON.parse(explicit.stdout).sources, [
    pages("browser/linked.spec.mjs"),
  ]);
  assert.deepEqual(selected(root).sources, [pages("browser/linked.spec.mjs")]);
  rmSync(join(root, "support/scenario.mjs"));
  assert.deepEqual(selected(root).sources, []);
  rmSync(join(root, "browser/linked.spec.mjs"));
  assert.deepEqual(selected(root).sources, []);
});
