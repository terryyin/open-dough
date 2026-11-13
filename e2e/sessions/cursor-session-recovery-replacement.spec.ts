// Recover replaces a cannot-load chat on the same launch: create-chat yields
// a new id, the continuation targets the replacement, and completion binds
// only to that recorded session.
import { cursorCannotLoadChat } from "../../dashboard/src/cursorCannotLoad.ts";
import type { LaunchRecord } from "../../dashboard/src/launchRecord.ts";
import { recordsOf } from "../../dashboard/tests/agentLaunchBoundary.ts";
import { parts } from "../../dashboard/tests/dashboardPage.ts";
import { expectNormalizedReading } from "../../dashboard/tests/support/cursorSessionReading.ts";
import {
  endHeldClient,
  keptRecords,
  startCursorExecution,
} from "../../dashboard/tests/support/cursorSessionRecovery.ts";
import { expect, test } from "../../dashboard/tests/support/cursorStart.ts";
import { postCompletion } from "../../dashboard/tests/support/completionRecovery.ts";
import { queuedIdentity } from "../../dashboard/tests/support/startOrigin.ts";
import { makeMe } from "../../tests/support/makeMe.mjs";

test("cannot-load resume replaces the chat on the same launch", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  await startCursorExecution(page, origin, cursor, dashboard.home);
  const [before] = (await recordsOf(dashboard, "open-dough")) as LaunchRecord[];
  expect(before?.firstInput?.state).toBe("confirmed");
  if (before?.session.host !== "cursor") throw new Error("Missing Cursor.");
  const oldId = before.session.sessionId;
  const originalPrompt = "Implement the selected slice.";
  const replacementId = "a1b2c3d4-e5f6-4789-abcd-ef0123456789";
  await endHeldClient(page, cursor, dashboard.home);
  cursor.setAttachMode("cannot-load");
  cursor.queueCreateChatId(replacementId);
  const createBefore = cursor
    .calls()
    .filter((call) => call.args.includes("create-chat")).length;
  await page.reload();
  const entry = parts(page).taken.locator(".session-entry");
  const recoverResponse = page.waitForResponse((response) =>
    response.url().includes("/__agent-launch/recover"),
  );
  await entry.getByRole("button", { name: "Recover" }).click();
  const recover = await recoverResponse;
  const recoverBody = (await recover.json()) as {
    kind: string;
    explanation?: string;
    record?: { session?: { sessionId?: string } };
  };
  expect(
    {
      status: recover.status(),
      kind: recoverBody.kind,
      explanation: recoverBody.explanation,
      sessionId: recoverBody.record?.session?.sessionId,
      createCalls: cursor
        .calls()
        .filter((call) => call.args.includes("create-chat"))
        .map((call) => call.args),
      attachIds: cursor.attaches().map((attach) => attach.sessionId),
    },
    "recover response",
  ).toMatchObject({
    status: 200,
    kind: "recovered",
    sessionId: replacementId,
  });
  await expectNormalizedReading(entry, "Awaiting first instruction", false);
  await expect
    .poll(
      () =>
        cursor.calls().filter((call) => call.args.includes("create-chat"))
          .length,
    )
    .toBe(createBefore + 1);
  const [after] = keptRecords(dashboard.home);
  if (after?.session.host !== "cursor") throw new Error("Missing Cursor.");
  expect(after.session.sessionId).toBe(replacementId);
  expect(after.session.continuation.args).toEqual([
    expect.any(String),
    "--workspace",
    before.session.continuation.workspace,
    "--resume",
    replacementId,
  ]);
  const resumed = cursor.attaches().at(-1);
  expect(resumed?.sessionId).toBe(replacementId);
  const typed = cursor.input(resumed?.pid ?? 0).replace(/\r$/u, "");
  expect(typed).toContain(originalPrompt);
  expect(typed).toContain("Continue the recorded Execution");
  expect(typed).toContain(`Identity: ${queuedIdentity}.`);
  expect(typed).not.toContain(cursorCannotLoadChat);
  const reference = after.request.reporting?.reference;
  if (reference === undefined) throw new Error("Missing reporting reference.");
  const post = (session: string) =>
    postCompletion(
      dashboard.origin,
      makeMe.aCompletionSubmission
        .reportingFor({ host: "cursor", reference })
        .fromSession(session)
        .withOutcome("unfinished")
        .saying("Replacement completion check.")
        .please(),
    );
  expect((await post(replacementId)).status).toBe(200);
  expect((await post(oldId)).status).toBe(409);
  expect((await post(oldId)).body).toContain(
    "The report does not name this launch's recorded session.",
  );
});
