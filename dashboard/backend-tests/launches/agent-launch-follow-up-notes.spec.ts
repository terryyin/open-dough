// A done story's follow-up with `notes: true` over raw HTTP, with a real bare
// origin (../../tests/support/startOrigin.ts), a synthetic `gh` answering from
// the fake GitHub, and the synthetic `claude`: admission reads waiting notes
// from the machine store, never the page, and puts them after the story's
// context in the first input; without `notes: true` none are sent; a retried
// start resends the saved notes after an in-flight edit; the opposite attach
// choice is another launch. Refusals:
// agent-launch-follow-up-notes-admission.spec.ts. Story facts without notes:
// agent-launch-follow-up-story.spec.ts. Identity without notes:
// agent-launch-follow-up-identity.spec.ts.

import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { attempts, launch } from "../../tests/agentLaunchBoundary.ts";
import { stored } from "../../tests/support/codexLaunch.ts";
import {
  recoverStory,
  storyContextOf,
} from "../../tests/support/followUpStories.ts";
import { expect, test } from "../../tests/support/preparationPage.ts";
import { developerStoryNotesLabel } from "../../src/followUpStoryNotes.ts";
import { storyNotesEndpoint, storyNoteVersion } from "../../src/storyNote.ts";
import {
  answerOf,
  expectFollowUpInput,
  partsOf,
  request,
} from "./followUpBoundaryCases.ts";
import {
  completedAt,
  notesContextOf,
  publishRecoverStory,
  seedNotes,
  sentNote,
  waitingGeneral,
  waitingLine,
} from "./followUpNotesCases.ts";

test.use({ serverMode: "boundary" });

test("a story follow-up with notes: true sends only waiting notes with text and context after the story context", async ({
  dashboard,
  origin,
}) => {
  const revision = await publishRecoverStory(dashboard, origin);
  // Newest first in the store, as Story notes lists them.
  seedNotes(dashboard.home, {
    [recoverStory.identity]: [waitingGeneral, waitingLine, sentNote],
  });
  dashboard.claudeScenario("launched");
  const text = "Investigate the paste drop.";
  const storyContext = storyContextOf(recoverStory, completedAt, "no session");
  const notesContext = notesContextOf([waitingGeneral, waitingLine]);
  const context = `${storyContext}\n${notesContext}`;

  const launched = await answerOf(
    launch(dashboard, {
      ...request,
      instruction: text,
      followUp: makeMe.aFollowUp
        .ofStory(recoverStory, revision)
        .attachingNotes()
        .please(),
    }),
  );

  expect(launched.kind, JSON.stringify(launched)).toBe("launched");
  const [call] = dashboard.claudeLaunchCalls();
  expectFollowUpInput(call?.argv.at(-1), {
    context,
    own: text,
    request: launched.record?.request,
    server: dashboard,
  });
  expect(call?.argv.at(-1)).not.toContain(sentNote.text);
  expect(stored(dashboard.home).at(-1)?.request).toMatchObject({
    instruction: text,
    followUp: {
      story: { identity: recoverStory.identity, notes: true },
      context,
      notes: [
        {
          id: waitingGeneral.id,
          version: storyNoteVersion(waitingGeneral),
        },
        {
          id: waitingLine.id,
          version: storyNoteVersion(waitingLine),
        },
      ],
    },
  });
  // Notes live in the context block, not the instruction field.
  expect(launched.record?.request.instruction).toBe(text);
  expect(text.length).toBeLessThan(4_000);
});

test("a story follow-up without notes: true sends none of the story's notes", async ({
  dashboard,
  origin,
}) => {
  const revision = await publishRecoverStory(dashboard, origin);
  seedNotes(dashboard.home, {
    [recoverStory.identity]: [waitingGeneral, waitingLine, sentNote],
  });
  dashboard.claudeScenario("launched");
  const context = storyContextOf(recoverStory, completedAt, "no session");

  const launched = await answerOf(
    launch(dashboard, {
      ...request,
      instruction: "Continue without notes",
      followUp: makeMe.aFollowUp.ofStory(recoverStory, revision).please(),
    }),
  );

  expect(launched.kind, JSON.stringify(launched)).toBe("launched");
  const [call] = dashboard.claudeLaunchCalls();
  expectFollowUpInput(call?.argv.at(-1), {
    context,
    own: "Continue without notes",
    request: launched.record?.request,
    server: dashboard,
  });
  expect(call?.argv.at(-1)).not.toContain(waitingGeneral.text);
  expect(call?.argv.at(-1)).not.toContain(developerStoryNotesLabel);
  const kept = stored(dashboard.home).at(-1)?.request;
  expect(kept?.workflow).toBe("ad-hoc");
  if (kept?.workflow === "ad-hoc")
    expect(kept.followUp).not.toHaveProperty("notes");
});

