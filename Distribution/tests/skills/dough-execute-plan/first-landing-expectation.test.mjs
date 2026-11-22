// Plant and clear of the durable first-landing expectation beside a repository
// management context, keyed to workspace and branch.
import assert from "node:assert/strict";
import {
  access,
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import {
  clearFirstLandingExpectationForContext,
  firstLandingExpectationPath,
  openFirstLandingExpectation,
  plantFirstLandingExpectation,
} from "../../../src/skills/dough-execute-plan/scripts/first-landing-expectation.mjs";

async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), "first-landing-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const repository = path.join(root, "repo.git");
  const workspace = path.join(root, "worktrees", "story-a");
  const reporting = path.join(root, "reporting");
  const landingContext = path.join(reporting, "landing-context.json");
  await mkdir(repository, { recursive: true });
  await mkdir(workspace, { recursive: true });
  await mkdir(reporting, { recursive: true });
  await writeFile(landingContext, "{}\n");
  return { repository, workspace, branch: "claude/story-a", landingContext };
}

test("planting writes the expectation beside the management context and names the prepared path", async (t) => {
  const { repository, workspace, branch, landingContext } = await fixture(t);
  const file = await plantFirstLandingExpectation({
    repository,
    workspace,
    branch,
    landingContext,
  });
  assert.equal(
    file,
    firstLandingExpectationPath(repository, workspace, branch),
  );
  assert.equal(
    path.dirname(path.dirname(file)),
    path.join(repository, "open-dough"),
  );
  assert.deepEqual(JSON.parse(await readFile(file, "utf8")), {
    workspace,
    branch,
    launches: [{ landingContext }],
  });
  assert.deepEqual(
    await openFirstLandingExpectation({ repository, workspace, branch }),
    {
      workspace,
      branch,
      landingContext,
    },
  );
  // Sidecar beside the prepared context names the management keys for clear.
  assert.deepEqual(
    JSON.parse(
      await readFile(
        path.join(
          path.dirname(landingContext),
          "first-landing-expectation.json",
        ),
        "utf8",
      ),
    ),
    { repository, workspace, branch },
  );
  // The working tree / workspace itself holds no expectation pointer.
  assert.deepEqual(await readdir(workspace), []);
});

test("clearing after the prepared context removes the open expectation", async (t) => {
  const { repository, workspace, branch, landingContext } = await fixture(t);
  await plantFirstLandingExpectation({
    repository,
    workspace,
    branch,
    landingContext,
  });
  await clearFirstLandingExpectationForContext(landingContext);
  assert.equal(
    await openFirstLandingExpectation({ repository, workspace, branch }),
    undefined,
  );
  await assert.rejects(
    access(firstLandingExpectationPath(repository, workspace, branch)),
    { code: "ENOENT" },
  );
});

test("a workspace with no prepared expectation stays clear", async (t) => {
  const { repository, workspace, branch, landingContext } = await fixture(t);
  assert.equal(
    await openFirstLandingExpectation({ repository, workspace, branch }),
    undefined,
  );
  await clearFirstLandingExpectationForContext(landingContext);
  assert.deepEqual(await readdir(repository), []);
});

test("launches sharing a workspace and branch each keep their own open expectation", async (t) => {
  const { repository, workspace, branch, landingContext } = await fixture(t);
  const otherReporting = path.join(path.dirname(repository), "reporting-b");
  await mkdir(otherReporting, { recursive: true });
  const otherContext = path.join(otherReporting, "landing-context.json");
  const keys = { repository, workspace, branch };
  await plantFirstLandingExpectation({ ...keys, landingContext });
  await plantFirstLandingExpectation({ ...keys, landingContext: otherContext });
  const file = firstLandingExpectationPath(repository, workspace, branch);
  assert.deepEqual(JSON.parse(await readFile(file, "utf8")).launches, [
    { landingContext },
    { landingContext: otherContext },
  ]);
  assert.equal(await openFirstLandingExpectation(keys), undefined);
  await clearFirstLandingExpectationForContext(landingContext);
  assert.deepEqual(await openFirstLandingExpectation(keys), {
    workspace,
    branch,
    landingContext: otherContext,
  });
  await clearFirstLandingExpectationForContext(otherContext);
  await assert.rejects(access(file), { code: "ENOENT" });
});

test("a legacy single-record expectation still names its launch", async (t) => {
  const { repository, workspace, branch, landingContext } = await fixture(t);
  const file = firstLandingExpectationPath(repository, workspace, branch);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify({ workspace, branch, landingContext }));
  assert.deepEqual(
    await openFirstLandingExpectation({ repository, workspace, branch }),
    { workspace, branch, landingContext },
  );
});
