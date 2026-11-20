// Shared MakeMe setup for attempt-landing decision cases.
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  landingDelivery,
  landingReceipt,
  reportingReference,
} from "../../../Distribution/tests/support/launchLandingTestData.mjs";
import type {
  LaunchLanding,
  LandingRepository,
} from "../../src/launchLanding.ts";
import { RefusedRequest } from "../../server/localOrigin.ts";

export const origin = "http://127.0.0.1:4173";
export const receiptTime = "2026-11-20T12:00:00.000Z";
export const baseSha = "a1".repeat(20);
export const revisionSha = "b2".repeat(20);
export const otherSha = "c3".repeat(20);
export { landingDelivery, landingReceipt, reportingReference };

export function aReportingAttempt(facts: {
  identity?: string;
  withOutcome?: boolean;
  preparations?: readonly LaunchLanding[];
  landing?: LaunchLanding;
  authority: LandingRepository;
}) {
  const builder = makeMe.anAcceptedAttempt
    .withId(reportingReference)
    .reportingTo(origin)
    .capturingLanding({
      reporting: {
        origin,
        reference: reportingReference,
        command: "report",
      },
      landingRepository: facts.authority,
      ...(facts.preparations === undefined
        ? {}
        : { landingPreparations: [...facts.preparations] }),
      ...(facts.landing === undefined ? {} : { landing: facts.landing }),
    });
  if (facts.identity === undefined) builder.adHoc();
  else builder.executing({ identity: facts.identity, title: "Story" });
  if (facts.withOutcome)
    builder.launched({ host: "claude", sessionId: "decision-session" });
  return builder.please();
}

export function aBoundRecord(facts: {
  authority: LandingRepository;
  deletedAt?: string;
}) {
  return makeMe.aLaunchRecord
    .adHoc({ title: "Bound landing" })
    .inClaudeSession({ sessionId: "decision-session" })
    .reportingThrough({
      origin,
      reference: reportingReference,
      command: "report",
    })
    .withLandingReporting({
      origin,
      authority: facts.authority,
      preparations: [],
      ...(facts.deletedAt === undefined ? {} : { deletedAt: facts.deletedAt }),
    })
    .please();
}

// A declared branch handoff record: storyless authority matching its entry.
export function aDeclaredRecord(facts: {
  authority?: LandingRepository;
  origin?: string;
  deletedAt?: string;
}) {
  const authority = facts.authority ?? aWorktreeAuthority();
  const storyless = {
    repository: authority.repository,
    workspace: authority.workspace,
    branch: authority.branch,
    remote: authority.remote,
    target: authority.target,
  };
  const reportingOrigin = facts.origin ?? origin;
  const record = makeMe.aLaunchRecord
    .adHoc({ title: "Declared landing" })
    .inClaudeSession({ sessionId: "declared-decision-session" })
    .withLandingReporting({
      origin: reportingOrigin,
      authority: storyless,
      preparations: [],
      branchContext: {
        reference: reportingReference,
        file: "/tmp/declared-landing-context.json",
      },
      ...(facts.deletedAt === undefined ? {} : { deletedAt: facts.deletedAt }),
    })
    .please();
  return {
    ...record,
    branchEntry: {
      repository: storyless.repository,
      workspace: storyless.workspace,
      branch: storyless.branch,
      committedTip: baseSha,
      tree: baseSha,
      trunk: { remote: storyless.remote, target: storyless.target },
    },
  };
}

// A bound record whose attempt is gone; `settledAt` drives retention.
export function aSettledRetainedRecord(facts: {
  authority: LandingRepository;
  settledAt: string;
  preparations?: readonly LaunchLanding[];
  origin?: string;
}) {
  const reportingOrigin = facts.origin ?? origin;
  const authority = {
    repository: facts.authority.repository,
    workspace: facts.authority.workspace,
    branch: facts.authority.branch,
    remote: "origin" as const,
    target: facts.authority.target,
  };
  return makeMe.aLaunchRecord
    .adHoc({ title: "Settled retained landing" })
    .inClaudeSession({ sessionId: "settled-decision-session" })
    .inIsolatedWorkspace({
      workspace: authority.workspace,
      branch: authority.branch,
      repository: authority.repository,
    })
    .reportingThrough({
      origin: reportingOrigin,
      reference: reportingReference,
      command: "report",
    })
    .withLandingReporting({
      origin: reportingOrigin,
      authority,
      preparations: facts.preparations ? [...facts.preparations] : [],
      settledAt: facts.settledAt,
    })
    .please();
}

export function aSubmission(
  comparing: { base: string; revision: string },
  identity?: string,
) {
  const builder = makeMe.aLandingSubmission.comparing(comparing);
  if (identity !== undefined) builder.forLaunch({ identity });
  return builder.please();
}

export function aWorktreeAuthority(facts?: {
  identity?: string;
  repository?: string;
  workspace?: string;
  branch?: string;
}) {
  const builder = makeMe.aLandingAuthority
    .ofRepository(facts?.repository ?? "/repo")
    .inWorktree({
      workspace: facts?.workspace ?? "/work",
      branch: facts?.branch ?? "dough/decision",
    });
  if (facts?.identity !== undefined) builder.forStory(facts.identity);
  return builder.please();
}

export function refuse(
  run: () => Promise<unknown>,
): Promise<{ status: number; message: string }> {
  return run().then(
    () => {
      throw new Error("expected a refusal");
    },
    (error: unknown) => {
      expect(error).toBeInstanceOf(RefusedRequest);
      const refused = error as RefusedRequest;
      return { status: refused.status, message: refused.message };
    },
  );
}

// A temporary repository and worktree whose HEAD pair passes verifyLanding.
export function aVerifiedLandingWorktree() {
  const root = mkdtempSync(path.join(tmpdir(), "dough-landing-decision-"));
  onTestFinished(() => {
    rmSync(root, { recursive: true, force: true });
  });
  const repository = path.join(root, "repo");
  const workspace = path.join(root, "work");
  const gitEnv = {
    ...process.env,
    GIT_CONFIG_NOSYSTEM: "1",
    GIT_AUTHOR_NAME: "Decision",
    GIT_AUTHOR_EMAIL: "decision@example.com",
    GIT_COMMITTER_NAME: "Decision",
    GIT_COMMITTER_EMAIL: "decision@example.com",
  };
  const git = (cwd: string, ...args: string[]) =>
    execFileSync("git", args, { cwd, env: gitEnv, encoding: "utf8" });
  git(root, "init", "--quiet", "--initial-branch=main", repository);
  writeFileSync(path.join(repository, "file.txt"), "base\n");
  git(repository, "add", ".");
  git(repository, "commit", "--quiet", "--no-gpg-sign", "-m", "base");
  const base = git(repository, "rev-parse", "HEAD").trim();
  git(
    repository,
    "worktree",
    "add",
    "--quiet",
    "-b",
    "dough/decision",
    workspace,
  );
  writeFileSync(path.join(workspace, "file.txt"), "revision\n");
  git(workspace, "add", ".");
  git(workspace, "commit", "--quiet", "--no-gpg-sign", "-m", "revision");
  const revision = git(workspace, "rev-parse", "HEAD").trim();
  return {
    repository,
    workspace,
    base,
    revision,
    authority: aWorktreeAuthority({ repository, workspace }),
  };
}
