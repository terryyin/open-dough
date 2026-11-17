// Follow-up notes admission refusals over raw HTTP with a real bare origin
// and the synthetic `claude`: a session source cannot ask for notes, and a
// page cannot send note text or attached versions before claude starts.
// What waiting notes send and launch identity:
// agent-launch-follow-up-notes.spec.ts.

import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { accept } from "../../tests/agentLaunchBoundary.ts";
import { recoverStory } from "../../tests/support/followUpStories.ts";
import { expect, test } from "../../tests/support/preparationPage.ts";
import { keepLaunchRecords } from "../../tests/support/launchStore.ts";
import { storyNoteVersion } from "../../src/storyNote.ts";
import { quiet, reported, request } from "./followUpBoundaryCases.ts";
import {
  publishRecoverStory,
  seedNotes,
  waitingGeneral,
} from "./followUpNotesCases.ts";

test.use({ serverMode: "boundary" });

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