test("a retried start with notes: true resends the saved notes after an in-flight edit", async ({
  dashboard,
  origin,
  request: api,
}) => {
  const revision = await publishRecoverStory(dashboard, origin);
  seedNotes(dashboard.home, {
    [recoverStory.identity]: [waitingGeneral],
  });
  const followUpStart = {
    ...request,
    instruction: "Continue with notes",
    policy: { workspace: "isolated" as const, landing: "review" as const },
    followUp: makeMe.aFollowUp
      .ofStory(recoverStory, revision)
      .attachingNotes()
      .please(),
  };
  const admitted = `${storyContextOf(recoverStory, completedAt, "no session")}\n${notesContextOf([waitingGeneral])}`;
  dashboard.claudeScenario("refused");
  const refused = await answerOf(launch(dashboard, followUpStart));
  expect(refused).toMatchObject({ kind: "failed", reason: "refused" });
  const [failed] = await attempts(dashboard);

  const edited = await api.post(
    `${dashboard.baseURL}${storyNotesEndpoint}?id=open-dough`,
    {
      headers: { Origin: dashboard.origin },
      data: {
        action: "edit",
        identity: recoverStory.identity,
        id: waitingGeneral.id,
        text: "Edited after admission; session must not see this.",
      },
    },
  );
  expect(edited.status()).toBe(200);

  dashboard.claudeScenario("launched");
  const resumed = await answerOf(launch(dashboard, followUpStart));
  expect(resumed.kind, JSON.stringify(resumed)).toBe("launched");
  expect(await attempts(dashboard)).toEqual([
    expect.objectContaining({ id: failed?.id, acceptedAt: failed?.acceptedAt }),
  ]);
  const call = dashboard.claudeLaunchCalls().at(-1);
  expect(call?.argv.at(-1)).toContain(waitingGeneral.text);
  expect(call?.argv.at(-1)).not.toContain(
    "Edited after admission; session must not see this.",
  );
  // Isolated resume: [established, reporting, context, own].
  expect(partsOf(call?.argv.at(-1), admitted).after).toEqual([
    followUpStart.instruction,
  ]);
  expect(stored(dashboard.home).at(-1)?.request).toMatchObject({
    followUp: {
      context: admitted,
      notes: [
        { id: waitingGeneral.id, version: storyNoteVersion(waitingGeneral) },
      ],
    },
  });
});

test("notes: true and without it are two launches; repeating the same choice resumes the kept start", async ({
  dashboard,
  origin,
}) => {
  const revision = await publishRecoverStory(dashboard, origin);
  seedNotes(dashboard.home, {
    [recoverStory.identity]: [waitingGeneral],
  });
  const withNotes = {
    ...request,
    instruction: "Same words",
    policy: { workspace: "isolated" as const, landing: "review" as const },
    followUp: makeMe.aFollowUp
      .ofStory(recoverStory, revision)
      .attachingNotes()
      .please(),
  };
  const withoutNotes = {
    ...withNotes,
    followUp: makeMe.aFollowUp.ofStory(recoverStory, revision).please(),
  };
  dashboard.claudeScenario("refused");
  const refused = await answerOf(launch(dashboard, withNotes));
  expect(refused).toMatchObject({ kind: "failed", reason: "refused" });
  const [failed] = await attempts(dashboard);

  dashboard.claudeScenario("launched");
  const other = await answerOf(launch(dashboard, withoutNotes));
  const resumed = await answerOf(launch(dashboard, withNotes));

  expect(other.kind, JSON.stringify(other)).toBe("launched");
  expect(resumed.kind, JSON.stringify(resumed)).toBe("launched");
  expect(await attempts(dashboard)).toHaveLength(2);
  expect(await attempts(dashboard)).toContainEqual(
    expect.objectContaining({ id: failed?.id, acceptedAt: failed?.acceptedAt }),
  );
  const calls = dashboard.claudeLaunchCalls();
  expect(calls).toHaveLength(3);
  expect(calls[1]?.argv.at(-1)).not.toContain(developerStoryNotesLabel);
  expect(calls[2]?.argv.at(-1)).toContain(waitingGeneral.text);
});
