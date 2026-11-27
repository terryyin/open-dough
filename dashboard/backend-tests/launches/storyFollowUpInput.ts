// A Done story's follow-up arranged for plain Vitest: the catalog read stands
// in for GitHub, and the sessions are the ones this machine keeps. The spec
// states the context that is sent and the refusal that stops a host.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  doneRecordFileName,
  renderDoneRecord,
} from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { admittedLaunchRequest } from "../../server/agentLaunchAdmission.ts";
import { acceptLaunchRequest } from "../../server/agentLaunchAccept.ts";
import {
  withFollowUpContext,
  type FollowUpContextInput,
} from "../../server/followUpAdmission.ts";
import {
  publishedDoneStory as readPublishedDoneStory,
  type DoneStoryCatalogRead,
} from "../../server/followUpStory.ts";
import { recordedRequest } from "../../server/hostLaunch.ts";
import { LaunchAttemptOwner } from "../../server/launchAttemptOwner.ts";
import type { AttemptRun } from "../../server/launchAttemptSettlement.ts";
import { keptAttempts } from "../../server/launchAttemptStore.ts";
import { storyFollowUpSessions } from "../../src/followUpSessions.ts";
import type { FollowUp } from "../../src/followUpRequest.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import type { RecordedLaunchRequest } from "../../src/launchRequest.ts";

type Story = { readonly identity: string; readonly title: string };

export const project = makeMe.aPublishedSource.openDough.please();
export const revision = "a".repeat(40);
export const completedAt = "2026-11-08T09:05:00.000Z";
export const recoverStory: Story = {
  identity: "SEED-269#recover-terminal-insert",
  title: "Recover dictation and Paste in the embedded terminal",
};
export const otherStory: Story = {
  identity: "SEED-267#keep-the-terminal-scroll",
  title: "Keep the terminal scroll",
};
export const unpublishedStory = "SEED-270#never-completed";
const doneAt = "2026-11-26T09:05:00.000Z";
const openRequest = "This session is still open.";

export const reporting = {
  origin: "http://127.0.0.1:4173",
  reference: "22222222-2222-4222-8222-222222222222",
  command: "'node' '/installed/dashboard-completion.mjs'",
};

export function recordText(story: Story): string {
  return renderDoneRecord(
    makeMe.aDoneRecord
      .with({
        ...story,
        completedAt,
        developer: "Terry Yin",
        agent: "viktor-chan",
        host: "codex",
      })
      .please(),
  );
}

function quietSessions(story: Story): LaunchRecord[] {
  const slug = story.identity.split("#")[1] ?? "story";
  return [
    makeMe.aLaunchRecord
      .refining({ ...story, source: project.id })
      .inClaudeSession({ sessionId: `${slug}-refined`, shortId: "refined" })
      .completedWith({ message: "" })
      .markedDoneAt(doneAt)
      .please(),
    makeMe.aLaunchRecord
      .executing({ ...story, source: project.id })
      .inClaudeSession({ sessionId: `${slug}-executed`, shortId: "executed" })
      .completedWith({ message: "" })
      .markedDoneAt(doneAt)
      .please(),
  ];
}

export const selectedSessions = quietSessions(recoverStory);
export const keptSessions = [
  ...selectedSessions,
  makeMe.aLaunchRecord
    .refining({
      ...recoverStory,
      source: project.id,
      instruction: openRequest,
    })
    .inClaudeSession({ sessionId: "still-open", shortId: "still-op" })
    .please(),
  ...quietSessions(otherStory),
];

export function readableCatalog(story: Story) {
  const asked: {
    readonly revision: string;
    readonly files: readonly string[];
  }[] = [];
  const catalogRead: DoneStoryCatalogRead = (source, read) => {
    if (source.id !== project.id) {
      return Promise.reject(new Error("catalog read for another project"));
    }
    asked.push({ revision: read.revision, files: read.files });
    const file = read.files[0] ?? doneRecordFileName(story.identity);
    return Promise.resolve({
      kind: "answered",
      answer: {
        revision: read.revision,
        records: [{ path: file, text: recordText(story) }],
      },
    });
  };
  return { asked, catalogRead };
}

export function contextInput(
  catalogRead: DoneStoryCatalogRead,
  sessions: readonly LaunchRecord[] = keptSessions,
): FollowUpContextInput {
  return {
    notesFile: "story-notes.json",
    publishedDoneStory: (source, story, signal) =>
      readPublishedDoneStory(source, story, signal, catalogRead),
    followUpStorySessions: (source, identity) =>
      Promise.resolve(storyFollowUpSessions(sessions, [], source.id, identity)),
    pendingInputOf: () => Promise.resolve(undefined),
    keptSession: () => Promise.resolve(undefined),
    requirePublishedFollowUpSessionStory: () =>
      Promise.reject(
        new Error("a story follow-up does not check session membership"),
      ),
  };
}

export async function recordedStoryFollowUp(
  instruction: string,
  followUp: FollowUp,
  catalogRead: DoneStoryCatalogRead,
  sessions: readonly LaunchRecord[] = keptSessions,
  host: "claude" | "codex" = "claude",
): Promise<RecordedLaunchRequest> {
  const start = admittedLaunchRequest(
    makeMe.aLaunchRequest
      .adHoc({ source: project.id, host, instruction, followUp })
      .please(),
  );
  const resolved = await withFollowUpContext(
    start,
    project,
    contextInput(catalogRead, sessions),
  );
  return {
    ...recordedRequest(resolved, new Date(2026, 10, 26, 15, 4)),
    reporting,
  };
}

// Admission that would start a host. A catalog refusal returns before `run`.
export async function refusedBeforeHost(
  identity: string,
  catalogRead: DoneStoryCatalogRead,
) {
  const home = mkdtempSync(path.join(tmpdir(), "story-follow-up-refusal-"));
  vi.stubEnv("HOME", home);
  const hostsStarted: string[] = [];
  const before = structuredClone(keptSessions);
  const owner = new LaunchAttemptOwner();
  const run: AttemptRun = () => {
    hostsStarted.push("host");
    return Promise.reject(new Error("a refused follow-up started a host"));
  };
  let refusal: unknown;
  try {
    const request = admittedLaunchRequest(
      makeMe.aLaunchRequest
        .adHoc({
          source: project.id,
          instruction: "Continue",
          followUp: makeMe.aFollowUp.ofStory(identity, revision).please(),
        })
        .please(),
    );
    await acceptLaunchRequest(
      owner,
      project,
      request,
      run,
      () => {
        hostsStarted.push("continue");
        return Promise.reject(
          new Error("a refused follow-up continued a host"),
        );
      },
      contextInput(catalogRead),
    );
  } catch (error) {
    refusal = error;
  } finally {
    owner.close();
    vi.unstubAllEnvs();
    rmSync(home, { recursive: true, force: true });
  }
  return {
    refusal,
    hostsStarted,
    sessions: keptSessions,
    before,
    attempts: await keptAttempts(),
  };
}
