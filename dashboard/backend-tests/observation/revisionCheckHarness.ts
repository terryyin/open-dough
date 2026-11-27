// A fixed GitHub exchange for revision checks. It answers `checkHeadsViaGh`
// and `resolveRevisionViaGh` without launching `gh`.

import { EventEmitter } from "node:events";
import { mkdtempSync, rmSync } from "node:fs";
import type { IncomingMessage } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { onTestFinished } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { readAnswer } from "../../../Distribution/src/skills/dough-execute-plan/scripts/github-request-answer.mjs";
import { ReadAdmission } from "../../../Distribution/src/skills/dough-execute-plan/scripts/github-request-admission.mjs";
import type { GhAnswer } from "../../../Distribution/src/skills/dough-execute-plan/scripts/github-request-answer.mjs";
import { readingRefOf } from "../../src/authenticatedReadRules.ts";
import { BranchHeads } from "../../server/branchHeads.ts";
import type { GhExchange } from "../../server/ghRevision.ts";
import { performRevisionCheck } from "../../server/performedRevisionCheck.ts";
import { PinnedTexts } from "../../server/pinnedTexts.ts";
import type { RepositoryFileRead } from "../../server/pinnedTexts.ts";
import { RetainedAnswers } from "../../server/retainedAnswers.ts";
import { RevisionChecks } from "../../server/revisionChecks.ts";
import { RevisionMemo } from "../../server/revisionMemo.ts";
import type { PublishedSource } from "../../src/publishedSource.ts";
import { describedBacklog } from "../../test-support/describedRevisions.ts";
import { headsAnswer, headsEtag } from "../../test-support/originAnswers.ts";

export const revisionA = "a1".repeat(20);
export const revisionB = "b2".repeat(20);
export const rateLimitNow = Date.parse("2026-01-01T00:00:00.000Z");
export const openDough = makeMe.aPublishedSource.openDough.please();
export const pygardon = makeMe.aPublishedSource.pygardon.please();
export const doughnut = makeMe.aPublishedSource
  .with({
    id: "doughnut",
    label: "Doughnut",
    repository: "nerds-odd-e/doughnut",
  })
  .please();
export const backlog = describedBacklog(makeMe.aRepository.please());
export const readingMain = readingRefOf(openDough);

export function listingArgs(repository: string, etag?: string): string[] {
  return [
    "api",
    ...(etag === undefined ? [] : ["-H", `If-None-Match: ${etag}`]),
    `repos/${repository}/git/matching-refs/heads/`,
  ];
}

export function refArgs(repository: string, ref = "main"): string[] {
  return ["api", `repos/${repository}/commits/${ref}`, "--jq", ".sha"];
}

export function etagAt(revision: string): string {
  return headsEtag({ main: revision });
}

export function requester(): IncomingMessage {
  return new EventEmitter() as IncomingMessage;
}

function temporaryDirectory(): string {
  const directory = mkdtempSync(path.join(tmpdir(), "revision-check-"));
  onTestFinished(() => {
    rmSync(directory, { recursive: true, force: true });
  });
  return directory;
}

export function backlogReader(text: string): {
  readonly pinned: PinnedTexts;
  readonly calls: string[];
} {
  const calls: string[] = [];
  const readFile: RepositoryFileRead = (repository, filePath, revision) => {
    calls.push(`${repository} ${filePath}@${revision}`);
    return Promise.resolve(text);
  };
  return {
    calls,
    pinned: new PinnedTexts(
      new RevisionMemo(
        new RetainedAnswers({ directory: temporaryDirectory() }),
      ),
      readFile,
    ),
  };
}

export function ghScript(): {
  readonly calls: string[][];
  readonly exchange: GhExchange;
  readonly answerListing: (repository: string, answer: GhAnswer) => void;
  readonly answerRef: (repository: string, answer: GhAnswer) => void;
} {
  const calls: string[][] = [];
  const listings = new Map<string, () => GhAnswer>();
  const refs = new Map<string, () => GhAnswer>();
  const exchange: GhExchange = (args) => {
    calls.push([...args]);
    const endpoint = args.find((arg) => arg.startsWith("repos/"));
    if (endpoint === undefined) {
      return Promise.reject(new Error(`no endpoint in ${args.join(" ")}`));
    }
    const body = endpoint.slice("repos/".length);
    const git = body.indexOf("/git/");
    const commits = body.indexOf("/commits/");
    const cut =
      git === -1 ? commits : commits === -1 ? git : Math.min(git, commits);
    const repository = body.slice(0, cut);
    const answer = endpoint.includes("/git/matching-refs/")
      ? listings.get(repository)
      : refs.get(repository);
    return answer === undefined
      ? Promise.reject(new Error(`no answer for ${endpoint}`))
      : Promise.resolve(answer());
  };
  return {
    calls,
    exchange,
    answerListing: (repository, answer) => {
      listings.set(repository, () => answer);
    },
    answerRef: (repository, answer) => {
      refs.set(repository, () => answer);
    },
  };
}

export function revisionChecks(exchange: GhExchange): RevisionChecks {
  return new RevisionChecks({
    tracked: new Set<AbortController>(),
    reuseMs: () => 0,
    scope: () => Promise.resolve("revision-check"),
    ask: exchange,
  });
}

export function freshSignal(): AbortSignal {
  return new AbortController().signal;
}

export function headsAt(revision: string): GhAnswer {
  const raw = headsAnswer({ main: revision });
  return {
    status: raw.status,
    headers: new Map(raw.etag === undefined ? [] : [["etag", raw.etag]]),
    body: raw.body,
    failure: undefined,
    askedAt: new Date(0).toISOString(),
  };
}

export function shaAnswer(sha: string): GhAnswer {
  return {
    status: 200,
    headers: new Map(),
    body: sha,
    failure: undefined,
    askedAt: new Date(0).toISOString(),
  };
}

function included(
  status: number,
  headers: Readonly<Record<string, string>>,
  body: string,
): string {
  return [
    `HTTP/2.0 ${status}`,
    ...Object.entries(headers).map(([name, value]) => `${name}: ${value}\r`),
    "\r",
    body,
  ].join("\n");
}

export function ghPrinted(
  error: { readonly code: number | string } | null,
  status: number | undefined,
  headers: Readonly<Record<string, string>>,
  body: string,
  stderr: string,
  nowMs: number,
): GhAnswer {
  const printed = readAnswer(
    error,
    status === undefined ? body : included(status, headers, body),
    stderr,
    new Date(nowMs).toISOString(),
    nowMs,
  );
  return new ReadAdmission(60_000).answered(printed, nowMs);
}

export async function checked(
  checks: RevisionChecks,
  source: PublishedSource,
  since: string,
) {
  return performRevisionCheck(
    {
      pinned: new PinnedTexts(
        new RevisionMemo(
          new RetainedAnswers({ directory: temporaryDirectory() }),
        ),
      ),
      checks,
      branches: new BranchHeads(),
    },
    source,
    { kind: "revision-check", since, watched: [] },
    freshSignal(),
  );
}

export async function rejected(run: () => Promise<unknown>): Promise<unknown> {
  try {
    await run();
  } catch (error) {
    return error;
  }
  throw new Error("expected the revision check to fail");
}
