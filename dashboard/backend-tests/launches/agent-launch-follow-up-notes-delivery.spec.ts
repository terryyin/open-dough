// Confirmed first input marks attached note versions sent; refused or
// unconfirmed leaves them waiting; a later Cursor confirmation marks them;
// an edit during start stays waiting after the admitted version confirms;
// a notes-store write failure leaves them waiting. Admission and content:
// agent-launch-follow-up-notes.spec.ts.

import { mkdirSync, rmSync } from "node:fs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { attempts, launch } from "../../test-support/agentLaunchBoundary.ts";
import {
  expect,
  test as claudeTest,
} from "../../test-support/support/preparationPage.ts";
import {
  expect as cursorExpect,
  test as cursorTest,
} from "../../test-support/support/cursorStart.ts";
import { keptCursor } from "../../test-support/support/keptCursorTurn.ts";
import { recoverStory } from "../../test-support/support/followUpStories.ts";
import {
  storyNoteIsWaiting,
  storyNotesEndpoint,
  storyNoteVersion,
  type StoryNotesAnswer,
} from "../../src/storyNote.ts";
import { answerOf, request } from "./followUpBoundaryCases.ts";
import {
  publishRecoverStory,
  seedNotes,
  storyNotesFile,
  waitingGeneral,
} from "./followUpNotesCases.ts";

// Holds the notes store's write lock so confirmation cannot rewrite
// story-notes.json. File chmod alone does not stop atomic rename; a sibling
// directory lock refuses the write on Linux and macOS without touching other
// dashboard stores in the same folder.
function withNotesStoreWriteRefused(home: string, body: () => Promise<void>) {
  const lock = `${storyNotesFile(home)}.lock`;
  mkdirSync(lock);
  return body().finally(() => {
    rmSync(lock, { recursive: true, force: true });
  });
}

claudeTest.use({ serverMode: "boundary" });
cursorTest.use({
  serverMode: "boundary",
  cursorScreen: "working",
  cursorHoldPaint: true,
  launchWaitEnd: true,
});

async function storyNotesAnswer(
  api: {
    get: (
      url: string,
      options?: object,
    ) => Promise<{ status: () => number; json: () => Promise<unknown> }>;
  },
  dashboard: { baseURL: string; origin: string },
): Promise<StoryNotesAnswer> {
  const response = await api.get(
    `${dashboard.baseURL}${storyNotesEndpoint}?id=open-dough`,
    { headers: { Origin: dashboard.origin } },
  );
  expect(response.status()).toBe(200);
  return (await response.json()) as StoryNotesAnswer;
}

function noteOf(answer: StoryNotesAnswer, id: string) {
  expect(answer.kind).toBe("notes");
  if (answer.kind !== "notes") throw new Error("expected notes");
  const note = answer.notes[recoverStory.identity]?.find(
    (entry) => entry.id === id,
  );
  if (note === undefined) {
    throw new Error(`Missing note ${id}: ${JSON.stringify(answer)}`);
  }
  return note;
}

const followUpWithNotes = (revision: string) => ({
  ...request,
  instruction: "Send the waiting notes",
  followUp: makeMe.aFollowUp
    .ofStory(recoverStory, revision)
    .attachingNotes()
    .please(),
});

claudeTest(
  "Claude confirmation marks attached versions sent; refusal leaves them waiting",
  async ({ dashboard, origin, request: api }) => {
    const revision = await publishRecoverStory(dashboard, origin);
    seedNotes(dashboard.home, { [recoverStory.identity]: [waitingGeneral] });

    dashboard.claudeScenario("refused");
    const refused = await answerOf(
      launch(dashboard, followUpWithNotes(revision)),
    );
    expect(refused).toMatchObject({ kind: "failed", reason: "refused" });
    expect(
      storyNoteIsWaiting(
        noteOf(await storyNotesAnswer(api, dashboard), waitingGeneral.id),
      ),
    ).toBe(true);

    dashboard.claudeScenario("launched");
    const launched = await answerOf(
      launch(dashboard, followUpWithNotes(revision)),
    );
    expect(launched.kind, JSON.stringify(launched)).toBe("launched");
    const sent = noteOf(
      await storyNotesAnswer(api, dashboard),
      waitingGeneral.id,
    );
    expect(sent.delivered).toBe(storyNoteVersion(waitingGeneral));
    expect(storyNoteIsWaiting(sent)).toBe(false);
  },
);

