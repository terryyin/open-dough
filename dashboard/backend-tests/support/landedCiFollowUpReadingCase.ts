// Shared MakeMe inputs for landed CI follow-up reading Vitest cases.
import { IncomingMessage } from "node:http";
import { Socket } from "node:net";
import { onTestFinished, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeRepository } from "../../../Distribution/tests/support/repository-fixture.mjs";
import type { RepeatRequest } from "../../server/ciFollowUpStore.ts";
import {
  appendConfiguredProject,
  mountProjectConfiguration,
} from "../../server/projectConfiguration.ts";
import {
  endpointIdentity,
  endpointAuthor,
  endpointAgent,
  endpointProfilePath,
  endpointPrefix,
} from "./comparisonEndpointPrefix.ts";

export const source = makeMe.aPublishedSource.openDough.please();
export const target = `refs/heads/${source.ref}`;
export { endpointIdentity };
export const outlierReason = "Slow outlier: more than 15% above the median";
export const exclusion = {
  key: "run/6/1",
  date: "2026-11-10T05:00:00.000Z",
  ms: 116_000,
  status: "excluded" as const,
  reason: outlierReason,
};

export function followUpGet(query: string): IncomingMessage {
  const socket = new Socket();
  Object.defineProperty(socket, "remoteAddress", { value: "127.0.0.1" });
  const request = new IncomingMessage(socket);
  request.method = "GET";
  request.url = `/__project-configuration/ci-follow-up?${query}`;
  request.headers = { host: "127.0.0.1:4173" };
  return request;
}

export function buildAt(
  revision: string,
  runId: number,
  startedAt: string,
  durationMs: number,
  runAttempt = 1,
) {
  return makeMe.aKeptBuild
    .with({
      revision,
      state: "pass",
      runId,
      runAttempt,
      runUrl: `https://ci.invalid/runs/${String(runId)}`,
      startedAt,
      completedAt: new Date(Date.parse(startedAt) + durationMs).toISOString(),
      proof: makeMe.aCiProof
        .forRun({ revision, runId, runAttempt })
        .entries([makeMe.aCiProofEntry.at("tests").counting(1).please()])
        .please(),
    })
    .please();
}

export function recoveredRequest(
  completion: string,
  original: ReturnType<typeof buildAt>,
  repeat: ReturnType<typeof buildAt>,
  evidence: RepeatRequest["reference"]["evidence"],
  workflow: { name?: string; id?: number; averageMs?: number } = {},
): RepeatRequest {
  return makeMe.aCiRepeatRequest
    .with({
      provider: "github",
      repository: source.repository,
      workflow: workflow.name ?? "ci.yml",
      workflowId: workflow.id ?? 7001,
      original,
      reference: {
        endpoint: completion,
        sampleCount: 5,
        averageMs: workflow.averageMs ?? 100_000,
        evidence,
      },
      rule: { percent: 5, provisional: true, timingBasis: "attempt-start" },
      originalJobs: [
        {
          databaseId: 1,
          name: "test",
          run_id: 71,
          head_sha: completion,
          started_at: original.startedAt,
          completed_at: original.completedAt,
          status: "completed",
        },
      ],
      requestedAt: "2026-11-10T07:03:00.000Z",
      submission: { kind: "accepted" },
      outcome: {
        kind: "recovered",
        explanation: "Repeat recovered within the average",
        repeat,
      },
    })
    .please();
}

const done = makeMe.aDoneRecord
  .with({
    identity: endpointIdentity,
    title: "Story A",
    completedAt: "2026-11-09T00:00:00.000Z",
    agent: endpointAgent.agent,
  })
  .please();
const description = endpointPrefix
  .withRevision("done", {
    author: endpointAuthor,
    doneRecords: [done],
    remove: [endpointProfilePath],
  })
  .withRevision("trunk", {
    parents: ["claim"],
    files: { "other.txt": "other\n" },
  })
  .withRevision("landing", {
    parents: ["trunk", "done"],
    author: endpointAuthor,
    doneRecords: [done],
    remove: [endpointProfilePath],
  })
  .withRevision("later", {
    parents: ["landing"],
    files: { "later.txt": "same story identity, different landing\n" },
  })
  .please();

export async function openFollowUpCheckout() {
  const checkout = await materializeRepository(description);
  vi.stubEnv("HOME", checkout.fixture);
  const unmount = mountProjectConfiguration("development");
  onTestFinished(async () => {
    unmount();
    vi.unstubAllEnvs();
    await checkout.cleanup();
  });
  appendConfiguredProject(
    makeMe.aConfiguredProject
      .with({ ...source, localPath: checkout.integration })
      .please(),
  );
  return checkout;
}

export function outlierFollowUpLandings(
  repository: string,
  completion: string,
  later: string,
  trunk: string,
) {
  const originalStarted = "2026-11-10T07:00:00.000Z";
  const original = buildAt(completion, 71, originalStarted, 120_000);
  const repeat = buildAt(
    completion,
    71,
    "2026-11-10T07:05:00.000Z",
    100_000,
    2,
  );
  const priors = [1, 2, 3, 4, 5].map((index) => {
    const revision = `${String(index).padStart(2, "0")}${"a".repeat(38)}`;
    const startedAt = `2026-11-10T0${String(index)}:00:00.000Z`;
    return {
      revision,
      landing: makeMe.aLaunchLanding
        .capturedFrom({ repository })
        .comparing({
          base: `${String(index - 1 || 9).padStart(2, "0")}${"a".repeat(38)}`,
          revision,
        })
        .deliveredAs({
          delivery: `71000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
          receipt: `71000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
        })
        .receivedAt(startedAt)
        .please(),
      build: buildAt(revision, index, startedAt, 100_000),
    };
  });
  const storyLanding = makeMe.aLaunchLanding
    .capturedFrom({ repository, identity: endpointIdentity })
    .comparing({ base: trunk, revision: completion })
    .deliveredAs({
      delivery: "71000000-0000-4000-8000-000000000071",
      receipt: "71000000-0000-4000-8000-000000000071",
    })
    .receivedAt(originalStarted)
    .please();
  const laterLanding = makeMe.aLaunchLanding
    .capturedFrom({ repository })
    .comparing({ base: completion, revision: later })
    .deliveredAs({
      delivery: "88888888-0000-4000-8000-000000000080",
      receipt: "88888888-0000-4000-8000-000000000080",
    })
    .receivedAt("2026-11-10T08:00:00.000Z")
    .please();
  const request = recoveredRequest(completion, original, repeat, [
    ...priors.map(({ build }, index) => ({
      key: `run/${String(index + 1)}/1`,
      date: build.startedAt,
      ms: 100_000,
      status: "included" as const,
    })),
    exclusion,
  ]);
  const rebuilt = makeMe.aLandedCiHistory.inTrunkOrder([
    ...priors.map(({ revision }) => revision),
    completion,
    later,
  ]);
  for (const [index, prior] of priors.entries())
    rebuilt.recording(prior.landing, `run/${String(index + 1)}/1`, prior.build);
  rebuilt.recording(storyLanding, "run/71/2", repeat);
  rebuilt.recording(
    laterLanding,
    "run/80/1",
    buildAt(later, 80, "2026-11-10T08:00:00.000Z", 110_000),
  );
  return {
    originalStarted,
    storyLanding,
    request,
    history: rebuilt.please(),
  };
}
