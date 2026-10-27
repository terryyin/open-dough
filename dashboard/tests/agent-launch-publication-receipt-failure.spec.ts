// The real installed command publishes, then origin denies receipt writes.
// Only that filesystem precondition is supplied; the page observes the stop
// and continues the same HTTP attempt after the directory is repaired.
import { chmodSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect } from "./dashboardTest.ts";
import { attempts, keptStarts } from "./agentLaunchBoundary.ts";
import { storyCardSessions } from "./dashboardPage.ts";
import { expectProtected, openStories, test } from "./responsiveStart.ts";
import { recoveryOf, subject, worktrees } from "./responsiveRecovery.ts";
import { reloadUntilRead } from "./pageRequestNotes.ts";
import { queuedIdentity } from "./support/startOrigin.ts";

test.use({ projectFolders: ["open-dough"], launchTimeoutMs: 60_000 });

for (const workflow of ["execution", "refinement"] as const) {
  test(`${workflow} publication receipt failure stops before native launch and Continue reuses its claim`, async ({
    page,
    dashboard,
    origin,
  }) => {
    test.setTimeout(150_000);
    const { story, takenStory } = await openStories(page, origin);
    const directory = path.join(dashboard.home, ".open-dough/dashboard");
    const hook = path.join(origin.origin, "hooks/post-receive");
    writeFileSync(hook, `#!/bin/sh\nchmod 0555 '${directory}'\n`);
    chmodSync(hook, 0o755);
    try {
      await story.getByRole("button", { name: `Start ${workflow}` }).click();
      await page
        .getByRole("dialog")
        .getByRole("button", { name: "Start", exact: true })
        .click();
      await expect(page.getByRole("dialog")).toBeHidden();
      await expect
        .poll(async () => (await attempts(dashboard))[0]?.outcome?.kind, {
          timeout: 60_000,
        })
        .toBe("failed");
      const [stopped] = await attempts(dashboard);
      const [profile] = await origin.takenProfiles();
      const published = (await origin.originGit("rev-parse", "main")).trim();
      const assignment =
        workflow === "execution"
          ? `Taken by ${String(profile?.["agent"])}`
          : `Preparing as ${String(profile?.["agent"])}`;
      const workspace = "~/git/open-dough/.worktrees/story-a";
      const prefix = `Publication succeeded (${assignment}, workspace ${workspace}), but the receipt could not be recorded in ~/.open-dough/dashboard/launch-attempts.json:`;
      expect(stopped).toMatchObject({
        request: { identity: queuedIdentity, workflow },
        running: false,
        publication: { kind: "published", revision: published },
        outcome: {
          kind: "failed",
          reason: "unrecorded",
          explanation: expect.stringContaining(prefix),
        },
      });
      expect(stopped?.worker).toBeUndefined();
      expect(stopped?.slowSince).toBeUndefined();
      if (stopped?.outcome?.kind !== "failed")
        throw new Error("Missing recording stop");
      expect(stopped.outcome.explanation).toContain("EACCES");
      expect(stopped.outcome.explanation).toContain(
        "Repair the file, then Continue; nothing more was started.",
      );
      expect(
        readFileSync(path.join(directory, "launch-attempts.json"), "utf8"),
      ).not.toContain('"outcome"');
      expect(dashboard.claudeLaunchCalls()).toEqual([]);
      expect(await origin.takenProfiles()).toHaveLength(1);
      expect(worktrees(origin)).toEqual(["story-a"]);
      expect(await keptStarts(dashboard)).toEqual([
        expect.objectContaining({
          identity: queuedIdentity,
          workflow,
          workspace,
          branch: "claude/story-a",
        }),
      ]);
      const card = workflow === "execution" ? takenStory : story;
      const recovery = recoveryOf(page);
      await expectProtected(card);
      await expect(card.locator(".launch-problem")).toHaveText(
        `Launch failed: ${stopped.outcome.explanation}`,
      );
      await expect(card).toContainText(
        "published its assignment, but its receipt could not be recorded, so no session was started",
      );
      await expect(recovery).toContainText(stopped.outcome.explanation);
      await expect(recovery).not.toContainText(
        "whether its session or published assignment exists",
      );
      await expect(recovery).not.toContainText(
        "Check claude agents before continuing",
      );
      const continueButton = recovery.getByRole("button", {
        name: `Continue ${workflow} start of ${subject}`,
      });
      await expect(continueButton).toBeEnabled();
      await expect(continueButton).not.toHaveAttribute("aria-describedby");
      // A fresh page reads the owning server's conservative memory answer too.
      await reloadUntilRead(page);
      await expect(card.locator(".launch-problem")).toHaveText(
        `Launch failed: ${stopped.outcome.explanation}`,
      );
      chmodSync(directory, 0o755);
      chmodSync(hook, 0o644);
      await continueButton.click();
      await expect(storyCardSessions(card)).toHaveCount(1, { timeout: 60_000 });
      await expect(recovery).toHaveCount(0);
      expect(await attempts(dashboard)).toEqual([
        expect.objectContaining({
          id: stopped.id,
          acceptedAt: stopped.acceptedAt,
          publication: expect.objectContaining({ kind: "published" }),
          outcome: expect.objectContaining({ kind: "launched" }),
        }),
      ]);
      expect(await origin.takenProfiles()).toEqual([profile]);
      expect((await origin.originGit("rev-parse", "main")).trim()).toBe(
        published,
      );
      expect(worktrees(origin)).toEqual(["story-a"]);
      expect(dashboard.claudeLaunchCalls()).toHaveLength(1);
      expect(await keptStarts(dashboard)).toEqual([]);
      expect(
        readFileSync(path.join(directory, "launch-attempts.json"), "utf8"),
      ).toContain('"kind": "launched"');
    } finally {
      chmodSync(directory, 0o755);
      chmodSync(hook, 0o644);
    }
  });
}
