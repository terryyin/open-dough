// Follow-up notes admission refusals over raw HTTP with a real bare origin
// and the synthetic `claude`: a session source cannot ask for notes, and a
// page cannot send note text or attached versions before claude starts.
// What waiting notes send and launch identity:
// agent-launch-follow-up-notes.spec.ts.

import { writeFileSync } from "node:fs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { accept, launch } from "../../test-support/agentLaunchBoundary.ts";
import {
  recoverStory,
  storyContextOf,
} from "../../test-support/support/followUpStories.ts";
import { expect, test } from "../../test-support/support/preparationPage.ts";
import { keepLaunchRecords } from "../../test-support/support/launchStore.ts";
import { storyNoteVersion } from "../../src/storyNote.ts";
import {
  answerOf,
  expectFollowUpInput,
  quiet,
  reported,
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

test("refuses a follow-up naming notes on a session source before starting claude", async ({
  dashboard,
}) => {
  const source = reported(dashboard.home);
  keepLaunchRecords(dashboard, [source, quiet]);
  dashboard.claudeScenario("launched");

  const response = await accept(dashboard, {
    ...request,
    followUp: {
      ...makeMe.aFollowUp.ofSession(source).please(),
      notes: true,
    },
  });

  expect(response.status, response.body).toBe(400);
  expect(dashboard.claudeCalls()).toEqual([]);
});

test("refuses a follow-up carrying note text the page composed before starting claude", async ({
  dashboard,
  origin,
}) => {
  const revision = await publishRecoverStory(dashboard, origin);
  seedNotes(dashboard.home, {
    [recoverStory.identity]: [waitingGeneral],
  });
  dashboard.claudeScenario("launched");

  const response = await accept(dashboard, {
    ...request,
    followUp: {
      ...makeMe.aFollowUp
        .ofStory(recoverStory, revision)
        .attachingNotes()
        .please(),
      notes: [
        {
          id: waitingGeneral.id,
          version: storyNoteVersion(waitingGeneral),
          text: "Forged note text from the page.",
        },
      ],
    },
  });

  expect(response.status, response.body).toBe(400);
  expect(dashboard.claudeCalls()).toEqual([]);
});

test("refuses a follow-up carrying attached note versions the page composed before starting claude", async ({
  dashboard,
  origin,
}) => {
  const revision = await publishRecoverStory(dashboard, origin);
  seedNotes(dashboard.home, {
    [recoverStory.identity]: [waitingGeneral],
  });
  dashboard.claudeScenario("launched");

  const response = await accept(dashboard, {
    ...request,
    followUp: makeMe.aFollowUp
      .ofStory(recoverStory, revision)
      .attachingNotes()
      .withAttachedNotes([
        {
          id: waitingGeneral.id,
          version: storyNoteVersion(waitingGeneral),
        },
      ])
      .please(),
  });

  expect(response.status, response.body).toBe(400);
  expect(dashboard.claudeCalls()).toEqual([]);
});
