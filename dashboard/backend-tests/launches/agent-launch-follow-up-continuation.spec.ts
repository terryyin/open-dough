// Continue a kept follow-up after its source is gone. The recorded context
// and the story binding are sent, with the instruction once. A pending Codex
// input kept without its attempt is recovered with that saved text.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { admittedLaunchRequest } from "../../server/agentLaunchAdmission.ts";
import { withFollowUpContext } from "../../server/followUpAdmission.ts";
import { recordedRequest } from "../../server/hostLaunch.ts";
import { codexInput } from "../../server/hosts/codex/input.ts";
import { cursorPrompt } from "../../server/hosts/cursor/prompt.ts";
import type { RecordedLaunchRequest } from "../../src/launchRequest.ts";
import {
  followUpStart,
  withFollowUpAttempts,
  type FollowUpAttempts,
} from "./followUpAttemptIdentity.ts";
import { project, recoverStory, revision } from "./storyFollowUpInput.ts";
import {
  expiringStoryInput,
  instruction,
  pendingCodexConversation,
  pendingInput,
  pendingInstruction,
  projectId,
  reportedContextOf,
  reportedSession,
  sessionInput,
  storyIdentity,
} from "./followUpContinuation.ts";

function continued(host: FollowUpAttempts) {
  const run = host.runs[1];
  if (run === undefined) throw new Error("Missing continued follow-up");
  return run;
}

function expectSpelled(
  request: RecordedLaunchRequest,
  text: string,
  workspace: string,
) {
  expect(codexInput(request, workspace)).toEqual([{ type: "text", text }]);
  expect(cursorPrompt(request, undefined)).toBe(text);
}

test("continues a kept follow-up after the source record is removed", async () => {
  const reported = reportedSession();
  const sources = [reported];
  const context = reportedContextOf(reported);
  await withFollowUpAttempts(sessionInput(sources), async (host) => {
    const request = followUpStart(
      projectId,
      makeMe.aFollowUp.ofSession(reported).please(),
    );
    host.refuse();
    expect((await host.accept(request)).kind).toBe("accepted");
    sources.splice(0, sources.length);

    host.launch();
    expect((await host.accept(request)).kind).toBe("accepted");

    const run = continued(host);
    const text = run.input;
    expect(text).toBe([context, instruction].join("\n\n"));
    expect(text.split(instruction).length - 1).toBe(1);
    expect(run.request).toMatchObject({
      instruction,
      storyIdentity,
      followUp: { context },
    });
    expectSpelled(run.request, text, "/checkout");
  });
});

test("continues a story follow-up after its source record is gone", async () => {
  const { reads, input } = expiringStoryInput();
  await withFollowUpAttempts(input, async (host) => {
    const request = followUpStart(
      projectId,
      makeMe.aFollowUp.ofStory(recoverStory, revision).please(),
    );
    host.refuse();
    expect((await host.accept(request)).kind).toBe("accepted");
    expect(reads()).toBe(1);

    host.launch();
    expect((await host.accept(request)).kind).toBe("accepted");

    const run = continued(host);
    expect(reads()).toBe(1);
    expect(run.input).toContain("No session context is retained.");
    expect(run.input.split(instruction).length - 1).toBe(1);
    expect(run.request).toMatchObject({
      storyIdentity: recoverStory.identity,
      followUp: { context: { message: run.input } },
    });
    expect(cursorPrompt(run.request, undefined)).toBe(run.input);
  });
});

test("recovers a pending Codex input kept without its attempt", async () => {
  const reported = reportedSession();
  const context = reportedContextOf(reported);
  const saved = [context, pendingInstruction].join("\n\n");
  const conversation = pendingCodexConversation(reported, saved);
  const session = conversation.session;
  if (session.host !== "codex" || session.continuation === undefined) {
    throw new Error("Missing kept Codex conversation");
  }
  const start = admittedLaunchRequest(
    makeMe.aLaunchRequest
      .adHoc({
        source: projectId,
        host: "codex",
        instruction: pendingInstruction,
        followUp: makeMe.aFollowUp.ofSession(reported).please(),
      })
      .please(),
  );
  const resolved = await withFollowUpContext(
    start,
    project,
    pendingInput(conversation),
  );
  const recorded = recordedRequest(
    resolved,
    new Date("2026-11-26T15:04:00.000Z"),
  );
  expect(recorded).toMatchObject({
    instruction: pendingInstruction,
    storyIdentity,
    followUp: { context },
  });
  expect(conversation.firstInput).toMatchObject({
    state: "awaiting",
    instruction: saved,
  });
  expect(session).toMatchObject({ host: "codex", sessionId: "kept-thread" });
  expectSpelled(recorded, saved, session.continuation.workspace);
  expect(
    codexInput(recorded, session.continuation.workspace, undefined, saved),
  ).toEqual(codexInput(recorded, session.continuation.workspace));
});
