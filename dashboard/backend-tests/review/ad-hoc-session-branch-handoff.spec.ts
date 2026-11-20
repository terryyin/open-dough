import { realpathSync } from "node:fs";
import { commit } from "../../test-support/support/launchLanding.ts";
import { reportingChild } from "../../test-support/support/completionRecovery.ts";
import { keptRecords } from "../../test-support/support/cursorSessionRecovery.ts";
import { expect, test } from "../../test-support/support/preparationPage.ts";
import { branchEntryCommand } from "../../test-support/support/reportingInputAssertions.ts";
import { launched } from "../../test-support/support/startSessionLandingCapture.ts";
import { git } from "../../test-support/support/storyReviewWorktree.ts";

test.use({ serverMode: "boundary" });

test("the launch command binds the original checkout's own branch", async ({
  dashboard,
  origin,
}) => {
  const { record, sent } = await launched(dashboard, {
    instruction: "Continue the draft",
  });
  const workspace = realpathSync(origin.project);
  git(workspace, "switch", "--quiet", "-c", "draft");
  const entered = commit(workspace, "prior-commit.txt");
  const command = branchEntryCommand(sent);
  if (command === undefined)
    throw new Error("No branch entry command in launch input.");

  const accepted = await reportingChild(command, workspace);
  expect(accepted.ok, `${accepted.stderr}\n${accepted.stdout}`).toBe(true);
  const answer = JSON.parse(accepted.stdout) as { branchEntry: unknown };
  expect(answer).toMatchObject({
    session: record.session.sessionId,
    branchEntry: { workspace, branch: "draft", committedTip: entered },
  });
  const stored = keptRecords(dashboard.home).find(
    (each) => each.session.sessionId === record.session.sessionId,
  );
  expect(stored?.branchEntry).toEqual(answer.branchEntry);
});
