// Incomplete launch-workspace reporting support fails before preparation
// copies; a compatible older install without landing still prepares reporting.
import { cpSync, mkdirSync, mkdtempSync, rmSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "../../tests/support/pageTest.ts";
import {
  IncompleteReportingSupport,
  reportingContext,
} from "../../server/completionReporting.ts";
import { missingReportingSupport } from "../../server/launchWorkspaceReporting.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { repoRoot } from "../../tests/support/repositoryRoot.ts";
import {
  plantIncompleteInstall,
  scriptsOf,
} from "../../tests/support/incompleteReportingInstall.ts";

test.describe("reporting preparation from a launch-workspace install", () => {
  let home: string;
  let previousHome: string | undefined;
  let workspace: string;

  test.beforeEach(() => {
    home = mkdtempSync(path.join(tmpdir(), "dough-reporting-support-"));
    previousHome = process.env["HOME"];
    process.env["HOME"] = path.join(home, "home");
    mkdirSync(process.env["HOME"], { recursive: true });
    workspace = path.join(home, "workspace");
    const scripts = path.join(
      workspace,
      ".claude/skills/dough-execute-plan/scripts",
    );
    mkdirSync(scripts, { recursive: true });
    for (const name of [
      "dashboard-completion.mjs",
      "ci-direct-entry.mjs",
      "dashboard-landing.mjs",
      "first-landing-expectation.mjs",
    ])
      cpSync(
        path.join(
          repoRoot,
          "Distribution/src/skills/dough-execute-plan/scripts",
          name,
        ),
        path.join(scripts, name),
      );
  });

  test.afterEach(() => {
    if (previousHome === undefined) delete process.env["HOME"];
    else process.env["HOME"] = previousHome;
    rmSync(home, { recursive: true, force: true });
  });

  const attempt = () =>
    makeMe.anAcceptedAttempt
      .executing({ identity: "SEED-1#a", title: "Story" })
      .reportingTo("http://127.0.0.1:9")
      .please();

  test("landing present without its sibling helper is incomplete and refuses preparation", async () => {
    const missingPath = plantIncompleteInstall(workspace);
    expect(
      await missingReportingSupport("claude", {
        path: workspace,
        shown: workspace,
      }),
    ).toEqual({
      helper: "first-landing-expectation.mjs",
      path: missingPath,
    });
    await expect(
      reportingContext(attempt(), { path: workspace, shown: workspace }),
    ).rejects.toBeInstanceOf(IncompleteReportingSupport);
  });

  test("a compatible older install without landing still prepares reporting", async () => {
    unlinkSync(path.join(scriptsOf(workspace), "dashboard-landing.mjs"));
    unlinkSync(
      path.join(scriptsOf(workspace), "first-landing-expectation.mjs"),
    );
    expect(
      await missingReportingSupport("claude", {
        path: workspace,
        shown: workspace,
      }),
    ).toBeUndefined();
    const prepared = await reportingContext(attempt(), {
      path: workspace,
      shown: workspace,
    });
    expect(prepared?.reporting.command).toContain("dashboard-completion.mjs");
    expect(prepared?.reporting).not.toHaveProperty("landingContext");
    expect(prepared).not.toHaveProperty("landingRepository");
  });
});
