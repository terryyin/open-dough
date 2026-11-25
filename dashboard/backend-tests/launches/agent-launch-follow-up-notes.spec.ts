// Retried or separate launches of one note-bearing story follow-up.
// Selection and wire refusals are covered by the typed admission spec.

import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { attempts, launch } from "../../test-support/agentLaunchBoundary.ts";
import { stored } from "../../test-support/support/codexLaunch.ts";
import {
  recoverStory,
  storyContextOf,
} from "../../test-support/support/followUpStories.ts";
import { expect, test } from "../../test-support/support/preparationPage.ts";
import { developerStoryNotesLabel } from "../../src/followUpStoryNotes.ts";
import { storyNotesEndpoint, storyNoteVersion } from "../../src/storyNote.ts";
import { answerOf, request } from "./followUpBoundaryCases.ts";
import {
  completedAt,
  publishRecoverStory,
  seedNotes,
  waitingGeneral,
  waitingGeneralLine,
} from "./followUpNotesCases.ts";

test.use({ serverMode: "boundary" });

const notesSection = (...body: string[]) =>
  ["<line-notes>", "Developer's story notes", ...body, "</line-notes>"].join(
    "\n",
  );

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
  const message = [
    storyContextOf(
      recoverStory,
      completedAt,
      "no session",
      followUpStart.instruction,
    ),
    notesSection(waitingGeneralLine),
  ].join("\n\n");
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
  expect(call?.argv.at(-1)?.endsWith(message)).toBe(true);
  expect(stored(dashboard.home).at(-1)?.request).toMatchObject({
    followUp: {
      context: { message },
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
