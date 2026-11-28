// Released Open Dough runs a dashboard preparation start: the queued project's
// origin holds the complete `v0.3.97` installation. Added real boundary beside
// the shared set (../README.md#real-and-substituted): the pinned tag's own
// installer and the installation it writes, in place of this run's
// working-tree skills.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { installedSkillPath } from "../../dashboard/server/launchHosts.ts";
import { nextAcceptedAttemptId } from "../../dashboard/test-support/acceptedAttemptPage.ts";
import { settledOutcome } from "../../dashboard/test-support/acceptedAttempts.ts";
import { startRefinementInCodex } from "../../dashboard/test-support/launchStoryCardPage.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import { repoRoot } from "../../dashboard/test-support/support/repositoryRoot.ts";
import {
  queuedIdentity,
  type StartOrigin,
} from "../../dashboard/test-support/support/startOrigin.ts";
import { publishOrigin } from "../../dashboard/test-support/support/startOriginTest.ts";
import {
  pinnedRelease,
  releaseRevision,
  type ReleasedInstallation,
} from "../../dashboard/test-support/support/taggedInstallation.ts";

// The release a project's installation came from, attached to the case: its
// tag and peeled revision, the installed VERSION, and the installed
// preparation command.
async function recordReleasedInstallation(
  origin: StartOrigin,
  release: ReleasedInstallation,
) {
  const project = { path: origin.project, shown: origin.project };
  const installed = (skill: string, ...parts: string[]) =>
    installedSkillPath("codex", project, skill, ...parts);
  const provenance = {
    tag: release.tag,
    revision: await releaseRevision(repoRoot, release),
    version: readFileSync(installed("dough-update", "VERSION"), "utf8").trim(),
    command: path.relative(
      origin.project,
      installed(
        "dough-story-refinement",
        "scripts",
        "preparation-assignment.mjs",
      ),
    ),
  };
  await test.info().attach("released installation", {
    body: JSON.stringify(provenance, null, 2),
    contentType: "application/json",
  });
  return provenance;
}

// The commit a story workspace's preparation assignment names.
const preparationAssignment = (origin: StartOrigin, slug: string) =>
  execFileSync(
    "git",
    ["rev-parse", "refs/worktree/dough/preparation-assignment"],
    { cwd: path.join(origin.project, ".worktrees", slug), encoding: "utf8" },
  ).trim();

test.use({ preparationHost: "codex", preparationRelease: pinnedRelease });
test("released v0.3.97 installation publishes a Codex preparation started from the dashboard", async ({
  page,
  dashboard,
  origin,
}) => {
  // The released origin is created inside this test's limit. A green CI run
  // finished in 14s; the failing run was still creating that origin at 30s.
  test.setTimeout(60_000);
  const before =
    await test.step("Given the dashboard follows the queued origin holding the released installation", async () => {
      const revision = await publishOrigin(page, origin);
      await page.goto("/");
      return revision;
    });
  await test.step("When the developer starts Story A's refinement in Codex", async () => {
    const acceptance = nextAcceptedAttemptId(page);
    await startRefinementInCodex(page, "Story A");
    await settledOutcome(dashboard, await acceptance);
  });
  await test.step("Then the case records the released installation it ran", async () => {
    const provenance = await recordReleasedInstallation(origin, pinnedRelease);
    expect(provenance).toEqual({
      ...pinnedRelease,
      command:
        ".agents/skills/dough-story-refinement/scripts/preparation-assignment.mjs",
    });
    expect(existsSync(path.join(origin.project, provenance.command))).toBe(
      true,
    );
  });
  await test.step("And its installed command publishes Story A's preparation assignment at origin", async () => {
    const published = (await origin.originGit("rev-parse", "main")).trim();
    expect(published).not.toBe(before);
    expect(preparationAssignment(origin, "story-a")).toBe(published);
  });
  await test.step("And origin shows Story A taken for its Codex preparation", async () => {
    expect(await origin.takenProfiles()).toEqual([
      expect.objectContaining({
        identity: queuedIdentity,
        activity: "preparation",
        host: "codex",
      }),
    ]);
  });
});
