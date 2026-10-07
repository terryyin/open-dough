// Observing reads that a rate limit GitHub directed holds back
// (../../server/readAdmission.ts), at the local authenticated read boundary
// over real HTTP: each answer timed by this machine's clock, and what an
// answer held back unasked says.

import { expect } from "@playwright/test";
import type { DashboardServer } from "./dashboardServer.ts";
import { everyRepository } from "./fakeGitHub.ts";
import type { GhRequest } from "./ghRequest.ts";
import type { RawResponse } from "./rawHttp.ts";
import {
  readAt,
  sharedReadsPublished,
  type SharedRead,
} from "./sharedReads.ts";
import type { OriginAnswer } from "../originAnswers.ts";

export const heldBackPattern =
  /^GitHub limited the rate of the local GitHub CLI's requests, so (.+) was not asked of GitHub\. Reading resumes in (\d+) seconds\.$/;

// One boundary answer, when it was sent and when it arrived, by this
// machine's clock.
export type Timed = {
  readonly status: number;
  readonly body: {
    readonly error?: string;
    readonly retryAfterSeconds?: number;
  };
  readonly sentAt: number;
  readonly arrivedAt: number;
};

export async function timedRead(
  server: DashboardServer,
  read: SharedRead,
): Promise<Timed> {
  const sentAt = Date.now();
  const answer: RawResponse = await readAt(server, read);
  return {
    status: answer.status,
    body: JSON.parse(answer.body) as Timed["body"],
    sentAt,
    arrivedAt: Date.now(),
  };
}

// When, at the earliest and the latest, the server could have meant reading
// to resume, from the whole seconds an answer reported: the server rounds
// what is left up, at some moment between sending and arrival.
function resumeWindow({ body, sentAt, arrivedAt }: Timed) {
  const seconds = body.retryAfterSeconds ?? Number.NaN;
  return {
    from: sentAt + (seconds - 1) * 1000,
    to: arrivedAt + seconds * 1000,
  };
}

// An answer that the boundary held back: not GitHub's status, not asked,
// with whole seconds that name the same resume time as `wait` within the
// second the server rounds up.
export function expectHeldBack(
  answer: Timed,
  wait: Timed,
  label: string,
): void {
  expect(answer.status, label).toBe(502);
  const seconds = answer.body.retryAfterSeconds;
  expect(Number.isInteger(seconds), label).toBe(true);
  const said = heldBackPattern.exec(answer.body.error ?? "");
  expect(said, `${label}: ${answer.body.error ?? ""}`).not.toBeNull();
  expect(Number(said?.[2]), label).toBe(seconds);
  const held = resumeWindow(answer);
  const directed = resumeWindow(wait);
  // GitHub's own wait is exact: it was asked at the server's moment.
  const directedFrom = directed.from + 1000;
  expect(held.from, label).toBeLessThanOrEqual(directed.to);
  expect(held.to, label).toBeGreaterThanOrEqual(directedFrom);
}

// Serves `revision`, answering what `refuses` picks with what it returns.
export function servedRefusing(
  server: DashboardServer,
  revision: string,
  refuses: (request: GhRequest) => OriginAnswer | undefined,
): void {
  const published = sharedReadsPublished(revision);
  server.github.serve(everyRepository, (call) => {
    const refusal = refuses(call.request);
    return refusal === undefined ? published(call) : Promise.resolve(refusal);
  });
}
