// A follow-up of a published Done story. The catalog read stands in for
// GitHub. The first input sends the story's facts and only the selected
// sessions. A story the revision does not publish, or whose record cannot
// be read, refuses before a host starts.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { doneRecordFileName } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { codexInput } from "../../server/hosts/codex/input.ts";
import type { DoneStoryCatalogRead } from "../../server/followUpStory.ts";
import { reportingInstruction } from "../../server/reportingInstruction.ts";
import { RefusedRequest } from "../../server/localOrigin.ts";
import { unattachedInput } from "../../server/unattachedInput.ts";
import type { Outcome } from "../../server/readOutcome.ts";
import type { RecordedLaunchRequest } from "../../src/launchRequest.ts";
import {
  keptSessions,
  otherStory,
  readableCatalog,
  recordedStoryFollowUp,
  recordText,
  recoverStory,
  refusedBeforeHost,
  reporting,
  revision,
  selectedSessions,
  unpublishedStory,
} from "./storyFollowUpInput.ts";

const completed = "8 Nov 2026, 09:05 UTC by Terry Yin with viktor-chan";
const statusOf = (identity: string) =>
  `Done. Its seed and plan may have been removed; its records remain in the project's history under ${identity}.`;

function storyMessage(
  story: { readonly identity: string; readonly title: string },
  instruction: string,
  held: "selected" | "unselected" | "none",
): string {
  const noSession =
    held === "none" ? ["- Sessions: No session context is retained."] : [];
  const sessions =
    held === "selected"
      ? ["Refinement", "Execution"].map((workflow) =>
          [
            "<session>",
            story.title,
            `- Workflow: ${workflow}`,
            `- Story: ${story.identity}`,
            "- Original request: No request text was given.",
            "- Final report: No final report was submitted.",
            "</session>",
          ].join("\n"),
        )
      : [];
  return [
    [
      "<story>",
      `${story.identity} — ${story.title}`,
      `- Completed: ${completed}`,
      `- Status: ${statusOf(story.identity)}`,
      ...noSession,
      "</story>",
    ].join("\n"),
    `<follow-up>\nRequest:\n${instruction}\n</follow-up>`,
    ...sessions,
  ].join("\n\n");
}

function expectSent(
  request: RecordedLaunchRequest,
  message: string,
  instruction: string,
) {
  const sent = unattachedInput(request, undefined) ?? "";
  expect(sent).toBe([message, reportingInstruction(request)].join("\n\n"));
  expect(request).toMatchObject({
    instruction,
    storyIdentity: message.includes(recoverStory.identity)
      ? recoverStory.identity
      : otherStory.identity,
    followUp: { context: { message } },
  });
  expect(request.reporting).toEqual(reporting);
  return sent;
}

test("a done story's follow-up sends the story's facts and each selected Done session, and leaves another story and a still open session out", async () => {
  const text = "Paste still drops the last line on iPad; investigate.";
  const before = structuredClone(keptSessions);
  const catalog = readableCatalog(recoverStory);
  const followUp = makeMe.aFollowUp
    .ofStory(recoverStory, revision)
    .attachingSessions(selectedSessions);

  const request = await recordedStoryFollowUp(
    text,
    followUp.please(),
    catalog.catalogRead,
  );

  const message = storyMessage(recoverStory, text, "selected");
  const sent = expectSent(request, message, text);
  expect(sent).not.toContain(otherStory.identity);
  expect(sent).not.toContain("This session is still open.");
  expect(catalog.asked).toEqual([
    {
      revision,
      files: [doneRecordFileName(recoverStory.identity)],
    },
  ]);
  expect(request).toMatchObject({
    followUp: followUp.withContext({ message }).please(),
  });
  expect(keptSessions).toEqual(before);
});

