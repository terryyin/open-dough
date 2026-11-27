// Arrangement for continuing a kept follow-up once its source is gone.
// The spec states what is sent.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { doneRecordFileName } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import {
  followUpContextText,
  sessionContext,
} from "../../src/followUpContext.ts";
import type { FollowUpContextInput } from "../../server/followUpAdmission.ts";
import type { DoneStoryCatalogRead } from "../../server/followUpStory.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import {
  doneFollowUpSession,
  sessionContextInput,
} from "./followUpAttemptIdentity.ts";
import {
  contextInput,
  project,
  recordText,
  recoverStory,
} from "./storyFollowUpInput.ts";

export const projectId = project.id;
export const storyIdentity = "SEED-A#a";
export const instruction = "Continue";
const report = "The cache key changed; I restored it.\nCI now takes 4 minutes.";
const landed = "ab".repeat(20);
const reportedTitle = "Why is the CI slow on main?";

export function reportedSession(): LaunchRecord {
  return doneFollowUpSession(
    projectId,
    reportedTitle,
    "reported-source",
    { message: report, landed },
    storyIdentity,
  );
}

export function reportedContextOf(source: LaunchRecord): string {
  return followUpContextText(sessionContext(source));
}

export function sessionInput(sources: LaunchRecord[]): FollowUpContextInput {
  return sessionContextInput(projectId, sources, storyIdentity);
}

// The Done record answers the first read, then the source is gone.
export function expiringStoryInput() {
  let reads = 0;
  const catalogRead: DoneStoryCatalogRead = (source, read) => {
    reads += 1;
    if (reads > 1 || source.id !== projectId) {
      return Promise.reject(new Error("the source record is gone"));
    }
    const file = read.files[0] ?? doneRecordFileName(recoverStory.identity);
    return Promise.resolve({
      kind: "answered",
      answer: {
        revision: read.revision,
        records: [{ path: file, text: recordText(recoverStory) }],
      },
    });
  };
  return { reads: () => reads, input: contextInput(catalogRead, []) };
}

export const pendingInstruction = "Check the cache again";
const keptThread = "kept-thread";
const keptWorkspace = "/saved-conversation";

export function pendingCodexConversation(
  source: LaunchRecord,
  saved: string,
): LaunchRecord {
  return makeMe.aLaunchRecord
    .adHoc({
      instruction: pendingInstruction,
      title: pendingInstruction,
      storyIdentity,
      source: projectId,
      followUp: makeMe.aFollowUp
        .ofSession(source)
        .withContext(reportedContextOf(source))
        .please(),
    })
    .inCodexSession({
      sessionId: keptThread,
      continuation: {
        workspace: keptWorkspace,
        endpoint: "ws://127.0.0.1:9",
      },
    })
    .withFirstInput({ state: "awaiting", instruction: saved })
    .please();
}

// The saved conversation is the only record. No attempt is kept.
export function pendingInput(conversation: LaunchRecord): FollowUpContextInput {
  return {
    ...sessionInput([]),
    pendingInputOf: (sourceId, request) =>
      Promise.resolve(
        sourceId === projectId &&
          request.workflow === "ad-hoc" &&
          request.host === "codex" &&
          request.instruction === pendingInstruction
          ? conversation
          : undefined,
      ),
    keptSession: () => Promise.reject(new Error("the source record is gone")),
  };
}
