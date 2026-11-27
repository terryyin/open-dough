// Established-session order, a whole long report, and a blank Cursor model.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { formatEstablishedSession } from "../../../Distribution/src/skills/dough-execute-plan/scripts/established-session.mjs";
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
import {
  launchInstructionLimit,
  type RecordedLaunchRequest,
} from "../../src/launchRequest.ts";
import { sessionKey } from "../../src/sessionReference.ts";
import type { EstablishedSession } from "../../src/unattachedSession.ts";

const project = makeMe.aPublishedSource.openDough.please();
const storyIdentity = "SEED-A#a";
const doneAt = "2026-11-08T09:05:00.000Z";
const began = new Date(2026, 10, 26, 15, 4);
const report = "The cache key changed; I restored it.\nCI now takes 4 minutes.";
const landed = "ab".repeat(20);
const reportedTitle = "Why is the CI slow on main?";
const quietTitle = "Tidy the changelog";
const longTitle = "Write it all down";
const longReport = "r".repeat(16_000);
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
const longContext = contextOf(longTitle, [
  "- Workflow: Ad hoc",
  `- Story: ${storyIdentity}`,
  `- Original request: ${longTitle}`,
  `- Final report (Completed with attention): ${longReport}`,
]);

const established: EstablishedSession = {
  workspace: "/open-dough/.worktrees/check-the-nightly-build-too",
  role: "isolated",
  branch: "claude/check-the-nightly-build-too",
  remote: "origin",
  target: "main",
  landing: "review",
  startingRevision: "cd".repeat(20),
};

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
const lengthy = doneSession(longTitle, "long-report", { message: longReport });
const sources = [reported, quiet, lengthy];
const unchanged = structuredClone(sources);

const reporting = {
  origin: "http://127.0.0.1:4173",
  reference: "22222222-2222-4222-8222-222222222222",
  command: "'node' '/installed/dashboard-completion.mjs'",
};

const kept = (
  sourceId: string,
  session: Parameters<FollowUpContextInput["keptSession"]>[1],
) =>
  sourceId === project.id
    ? sources.find(
        (record) => sessionKey(record.session) === sessionKey(session),
      )
    : undefined;

const contextInput: FollowUpContextInput = {
  notesFile: "story-notes.json",
  publishedDoneStory: () => Promise.reject(new Error("no Done record")),
  followUpStorySessions: () => Promise.reject(new Error("no story sessions")),
  pendingInputOf: () => Promise.resolve(undefined),
  keptSession: (sourceId, session) => Promise.resolve(kept(sourceId, session)),
  requirePublishedFollowUpSessionStory: (source, identity) =>
    source.id === project.id && identity === storyIdentity
      ? Promise.resolve()
      : Promise.reject(new Error(`unpublished story ${identity}`)),
};

type FollowUpChoice = {
  instruction?: string;
  host?: RecordedLaunchRequest["host"];
  model?: NonNullable<RecordedLaunchRequest["model"]>;
  policy?: { workspace: "isolated"; landing: "review" };
};

async function recordedFollowUp(
  source: LaunchRecord,
  choice: FollowUpChoice,
  at: Date,
): Promise<RecordedLaunchRequest> {
  const start = makeMe.aLaunchRequest.adHoc({
    source: project.id,
    host: choice.host ?? "claude",
    followUp: makeMe.aFollowUp.ofSession(source).please(),
    ...(choice.instruction === undefined
      ? {}
      : { instruction: choice.instruction }),
  });
  const chosen =
    choice.model === undefined ? start : start.requestingModel(choice.model);
  const posted =
    choice.policy === undefined ? chosen : chosen.withPolicy(choice.policy);
  const resolved = await withFollowUpContext(
    admittedLaunchRequest(posted.please()),
    project,
    contextInput,
  );
  return { ...recordedRequest(resolved, at), reporting };
}

function sentInput(
  request: RecordedLaunchRequest,
  session?: EstablishedSession,
) {
  const block = session ? formatEstablishedSession(session) : undefined;
  const text = unattachedInput(request, block) ?? "";
  const handoff = session
    ? {
        established: { establishedSession: session },
        formatted: block ?? "",
      }
    : undefined;
  const workspace = session?.workspace ?? "/execution-checkout";
  expect(
    codexInput(
      request,
      workspace,
      handoff && { handoff, workspace: { path: workspace, shown: workspace } },
    ),
  ).toEqual([{ type: "text", text }]);
  expect(cursorPrompt(request, handoff)).toBe(text);
  return text;
}

test("an established session sends its block and the reporting context, then the context and the request", async () => {
  const text = "Check the nightly build too";
  const request = await recordedFollowUp(
    reported,
    {
      instruction: text,
      policy: { workspace: "isolated", landing: "review" },
    },
    began,
  );

  const block = formatEstablishedSession(established);
  const sent = sentInput(request, established);
  expect(sent).toBe(
    [block, reportingInstruction(request), reportedContext, text].join("\n\n"),
  );
  expect(request).toMatchObject({
    title: text,
    instruction: text,
    storyIdentity,
    policy: { workspace: "isolated", landing: "review" },
    followUp: makeMe.aFollowUp
      .ofSession(reported)
      .withContext(reportedContext)
      .please(),
  });
  expect(sources).toEqual(unchanged);
});

test("a final report longer than the instruction field's limit is sent whole beside a request at that limit", async () => {
  const text = "q".repeat(launchInstructionLimit);
  const request = await recordedFollowUp(lengthy, { instruction: text }, began);

  const sent = sentInput(request);
  expect(longReport).toHaveLength(16_000);
  expect(text).toHaveLength(launchInstructionLimit);
  expect(sent).toBe(
    [longContext, text, reportingInstruction(request)].join("\n\n"),
  );
  expect(request.instruction).toBe(text);
  expect(sources).toEqual(unchanged);
});

test("a chosen Cursor model with a blank request is admitted and recorded", async () => {
  const request = await recordedFollowUp(
    quiet,
    { host: "cursor", model: "gpt-5.2" },
    began,
  );

  const sent = sentInput(request);
  expect(sent).toBe([quietContext, reportingInstruction(request)].join("\n\n"));
  expect(request).toMatchObject({
    host: "cursor",
    model: "gpt-5.2",
    title: "26 Nov, 15:04",
    followUp: makeMe.aFollowUp
      .ofSession(quiet)
      .withContext(quietContext)
      .please(),
  });
  expect(request).not.toHaveProperty("instruction");
  expect(sources).toEqual(unchanged);
});