claudeTest(
  "an edit between admission and confirmation leaves the current text waiting",
  async ({ dashboard, origin, request: api }) => {
    const revision = await publishRecoverStory(dashboard, origin);
    seedNotes(dashboard.home, { [recoverStory.identity]: [waitingGeneral] });
    const start = {
      ...followUpWithNotes(revision),
      policy: { workspace: "isolated" as const, landing: "review" as const },
    };

    dashboard.claudeScenario("refused");
    expect(await answerOf(launch(dashboard, start))).toMatchObject({
      kind: "failed",
      reason: "refused",
    });
    const [failed] = await attempts(dashboard);

    const edited = await api.post(
      `${dashboard.baseURL}${storyNotesEndpoint}?id=open-dough`,
      {
        headers: { Origin: dashboard.origin },
        data: {
          action: "edit",
          identity: recoverStory.identity,
          id: waitingGeneral.id,
          text: "Edited after admission; current version must stay waiting.",
        },
      },
    );
    expect(edited.status()).toBe(200);

    dashboard.claudeScenario("launched");
    const resumed = await answerOf(launch(dashboard, start));
    expect(resumed.kind, JSON.stringify(resumed)).toBe("launched");
    expect(await attempts(dashboard)).toEqual([
      expect.objectContaining({
        id: failed?.id,
        acceptedAt: failed?.acceptedAt,
      }),
    ]);

    const current = noteOf(
      await storyNotesAnswer(api, dashboard),
      waitingGeneral.id,
    );
    expect(current.text).toBe(
      "Edited after admission; current version must stay waiting.",
    );
    expect(storyNoteVersion(current)).not.toBe(
      storyNoteVersion(waitingGeneral),
    );
    expect(storyNoteIsWaiting(current)).toBe(true);
  },
);

claudeTest(
  "a notes-store write failure leaves attached versions waiting",
  async ({ dashboard, origin, request: api }) => {
    const revision = await publishRecoverStory(dashboard, origin);
    seedNotes(dashboard.home, { [recoverStory.identity]: [waitingGeneral] });
    await withNotesStoreWriteRefused(dashboard.home, async () => {
      dashboard.claudeScenario("launched");
      const launched = await answerOf(
        launch(dashboard, followUpWithNotes(revision)),
      );
      expect(launched.kind, JSON.stringify(launched)).toBe("launched");
      expect(
        storyNoteIsWaiting(
          noteOf(await storyNotesAnswer(api, dashboard), waitingGeneral.id),
        ),
      ).toBe(true);
    });
  },
);

cursorTest(
  "uncertain Cursor first input leaves notes waiting until later confirmation",
  async ({ dashboard, origin, cursor, request: api }) => {
    const revision = await publishRecoverStory(dashboard, origin);
    seedNotes(dashboard.home, { [recoverStory.identity]: [waitingGeneral] });
    const launching = launch(dashboard, {
      ...followUpWithNotes(revision),
      host: "cursor",
    });
    await cursorExpect.poll(() => cursor.attaches()).toHaveLength(1);
    await dashboard.endLaunchWait();
    const launched = JSON.parse((await launching).body) as {
      kind: string;
      reason?: string;
    };
    expect(launched.kind).toBe("uncertain");
    const uncertain = keptCursor(dashboard.home);
    expect(uncertain.firstInput?.state).toBe("uncertain");
    expect(uncertain.request).toMatchObject({
      followUp: {
        notes: [
          { id: waitingGeneral.id, version: storyNoteVersion(waitingGeneral) },
        ],
      },
    });
    expect(
      storyNoteIsWaiting(
        noteOf(await storyNotesAnswer(api, dashboard), waitingGeneral.id),
      ),
    ).toBe(true);

    cursor.releasePaint();
    await cursorExpect
      .poll(async () => {
        if (keptCursor(dashboard.home).firstInput?.state !== "confirmed")
          return undefined;
        return noteOf(await storyNotesAnswer(api, dashboard), waitingGeneral.id)
          .delivered;
      })
      .toBe(storyNoteVersion(waitingGeneral));
    expect(
      storyNoteIsWaiting(
        noteOf(await storyNotesAnswer(api, dashboard), waitingGeneral.id),
      ),
    ).toBe(false);
  },
);
