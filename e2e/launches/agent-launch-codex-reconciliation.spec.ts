// Protocol evidence decides whether continuing an uncertain start may reuse
// the saved first input; a fresh start of its story is refused meanwhile.
// Histories that never authorize a resend:
// ../../dashboard/backend-tests/launches/agent-launch-codex-reconciliation-boundary.spec.ts.
import { openTakenBacklog } from "../../dashboard/tests/launchStoryCardPage.ts";
import { storyCardSessions } from "../../dashboard/tests/dashboardPage.ts";
import {
  notRefinedIdentity,
  notRefinedStory,
} from "../../dashboard/tests/launchJourney.ts";
import {
  accept,
  attempts,
  continued,
  launch,
} from "../../dashboard/tests/agentLaunchBoundary.ts";
import {
  test,
  expect,
  stored,
} from "../../dashboard/tests/support/codexLaunch.ts";
import { reloadUntilRead } from "../../dashboard/tests/pageRequestNotes.ts";
import { makeMe } from "../../tests/support/makeMe.mjs";
const request = makeMe.aLaunchRequest
  .refining({
    identity: notRefinedIdentity,
    title: notRefinedStory,
    host: "codex",
  })
  .withInstruction("Preserve this exact intent.")
  .please();
test.use({ projectFolders: ["open-dough"] });

test("explicit input refusal allows the saved input once in the resumed same conversation", async ({
  dashboard,
  page,
  codexProtocol: protocol,
  launchJourney,
}) => {
  const native = protocol;
  if (native === undefined) throw new Error("Missing native fixture.");
  const { card } = await openTakenBacklog(page, launchJourney);
  native.refuseInput = true;
  expect(JSON.parse((await launch(dashboard, request)).body)).toMatchObject({
    kind: "uncertain",
  });
  const initial = stored(dashboard.home)[0];
  expect(initial?.firstInput).toMatchObject({ state: "awaiting" });
  expect(native.history).toEqual([]);
  native.refuseInput = false;
  expect(
    JSON.parse(
      (
        await accept(dashboard, {
          ...request,
          instruction: "Changed retry must not replace the saved intent.",
        })
      ).body,
    ),
  ).toMatchObject({ kind: "failed", reason: "already-starting" });
  const [uncertain] = await attempts(dashboard);
  expect(
    JSON.parse((await continued(dashboard, uncertain?.id ?? "")).body),
  ).toMatchObject({ kind: "launched" });
  const inputs = native.calls.filter((call) => call.method === "turn/start");
  expect(inputs).toHaveLength(2);
  expect(inputs[1]?.params).toEqual(inputs[0]?.params);
  expect(stored(dashboard.home)[0]?.firstInput).not.toHaveProperty(
    "explanation",
  );
  const session = storyCardSessions(card(notRefinedStory));
  await reloadUntilRead(page);
  await expect(session).toContainText("First input accepted");
  await expect(session).not.toContainText("acceptance is not yet acknowledged");
  expect(native.history).toHaveLength(1);
  expect(
    native.calls.filter((call) => call.method === "thread/start"),
  ).toHaveLength(1);
  expect(
    native.calls
      .filter(
        (call) =>
          call.method === "thread/read" && call.params["includeTurns"] === true,
      )
      .map((call) => call.params),
  ).toEqual([{ threadId: initial?.session.sessionId, includeTurns: true }]);
  expect(
    native.calls
      .filter((call) => call.method === "thread/resume")
      .map((call) => call.params),
  ).toEqual([{ threadId: initial?.session.sessionId }]);
  expect(stored(dashboard.home)[0]).toMatchObject({
    request: { instruction: request.instruction },
    launchedAt: initial?.launchedAt,
    firstInput: { state: "confirmed" },
    session: initial?.session,
  });
});
