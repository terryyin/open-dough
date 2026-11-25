// A story follow-up can opt into notes. Value admission refuses a session's
// opt-in, page-composed text, and page-supplied versions. The mounted case
// observes the first input when admitted notes cannot be read.

import { writeFileSync } from "node:fs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { admittedLaunchRequest } from "../../server/agentLaunchAdmission.ts";
import { RefusedRequest } from "../../server/localOrigin.ts";
import { launch } from "../../test-support/agentLaunchBoundary.ts";
import {
  recoverStory,
  storyContextOf,
} from "../../test-support/support/followUpStories.ts";
import { expect, test } from "../../test-support/support/preparationPage.ts";
import { storyNoteVersion } from "../../src/storyNote.ts";
import {
  answerOf,
  expectFollowUpInput,
  request,
} from "./followUpBoundaryCases.ts";
import {
  completedAt,
  publishRecoverStory,
  seedNotes,
  storyNotesFile,
  waitingGeneral,
} from "./followUpNotesCases.ts";

test.use({ serverMode: "boundary" });

test("a story follow-up starts with the required input when the selected notes cannot be read", async ({
  dashboard,
  origin,
}) => {
  const revision = await publishRecoverStory(dashboard, origin);
  seedNotes(dashboard.home, { [recoverStory.identity]: [waitingGeneral] });
  writeFileSync(storyNotesFile(dashboard.home), "{interrupted");
  dashboard.claudeScenario("launched");
  const instruction = "Investigate the paste drop.";

  const answer = await answerOf(
    launch(dashboard, {
      ...request,
      instruction,
      followUp: makeMe.aFollowUp
        .ofStory(recoverStory, revision)
        .attachingNotes()
        .please(),
    }),
  );

  expect(answer.kind, JSON.stringify(answer)).toBe("launched");
  const [call] = dashboard.claudeLaunchCalls();
  expectFollowUpInput(call?.argv.at(-1), {
    context: storyContextOf(
      recoverStory,
      completedAt,
      "no session",
      instruction,
    ),
    request: answer.record?.request,
    server: dashboard,
  });
  expect(answer.record?.request).toMatchObject({ workflow: "ad-hoc" });
  if (answer.record?.request.workflow === "ad-hoc")
    expect(answer.record.request.followUp).not.toHaveProperty("notes");
});

const optedIn = () =>
  makeMe.aFollowUp
    .ofStory(recoverStory, "a".repeat(40))
    .attachingNotes()
    .please();

test("admits an opted-in story follow-up", () => {
  const start = makeMe.aLaunchRequest.adHoc({ followUp: optedIn() }).please();

  expect(admittedLaunchRequest(start)).toHaveProperty(
    "followUp.story.notes",
    true,
  );
});

const version = {
  id: waitingGeneral.id,
  version: storyNoteVersion(waitingGeneral),
};

for (const { label, followUp, notes } of [
  {
    label: "naming notes on a session source",
    followUp: () =>
      makeMe.aFollowUp
        .ofSession(
          makeMe.aLaunchRecord.adHoc({ title: "Source session" }).please(),
        )
        .please(),
    notes: true,
  },
  {
    label: "carrying note text the page composed",
    followUp: optedIn,
    notes: [{ ...version, text: "Forged note text from the page." }],
  },
  {
    label: "carrying attached note versions from the page",
    followUp: optedIn,
    notes: [version],
  },
]) {
  test(`refuses a follow-up ${label} at Start value admission`, () => {
    const malformed = {
      ...makeMe.aLaunchRequest.adHoc().please(),
      followUp: { ...followUp(), notes },
    };

    expect(() => admittedLaunchRequest(malformed)).toThrow(
      expect.objectContaining({
        constructor: RefusedRequest,
        status: 400,
        message: "The launch request is malformed.",
      }),
    );
  });
}
