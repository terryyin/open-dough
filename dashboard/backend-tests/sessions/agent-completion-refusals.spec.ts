// A completion report refused for another launch, or as malformed or
// cross-site, keeps the message the launch's installed reporting script
// recorded earlier. The script runs in process; its one request reaches
// production completion admission and delivery over a private machine home.
import { writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { keptSession } from "../../server/launchRecordStore.ts";
import { completionReceiptSchema } from "../../src/completionReport.ts";
import {
  keptReportingLaunch,
  reportingHome,
  reportInstalled,
} from "../support/installedReporting.ts";

const origin = "http://127.0.0.1:4173";

test("refused deliveries keep the earlier completion message", async () => {
  const { root, workspace } = reportingHome("dough-completion-refusals");
  const accepted = makeMe.anAcceptedAttempt
    .adHoc({ host: "codex", instruction: "Complete bounded work." })
    .reportingTo(origin)
    .please();
  const { record, script, argv } = await keptReportingLaunch(
    workspace,
    accepted,
    (reporting) =>
      makeMe.aLaunchRecord
        .adHoc({
          instruction: "Complete bounded work.",
          title: "Complete bounded work",
        })
        .inCodexSession({ sessionId: "reporting-thread" })
        .reportingThrough(reporting)
        .please(),
  );
  const completion = async () =>
    (await keptSession("open-dough", record.session))?.completion;
  const earlier = "Publication finished. Reminder: inspect the migration.";
  const messageFile = path.join(root, "attention.txt");
  writeFileSync(messageFile, earlier);
  const reported = vi.fn();
  const receipt = completionReceiptSchema.parse(
    await reportInstalled(
      script,
      [...argv, "--outcome", "completed", "--message-file", messageFile],
      { reported },
    ),
  );
  expect(receipt).toMatchObject({ outcome: "completed", message: earlier });
  expect(await completion()).toMatchObject({
    outcome: "completed",
    message: earlier,
  });

  const valid = makeMe.aCompletionSubmission
    .reportingFor({ host: "codex", reference: accepted.id })
    .withOutcome("unfinished")
    .saying("Required retirement is held; resolve ownership.")
    .please();
  const refused = (body: unknown, from = origin) =>
    fetch(`${origin}/__agent-launch/completion`, {
      method: "POST",
      headers: { Origin: from, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  for (const [change, from, status] of [
    [{ source: "unknown-project" }, origin, 404],
    [{ source: "doughnut" }, origin, 404],
    [{ host: "claude" }, origin, 404],
    [{ reference: "00000000-0000-4000-8000-000000000000" }, origin, 404],
    [{ session: "another-session" }, origin, 409],
    [{ message: "" }, origin, 400],
    [{ outcome: "quiet" }, origin, 400],
    [{ extra: true }, origin, 400],
    [{}, "https://elsewhere.test", 403],
  ] as const) {
    expect((await refused({ ...valid, ...change }, from)).status).toBe(status);
    expect(await completion()).toMatchObject({
      outcome: "completed",
      message: earlier,
    });
  }
  // Only the accepted report reached the native Done collaborator.
  expect(reported.mock.calls).toEqual([["open-dough", receipt]]);
});
