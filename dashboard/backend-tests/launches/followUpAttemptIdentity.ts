// A private HOME and the real attempt owner. The host is the run callback.
// While it is refusing, that call fails as the legacy refused scenario settled
// (the start stays kept). A later call for the same attempt launches.
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { acceptLaunchRequest } from "../../server/agentLaunchAccept.ts";
import { admittedLaunchRequest } from "../../server/agentLaunchAdmission.ts";
import { doneRecordFileName } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import type { FollowUpContextInput } from "../../server/followUpAdmission.ts";
import type { DoneStoryCatalogRead } from "../../server/followUpStory.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import type { FollowUp } from "../../src/followUpRequest.ts";
import { sessionKey } from "../../src/sessionReference.ts";
import {
  contextInput,
  otherStory,
  recordText,
  recoverStory,
} from "./storyFollowUpInput.ts";
import { recordedRequest } from "../../server/hostLaunch.ts";
import { LaunchAttemptOwner } from "../../server/launchAttemptOwner.ts";
import type { AttemptRun } from "../../server/launchAttemptSettlement.ts";
import { keptAttempts } from "../../server/launchAttemptStore.ts";
import { preContinuationAnswer } from "../../server/launchPreAcceptance.ts";
import {
  appendConfiguredProject,
  mountProjectConfiguration,
  removeConfiguredProject,
} from "../../server/projectConfiguration.ts";
import { StartProgress } from "../../server/startProgress.ts";
import { unattachedInput } from "../../server/unattachedInput.ts";
import type {
  Acceptance,
  AgentLaunchRequest,
  LaunchAttemptRecord,
} from "../../src/agentLaunch.ts";
import type { RecordedLaunchRequest } from "../../src/launchRequest.ts";
import type { PublishedSource } from "../../src/publishedSource.ts";

export type FollowUpRun = {
  readonly id: string;
  readonly acceptedAt: string;
  readonly request: RecordedLaunchRequest;
  readonly input: string;
};

export type FollowUpAttempts = {
  readonly project: PublishedSource;
  readonly runs: readonly FollowUpRun[];
  refuse(): void;
  launch(): void;
  accept(request: AgentLaunchRequest): Promise<Acceptance>;
  attempts(): Promise<readonly LaunchAttemptRecord[]>;
};

export async function withFollowUpAttempts<T>(
  input: FollowUpContextInput,
  exercise: (host: FollowUpAttempts) => Promise<T>,
): Promise<T> {
  const root = mkdtempSync(path.join(tmpdir(), "follow-up-attempt-"));
  const home = path.join(root, "home");
  const checkout = path.join(root, "checkout");
  mkdirSync(home);
  mkdirSync(checkout);
  vi.stubEnv("HOME", home);
  const project = makeMe.aConfiguredProject
    .with({
      ...makeMe.aPublishedSource.openDough.please(),
      localPath: checkout,
    })
    .please();
  let unmount = (): void => undefined;
  const owner = new LaunchAttemptOwner();
  try {
    unmount = mountProjectConfiguration("development");
    appendConfiguredProject(project);
    let refusing = false;
    const runs: FollowUpRun[] = [];
    const progress = new StartProgress();
    const run: AttemptRun = ({ attempt, request }) => {
      const recorded = recordedRequest(request, new Date(attempt.acceptedAt));
      runs.push({
        id: attempt.id,
        acceptedAt: attempt.acceptedAt,
        request: recorded,
        input: unattachedInput(recorded, undefined) ?? "",
      });
      if (refusing) {
        return Promise.resolve({
          kind: "failed",
          reason: "refused",
          explanation: "Claude Code refused to start a session.",
          sessionStartKept: true,
        });
      }
      return Promise.resolve({
        kind: "launched",
        record: {
          ...makeMe.aLaunchRecord
            .adHoc({ title: recorded.title, source: project.id })
            .inClaudeSession({
              sessionId: attempt.id,
              shortId: attempt.id.slice(0, 8),
            })
            .please(),
          request: recorded,
          sessionState: makeMe.aSessionState.loaded("working").please(),
        },
      });
    };
    return await exercise({
      project,
      runs,
      refuse: () => {
        refusing = true;
      },
      launch: () => {
        refusing = false;
      },
      accept: async (request) => {
        const answer = await acceptLaunchRequest(
          owner,
          project,
          admittedLaunchRequest(request),
          run,
          (id) =>
            owner.continueAttempt(
              project.id,
              id,
              (kept) => preContinuationAnswer(project, id, kept, progress),
              run,
            ),
          input,
        );
        await owner.drain();
        return answer;
      },
      attempts: async () => (await keptAttempts()) ?? [],
    });
  } finally {
    owner.close();
    await owner.drain();
    removeConfiguredProject(project.id);
    unmount();
    vi.unstubAllEnvs();
    rmSync(root, { recursive: true, force: true });
  }
}

const instruction = "Continue";
const choices = { workspace: "isolated", landing: "review" } as const;

export function doneFollowUpSession(
  projectId: string,
  title: string,
  sessionId: string,
  outcome: { message: string; landed?: string },
  storyIdentity: string,
): LaunchRecord {
  const record = makeMe.aLaunchRecord
    .adHoc({ instruction: title, title, storyIdentity, source: projectId })
    .inClaudeSession({ sessionId, shortId: sessionId.slice(0, 8) })
    .completedWith({ message: outcome.message })
    .markedDoneAt("2026-11-08T09:05:00.000Z");
  return (
    outcome.landed === undefined ? record : record.landedAt(outcome.landed)
  ).please();
}

export function sessionContextInput(
  projectId: string,
  sources: readonly LaunchRecord[],
  storyIdentity: string,
): FollowUpContextInput {
  return {
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
        sourceId === projectId
          ? sources.find(
              (record) => sessionKey(record.session) === sessionKey(session),
            )
          : undefined,
      ),
    requirePublishedFollowUpSessionStory: (source, identity) =>
      source.id === projectId && identity === storyIdentity
        ? Promise.resolve()
        : Promise.reject(new Error(`unpublished story ${identity}`)),
  };
}

export function followUpStart(projectId: string, followUp: FollowUp) {
  return makeMe.aLaunchRequest
    .adHoc({ source: projectId, instruction, followUp })
    .withPolicy(choices)
    .please();
}

export function twoStoryReads(projectId: string) {
  const asked: { revision: string; files: readonly string[] }[] = [];
  const stories = [recoverStory, otherStory];
  const catalogRead: DoneStoryCatalogRead = (source, read) => {
    if (source.id !== projectId) {
      return Promise.reject(new Error("catalog read for another project"));
    }
    asked.push({ revision: read.revision, files: read.files });
    const file = read.files[0] ?? "";
    const story = stories.find(
      (item) => doneRecordFileName(item.identity) === file,
    );
    return Promise.resolve({
      kind: "answered",
      answer: {
        revision: read.revision,
        records:
          story === undefined ? [] : [{ path: file, text: recordText(story) }],
      },
    });
  };
  return { asked, input: contextInput(catalogRead, []) };
}
