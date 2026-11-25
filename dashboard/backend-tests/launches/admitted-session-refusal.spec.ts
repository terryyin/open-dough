// A Start whose execution checkout publishes to another repository
// than the launched project admits no story there and opens no native session.
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { launch } from "../../test-support/agentLaunchBoundary.ts";
import { expect, test } from "../../test-support/support/preparationPage.ts";

const exec = promisify(execFile);

for (const workspace of ["isolated", "default-checkout"] as const) {
  test(`${workspace} Start on a checkout whose origin is another repository is refused before any native start`, async ({
    dashboard,
    origin,
  }) => {
    const git = (...args: string[]) =>
      exec("git", ["-C", origin.project, ...args]);
    await git(
      "remote",
      "set-url",
      "origin",
      "https://github.com/another-owner/elsewhere.git",
    );
    const before = (await origin.originGit("rev-parse", "main")).trim();
    dashboard.claudeScenario("launched");

    const answer = await launch(
      dashboard,
      makeMe.aLaunchRequest
        .adHoc()
        .withInstruction("Mismatched admission")
        .withPolicy({ workspace, landing: "review" })
        .please(),
    );

    expect(dashboard.claudeLaunchCalls()).toHaveLength(0);
    expect(JSON.parse(answer.body)).toMatchObject({
      kind: "failed",
      explanation: expect.stringContaining(
        "where this story would be published. Nothing was launched.",
      ),
    });
    expect((await origin.originGit("rev-parse", "main")).trim()).toBe(before);
  });
}
