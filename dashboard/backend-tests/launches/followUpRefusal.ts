// Arrangement for a follow-up the project refuses before a host starts.
// The spec states each refusal.
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { expect } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { AgentLaunchRequest } from "../../src/agentLaunch.ts";
import type { FollowUpContextInput } from "../../server/followUpAdmission.ts";
import {
  publishedDoneStory,
  type DoneStoryCatalogRead,
} from "../../server/followUpStory.ts";
import { machineDashboardDirectory } from "../../server/machineHome.ts";
import { RefusedRequest } from "../../server/localOrigin.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import {
  doneFollowUpSession,
  followUpStart,
  sessionContextInput,
  withFollowUpAttempts,
  type FollowUpAttempts,
} from "./followUpAttemptIdentity.ts";

export const projectId = makeMe.aPublishedSource.openDough.please().id;
export const listed = "SEED-A#a";
export const unlisted = "SEED-other#story";
export const revision = "a".repeat(40);
export const malformed = "The launch request is malformed.";
export const notKept =
  "The session this follows up is no longer kept on this machine.";
export const noBinding =
  "The session this follows up has no published story binding.";
export const notListed =
  "The done story this follows up is not published at the revision shown.";
export const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

export function keptRecord(
  sessionId: string,
  storyIdentity?: string,
): LaunchRecord {
  if (storyIdentity === undefined) {
    return makeMe.aLaunchRecord
      .adHoc({ title: "Previous work", source: projectId })
      .inClaudeSession({ sessionId })
      .markedDone()
      .please();
  }
  return doneFollowUpSession(
    projectId,
    "Previous work",
    sessionId,
    { message: "Done." },
    storyIdentity,
  );
}

export function pageFollowUp(
  source: LaunchRecord,
  wire: { readonly context?: string; readonly storyIdentity?: string },
) {
  const followUp = makeMe.aFollowUp.ofSession(source).please();
  if (!("session" in followUp)) throw new Error("session follow-up");
  return followUpStart(projectId, {
    session: followUp.session,
    ...(wire.context === undefined ? {} : { context: wire.context }),
    ...(wire.storyIdentity === undefined
      ? {}
      : { storyIdentity: wire.storyIdentity }),
  });
}

export function expectRefusal(
  refusal: unknown,
  status: number,
  message: string,
) {
  expect(refusal).toBeInstanceOf(RefusedRequest);
  expect(refusal).toMatchObject({ status, message });
}

export async function refuses(
  sources: LaunchRecord[],
  request: AgentLaunchRequest,
  input: FollowUpContextInput = sessionContextInput(projectId, sources, listed),
) {
  const records = structuredClone(sources);
  let refusal: unknown;
  await withFollowUpAttempts(input, async (host) => {
    try {
      await host.accept(request);
    } catch (error) {
      refusal = error;
    }
    expect(host.runs).toEqual([]);
    expect(await host.attempts()).toEqual([]);
    expect(sources).toEqual(records);
  });
  return refusal;
}

export async function keptThenExpired(
  exercise: (host: FollowUpAttempts, source: LaunchRecord) => Promise<void>,
) {
  const source = keptRecord("kept-source", listed);
  const sources = [source];
  await withFollowUpAttempts(
    sessionContextInput(projectId, sources, listed),
    async (host) => {
      host.refuse();
      const started = await host.accept(
        followUpStart(projectId, makeMe.aFollowUp.ofSession(source).please()),
      );
      expect(started.kind).toBe("accepted");
      const kept = await host.attempts();
      expect(kept).toHaveLength(1);
      sources.splice(0, sources.length);
      const records = structuredClone(sources);
      const calls = host.runs.length;
      await exercise(host, source);
      expect(host.runs).toHaveLength(calls);
      expect(await host.attempts()).toEqual(kept);
      expect(sources).toEqual(records);
    },
  );
}

export function unlistedReads(sources: readonly LaunchRecord[]) {
  const asked: {
    project: string;
    revision: string;
    files: readonly string[];
  }[] = [];
  const catalogRead: DoneStoryCatalogRead = (source, read) => {
    asked.push({
      project: source.id,
      revision: read.revision,
      files: read.files,
    });
    return Promise.resolve({
      kind: "answered",
      answer: { revision: read.revision, records: [] },
    });
  };
  const input: FollowUpContextInput = {
    ...sessionContextInput(projectId, sources, listed),
    requirePublishedFollowUpSessionStory: (source, identity) =>
      publishedDoneStory(
        source,
        { identity, revision },
        new AbortController().signal,
        catalogRead,
      ).then(() => undefined),
  };
  return { input, asked };
}

export function namesIn(directory: string) {
  const full = path.join(machineDashboardDirectory(), directory);
  return existsSync(full) ? readdirSync(full) : [];
}
