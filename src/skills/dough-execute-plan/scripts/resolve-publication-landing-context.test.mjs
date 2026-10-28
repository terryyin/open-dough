// Publication resolves an omitted landingContext from an open first-landing
// expectation; an explicit path still wins; a mismatched branch stays clear.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { plantFirstLandingExpectation } from "./first-landing-expectation.mjs";
import { managementContext } from "./publication-git.mjs";
import { resolvePublicationLandingContext } from "./resolve-publication-landing-context.mjs";

async function gitWorkspace(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), "resolve-landing-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const workspace = path.join(root, "work");
  await mkdir(workspace, { recursive: true });
  execFileSync("git", ["init", "-b", "main", workspace], { stdio: "ignore" });
  const repository = await managementContext(workspace);
  const reporting = path.join(root, "reporting");
  await mkdir(reporting, { recursive: true });
  const landingContext = path.join(reporting, "landing-context.json");
  await writeFile(landingContext, "{}\n");
  return {
    repository,
    workspace,
    branch: "claude/story-a",
    landingContext,
    otherContext: path.join(reporting, "other-landing-context.json"),
  };
}

test("publication resolves an open expectation when landingContext is omitted, and an explicit path still wins", async (t) => {
  const { repository, workspace, branch, landingContext, otherContext } =
    await gitWorkspace(t);
  await writeFile(otherContext, "{}\n");
  assert.equal(
    await resolvePublicationLandingContext({ workspace, branch }),
    undefined,
  );
  await plantFirstLandingExpectation({
    repository,
    workspace,
    branch,
    landingContext,
  });
  assert.equal(
    await resolvePublicationLandingContext({ workspace, branch }),
    landingContext,
  );
  assert.equal(
    await resolvePublicationLandingContext({
      landingContext: otherContext,
      workspace,
      branch,
    }),
    otherContext,
  );
  assert.equal(
    await resolvePublicationLandingContext({
      workspace,
      branch: "other/branch",
    }),
    undefined,
  );
});