test("a done story with no session kept sends its facts and that no session context is retained, and the first input agrees with the recorded request", async () => {
  const text = "Continue";
  const catalog = readableCatalog(otherStory);
  const request = await recordedStoryFollowUp(
    text,
    makeMe.aFollowUp.ofStory(otherStory, revision).please(),
    catalog.catalogRead,
    [],
  );

  const message = storyMessage(otherStory, text, "none");
  const sent = expectSent(request, message, text);
  expect(sent.startsWith(message)).toBe(true);
  expect(message).toContain("No session context is retained.");
  expect(catalog.asked).toEqual([
    { revision, files: [doneRecordFileName(otherStory.identity)] },
  ]);
});

test("a done story followed up with Codex sends the unselected story context, and that context agrees with the recorded request", async () => {
  const text = "Paste still drops the last line on iPad; investigate.";
  const before = structuredClone(selectedSessions);
  const catalog = readableCatalog(recoverStory);
  const request = await recordedStoryFollowUp(
    text,
    makeMe.aFollowUp.ofStory(recoverStory, revision).please(),
    catalog.catalogRead,
    selectedSessions,
    "codex",
  );

  const message = storyMessage(recoverStory, text, "unselected");
  const sent = expectSent(request, message, text);
  expect(codexInput(request, "/execution-checkout")).toEqual([
    { type: "text", text: sent },
  ]);
  expect(message).not.toContain("<session>");
  expect(message).not.toContain("No session context is retained.");
  expect(request.host).toBe("codex");
  expect(selectedSessions).toEqual(before);
});

const notPublished =
  "The done story this follows up is not published at the revision shown.";
const unread =
  "The done story this follows up could not be read at the revision shown.";
const bodies = (text: string): Outcome => ({
  kind: "answered",
  answer: {
    revision,
    records: [{ path: "record.json", text }],
  },
});

for (const refused of [
  {
    label: "the revision's read is not an answer with records",
    status: 404,
    message: notPublished,
    identity: unpublishedStory,
    outcome: (): Promise<Outcome> =>
      Promise.resolve({
        kind: "refused",
        status: 404,
        message: "That path is not reachable from this source revision.",
      }),
  },
  {
    label: "the revision lists no record",
    status: 404,
    message: notPublished,
    identity: unpublishedStory,
    outcome: (): Promise<Outcome> =>
      Promise.resolve({
        kind: "answered",
        answer: { revision, records: [] },
      }),
  },
  {
    label: "the record names another story",
    status: 404,
    message: notPublished,
    identity: recoverStory.identity,
    outcome: () => Promise.resolve(bodies(recordText(otherStory))),
  },
  {
    label: "the record is unreadable",
    status: 404,
    message: notPublished,
    identity: recoverStory.identity,
    outcome: () => Promise.resolve(bodies("{not json")),
  },
  {
    label: "the revision's read throws",
    status: 502,
    message: unread,
    identity: recoverStory.identity,
    outcome: () => Promise.reject(new Error("connection reset")),
  },
  {
    label: "the revision's read fails",
    status: 502,
    message: unread,
    identity: recoverStory.identity,
    outcome: (): Promise<Outcome> =>
      Promise.resolve({
        kind: "failed",
        message: "connection reset",
        retryAfterSeconds: undefined,
        recovery: undefined,
      }),
  },
]) {
  test(`refuses a follow-up before a host starts when ${refused.label}`, async () => {
    const before = structuredClone(keptSessions);
    const catalogRead: DoneStoryCatalogRead = () => refused.outcome();
    const admitted = await refusedBeforeHost(refused.identity, catalogRead);

    expect(admitted.refusal).toBeInstanceOf(RefusedRequest);
    expect(admitted.refusal).toMatchObject({
      status: refused.status,
      message: refused.message,
    });
    expect(admitted.hostsStarted).toEqual([]);
    expect(admitted.attempts).toEqual([]);
    expect(admitted.sessions).toEqual(before);
    expect(keptSessions).toEqual(admitted.before);
  });
}
