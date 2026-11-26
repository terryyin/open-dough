// A follow-up of a Done session kept as a record. The resolver reads that
// record through typed inputs and the first input sends its context, then
// the developer's text, then the reporting context. The execution checkout
// is the default: no established-session block precedes the context.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { admittedLaunchRequest } from "../../server/agentLaunchAdmission.ts";
import {
  withFollowUpContext,
  type FollowUpContextInput,
} from "../../server/followUpAdmission.ts";
import { recordedRequest } from "../../server/hostLaunch.ts";
import { codexInput } from "../../server/hosts/codex/input.ts";
import { cursorPrompt } from "../../server/hosts/cursor/prompt.ts";
import { reportingInstruction } from "../../server/reportingInstruction.ts";
import { unattachedInput } from "../../server/unattachedInput.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import type { RecordedLaunchRequest } from "../../src/launchRequest.ts";
import { sessionKey } from "../../src/sessionReference.ts";

const project = makeMe.aPublishedSource.openDough.please();
const storyIdentity = "SEED-A#a";
const doneAt = "2026-11-08T09:05:00.000Z";
const report = "The cache key changed; I restored it.\nCI now takes 4 minutes.";
const landed = "ab".repeat(20);
const reportedTitle = "Why is the CI slow on main?";
const quietTitle = "Tidy the changelog";
const preamble =
  "Follow-up context: this session follows up earlier work in this project whose conversation can no longer be continued. These are the records the dashboard still holds of it; they state nothing beyond what was recorded.";

const contextOf = (title: string, items: readonly string[]) =>
  [preamble, `Session “${title}”:`, ...items].join("\n");

const reportedContext = contextOf(reportedTitle, [
  "- Workflow: Ad hoc",
  `- Story: ${storyIdentity}`,
  `- Original request: ${reportedTitle}`,
  "- Final report (Completed with attention):",
  report,
  `- Landed at revision: ${landed}`,
]);
const quietContext = contextOf(quietTitle, [
  "- Workflow: Ad hoc",
  `- Story: ${storyIdentity}`,
  `- Original request: ${quietTitle}`,
  "- Final report: No final report was submitted.",
]);

const doneSession = (
  title: string,
  sessionId: string,
  outcome: { message: string; landed?: string },
) => {
  const record = makeMe.aLaunchRecord
    .adHoc({
      instruction: title,
      title,
      storyIdentity,
      source: project.id,
    })
    .inClaudeSession({ sessionId, shortId: sessionId.slice(0, 8) })
    .completedWith({ message: outcome.message })
    .markedDoneAt(doneAt);
  return (
    outcome.landed === undefined ? record : record.landedAt(outcome.landed)
  ).please();
};

const reported = doneSession(reportedTitle, "reported-source", {
  message: report,
  landed,
});
const quiet = doneSession(quietTitle, "quiet-source", { message: "" });
const sources = [reported, quiet];
const unchanged = structuredClone(sources);

const reporting = {
  origin: "http://127.0.0.1:4173",
  reference: "22222222-2222-4222-8222-222222222222",
  command: "'node' '/installed/dashboard-completion.mjs'",
};

const contextInput: FollowUpContextInput = {
  notesFile: "story-notes.json",
  publishedDoneStory: () =>
    Promise.reject(
      new Error("a session follow-up does not read a Done record"),
    ),
  followUpStorySessions: () =>
    Promise.reject(
      new Error("a session follow-up does not read story sessions"),
    ),
  pendingInputOf: () => Promise.resolve(undefined),
  keptSession: (sourceId, session) =>
    Promise.resolve(
      sourceId === project.id
        ? sources.find(
            (record) => sessionKey(record.session) === sessionKey(session),
          )
        : undefined,
    ),
  requirePublishedFollowUpSessionStory: (source, identity) =>
    source.id === project.id && identity === storyIdentity
      ? Promise.resolve()
      : Promise.reject(new Error(`unpublished story ${identity}`)),
};

async function recordedFollowUp(
  source: LaunchRecord,
  instruction: string,
  began: Date,
): Promise<RecordedLaunchRequest> {
  const start = makeMe.aLaunchRequest
    .adHoc({
      source: project.id,
      instruction,
      followUp: makeMe.aFollowUp.ofSession(source).please(),
    })
    .please();
  const resolved = await withFollowUpContext(
    admittedLaunchRequest(start),
    project,
    contextInput,
  );
  return { ...recordedRequest(resolved, began), reporting };
}

function sentInput(request: RecordedLaunchRequest): string {
  const text = unattachedInput(request, undefined) ?? "";
  expect(codexInput(request, "/execution-checkout")).toEqual([
    { type: "text", text },
  ]);
  expect(cursorPrompt(request, undefined)).toBe(text);
  return text;
}

test("Execution checkout · Wait for review sends the context, then the request, then the reporting context, keeps it on the request and leaves the source unchanged", async () => {
  const text = "Is it still slow?";
  const request = await recordedFollowUp(
    reported,
    text,
    new Date(2026, 10, 26, 15, 4),
  );

  const sent = sentInput(request);
  expect(sent).toBe(
    [reportedContext, text, reportingInstruction(request)].join("\n\n"),
  );
  const reportingBlock = sent.split("\n\n")[2];
  expect(reportingBlock?.split("\n")).toHaveLength(8);
  expect(reportingBlock).toContain(
    "run this command from that checkout on entry",
  );
  expect(request).toMatchObject({
    title: text,
    instruction: text,
    storyIdentity,
    followUp: makeMe.aFollowUp
      .ofSession(reported)
      .withContext(reportedContext)
      .please(),
  });
  expect(request).not.toHaveProperty("policy");
  expect(sources).toEqual(unchanged);
});

test("a blank follow-up on the execution checkout sends the context and the reporting context, labelled by its launch time", async () => {
  const request = await recordedFollowUp(
    quiet,
    "  ",
    new Date(2026, 10, 26, 15, 4),
  );

  const sent = sentInput(request);
  expect(sent).toBe([quietContext, reportingInstruction(request)].join("\n\n"));
  const reportingBlock = sent.split("\n\n")[1];
  expect(reportingBlock?.split("\n")).toHaveLength(8);
  expect(reportingBlock).toContain(
    "run this command from that checkout on entry",
  );
  expect(request).toMatchObject({
    instruction: "  ",
    title: "26 Nov, 15:04",
    followUp: makeMe.aFollowUp
      .ofSession(quiet)
      .withContext(quietContext)
      .please(),
  });
  expect(sources).toEqual(unchanged);
});
