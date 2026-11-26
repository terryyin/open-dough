// Start admits a story's Attach choice. The follow-up resolver reads the
// waiting versions and includes them in the receiving session's first input.
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { admittedLaunchRequest } from "../../server/agentLaunchAdmission.ts";
import { withFollowUpContext } from "../../server/followUpAdmission.ts";
import { recordedRequest } from "../../server/hostLaunch.ts";
import { RefusedRequest } from "../../server/localOrigin.ts";
import { unattachedInput } from "../../server/unattachedInput.ts";
import type { DoneStory } from "../../src/doneRecord.ts";
import type { FollowUp } from "../../src/followUpRequest.ts";
import type { StoryNote, StoryNoteContext } from "../../src/storyNote.ts";

const source = makeMe.aPublishedSource.openDough.please();
const story: Pick<DoneStory, "identity" | "title" | "completedAt"> =
  makeMe.aDoneRecord
    .completed({
      identity: "SEED-269#recover-terminal-insert",
      title: "Recover dictation and Paste in the embedded terminal",
      completedAt: "2026-11-08T09:05:00.000Z",
    })
    .please();
const revision = "a".repeat(40);
const instruction = "Investigate the paste drop.";
const followUpChoice = () => makeMe.aFollowUp.ofStory(story, revision);
const optedIn = () => followUpChoice().attachingNotes().please();

test("admits an opted-in story follow-up", () => {
  const start = makeMe.aLaunchRequest.adHoc({ followUp: optedIn() }).please();

  expect(admittedLaunchRequest(start)).toHaveProperty(
    "followUp.story.notes",
    true,
  );
});

const waiting = makeMe.aStoryNote
  .withText("Paste still drops the last line on iPad.")
  .please();
const version = { id: waiting.id, version: waiting.savedAt };

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

describe("the first input to a story follow-up", () => {
  let directory: string;
  let notesFile: string;

  beforeEach(() => {
    directory = mkdtempSync(path.join(tmpdir(), "follow-up-notes-"));
    notesFile = path.join(directory, "story-notes.json");
  });

  afterEach(() => {
    rmSync(directory, { recursive: true, force: true });
  });

  function saveNotes(...notes: StoryNote[]) {
    const document = makeMe.aStoredStoryNotesDocument
      .withNotes(source.id, story.identity, notes)
      .please();
    writeFileSync(notesFile, JSON.stringify(document));
  }

  function admitFollowUp(followUp: FollowUp) {
    const start = makeMe.aLaunchRequest
      .adHoc({ source: source.id, instruction, followUp })
      .please();
    return withFollowUpContext(admittedLaunchRequest(start), source, {
      notesFile,
      publishedDoneStory: () => Promise.resolve(story),
      followUpStorySessions: () => Promise.resolve([]),
      pendingInputOf: () => Promise.resolve(undefined),
    });
  }

  function expectRequiredContext(input: string | undefined) {
    expect(input).toContain(`<story>\n${story.identity} — ${story.title}\n`);
    expect(input).toContain("- Completed:");
    expect(input).toContain("- Status: Done.");
    expect(input).toContain("- Sessions: No session context is retained.");
    expect(input).toContain(
      `</story>\n\n<follow-up>\nRequest:\n${instruction}\n</follow-up>`,
    );
  }

  test("Attach sends only the waiting versions with their saved Review context", async () => {
    const context = {
      view: "Review changes",
      path: "dashboard/src/FollowUp.tsx",
      comparison: {
        name: "Published completion",
        baseline: "a".repeat(40),
        tree: "b".repeat(40),
      },
      line: { number: 42, side: "new", text: "  const followUp = source;" },
    } satisfies StoryNoteContext;
    const lineNote = makeMe.aStoryNote
      .identifiedAs("34820000-0000-4000-8000-000000000002")
      .withText("The anchor should keep the side.")
      .savedAt("2026-11-16T09:00:00.000Z")
      .withContext(context)
      .please();
    const sentAt = "2026-11-15T08:00:00.000Z";
    const sent = makeMe.aStoryNote
      .identifiedAs("34820000-0000-4000-8000-000000000003")
      .withText("Already sent.")
      .savedAt(sentAt)
      .deliveredAs(sentAt)
      .please();
    saveNotes(waiting, lineNote, sent);

    const recorded = recordedRequest(
      await admitFollowUp(optedIn()),
      new Date(),
    );
    const firstInput = unattachedInput(recorded, undefined);

    expectRequiredContext(firstInput);
    expect(firstInput).toContain(
      [
        "</follow-up>",
        "",
        "<line-notes>",
        "Developer's story notes",
        `- Note: ${waiting.text}`,
        `- Note: ${lineNote.text}`,
        "- Context:",
        "what the dashboard showed when the note was taken",
        context.view,
        context.path,
        `${context.comparison.name} ${context.comparison.baseline} → ${context.comparison.tree}`,
        `Line ${context.line.number} · ${context.line.side}`,
        context.line.text,
        "</line-notes>",
      ].join("\n"),
    );
    expect(firstInput).not.toContain(sent.text);
    expect(recorded).toHaveProperty("followUp.notes", [
      version,
      { id: lineNote.id, version: lineNote.savedAt },
    ]);
    expect(recorded.instruction).toBe(instruction);
  });

  test("leaving Attach clear omits waiting notes from the required input", async () => {
    saveNotes(waiting);

    const recorded = recordedRequest(
      await admitFollowUp(followUpChoice().please()),
      new Date(),
    );
    const firstInput = unattachedInput(recorded, undefined);

    expectRequiredContext(firstInput);
    expect(firstInput).not.toContain(waiting.text);
    expect(firstInput).not.toContain("<line-notes>");
    expect(recorded).not.toHaveProperty("followUp.notes");
  });

  test("an unreadable notes file leaves the required input intact without attachments", async () => {
    writeFileSync(notesFile, "{interrupted");

    const recorded = recordedRequest(
      await admitFollowUp(optedIn()),
      new Date(),
    );
    const firstInput = unattachedInput(recorded, undefined);

    expectRequiredContext(firstInput);
    expect(firstInput).not.toContain("<line-notes>");
    expect(recorded).not.toHaveProperty("followUp.notes");
  });
});
