// Local admission for launch, continuation, update-worktree, reconciliation,
// verification, recovery and session actions.

import {
  landingEndpoint,
  landingPrepareEndpoint,
} from "./launchLandingReporting.ts";
import { completionEndpoint } from "./completionReporting.ts";
import {
  admitLaunchSettings,
  hostOptionsRequest,
  type AdmittedHostOptions,
} from "./launchSettingsAdmission.ts";
import { launchHostOptionsEndpoint } from "../src/launchHostOptions.ts";
import { cursorRunnerSessionsEndpoint } from "../src/cursorRunnerSessions.ts";
import { finalReportEndpoint } from "../src/finalReportContract.ts";
import { storyReviewMarkEndpoint } from "../src/storyReviewContract.ts";
import {
  markReviewedRequest,
  type AdmittedReviewedFile,
  type AdmittedStoryReview,
  type AdmittedStoryReviewRange,
} from "./storyReviewAdmission.ts";
import { storyReviewExactReads } from "./storyReviewExactReads.ts";
import type { AdmittedStoryReviewMark } from "./storyReviewMarks.ts";
import { launchHost } from "./launchHosts.ts";
import type { IncomingMessage } from "node:http";
import {
  agentAcceptEndpoint,
  agentChangedEndpoint,
  agentContinueEndpoint,
  agentLaunchEndpoint,
  agentLaunchRequestSchema,
  agentReconciledEndpoint,
  agentUpdateWorktreeEndpoint,
  agentVerifyEndpoint,
  attemptRequestSchema,
  launchKindName,
  type AgentLaunchRequest,
  type LaunchRecord,
} from "../src/agentLaunch.ts";
import { agentDeleteEndpoint } from "../src/deleteRecord.ts";
import { agentDoneEndpoint } from "../src/doneMark.ts";
import { agentReadEndpoint } from "../src/readMark.ts";
import { agentRecoverEndpoint } from "../src/sessionRecovery.ts";
import { agentStopEndpoint } from "../src/sessionStop.ts";
import type { CompletionReport } from "../src/completionReport.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import type { AgentLaunches } from "./agentLaunches.ts";
import {
  changedRequest,
  type AdmittedChanged,
} from "./launchAttemptChanges.ts";
import { withSelectedOptions } from "./launchOptions.ts";
import { withSessionPolicy } from "./launchSessionPolicy.ts";
import { RefusedRequest, verifyLocalOrigin } from "./localOrigin.ts";
import { projectFolder, type ProjectFolder } from "./projectFolders.ts";
import { jsonBody } from "./jsonRequestBody.ts";
import {
  deleteRequest,
  doneRequest,
  knownSource,
  readRequest,
  recoverRequest,
  stopRequest,
} from "./sessionAdmission.ts";
import {
  finalReportRequest,
  type AdmittedFinalReport,
} from "./finalReportAdmission.ts";

export type Admitted =
  | { readonly kind: "sessions" }
  | { readonly kind: "drain" }
  | { readonly kind: "cursor-sessions" }
  | AdmittedHostOptions
  | AdmittedFinalReport
  | AdmittedStoryReview
  | AdmittedStoryReviewRange
  | AdmittedReviewedFile
  | AdmittedStoryReviewMark
  | AdmittedChanged
  | {
      // Answered once the launch is accepted.
      readonly kind: "accept";
      readonly source: PublishedSource;
      readonly request: AgentLaunchRequest;
    }
  | {
      // Continue, reconcile, verify, or update-worktree-and-retry one attempt.
      readonly kind: "continue" | "reconciled" | "verify" | "update-worktree";
      readonly source: PublishedSource;
      readonly attempt: string;
    }
  | {
      readonly kind: "done";
      readonly source: PublishedSource;
      readonly record: LaunchRecord;
      readonly folder: ProjectFolder;
    }
  | {
      readonly kind: "delete";
      readonly source: PublishedSource;
      readonly record: LaunchRecord;
    }
  | {
      readonly kind: "recover";
      readonly source: PublishedSource;
      readonly record: LaunchRecord;
    }
  | {
      readonly kind: "stop";
      readonly source: PublishedSource;
      readonly record: LaunchRecord;
      readonly folder: ProjectFolder;
    }
  | {
      // A read mark on a session whose report is unread.
      readonly kind: "read";
      readonly source: PublishedSource;
      readonly record: LaunchRecord & {
        readonly completion: CompletionReport;
      };
    };

// A request about one of the project's kept attempts.
async function attemptRequest(
  req: IncomingMessage,
  kind: "continue" | "reconciled" | "verify" | "update-worktree",
): Promise<Admitted> {
  const parsed = attemptRequestSchema.safeParse(await jsonBody(req));
  if (!parsed.success) {
    throw new RefusedRequest(400, `The ${kind} request is malformed.`);
  }
  return {
    kind,
    source: knownSource(parsed.data.source),
    attempt: parsed.data.attempt,
  };
}

async function launchRequest(req: IncomingMessage): Promise<Admitted> {
  const parsed = agentLaunchRequestSchema.safeParse(await jsonBody(req));
  if (!parsed.success) {
    throw new RefusedRequest(400, "The launch request is malformed.");
  }
  const request = parsed.data;
  // Only the server's own feedback maintenance check marks a launch as one.
  if (request.workflow === "ad-hoc" && request.maintenance !== undefined) {
    throw new RefusedRequest(400, "The launch request is malformed.");
  }
  const source = knownSource(request.source);
  const host = launchHost(request.host);
  if (host === undefined) {
    throw new RefusedRequest(
      400,
      `${launchKindName(request.workflow)} cannot be launched in this host.`,
    );
  }
  const project = projectFolder(source);
  await admitLaunchSettings(request, host);
  const selected = await withSelectedOptions(request, project);
  return {
    kind: "accept",
    source,
    request: await withSessionPolicy(selected, project),
  };
}

// The requests only a POST may make, by path.
const postRequests = new Map<
  string,
  (req: IncomingMessage, launches: AgentLaunches) => Promise<Admitted>
>([
  ["/__agent-launch/drain", () => Promise.resolve({ kind: "drain" })],
  [agentDoneEndpoint, doneRequest],
  [agentReadEndpoint, readRequest],
  [agentDeleteEndpoint, deleteRequest],
  [agentRecoverEndpoint, recoverRequest],
  [agentStopEndpoint, stopRequest],
  [storyReviewMarkEndpoint, markReviewedRequest],
  [agentAcceptEndpoint, launchRequest],
  [agentContinueEndpoint, (req) => attemptRequest(req, "continue")],
  [agentReconciledEndpoint, (req) => attemptRequest(req, "reconciled")],
  [agentVerifyEndpoint, (req) => attemptRequest(req, "verify")],
  [
    agentUpdateWorktreeEndpoint,
    (req) => attemptRequest(req, "update-worktree"),
  ],
]);

// The reads only a GET may make with exactly their parameters, by path.
const exactReads = new Map<string, (url: URL) => Admitted | Promise<Admitted>>([
  [agentChangedEndpoint, changedRequest],
  [finalReportEndpoint, finalReportRequest],
  ...storyReviewExactReads,
]);

// Every path whose requests this boundary admits or refuses.
export const launchBoundaryPaths: ReadonlySet<string> = new Set([
  completionEndpoint,
  landingEndpoint,
  landingPrepareEndpoint,
  launchHostOptionsEndpoint,
  agentLaunchEndpoint,
  ...exactReads.keys(),
  cursorRunnerSessionsEndpoint,
  ...postRequests.keys(),
]);

export async function admitted(
  req: IncomingMessage,
  url: URL,
  launches: AgentLaunches,
): Promise<Admitted> {
  verifyLocalOrigin(req);
  const exactRead = exactReads.get(url.pathname);
  if (exactRead !== undefined) {
    if (req.method !== "GET")
      throw new RefusedRequest(405, "Only GET is accepted here.");
    return exactRead(url);
  }
  const postOnly = postRequests.get(url.pathname);
  if (postOnly !== undefined) {
    if (req.method !== "POST") {
      throw new RefusedRequest(405, "Only POST is accepted here.");
    }
    return postOnly(req, launches);
  }
  if (req.method !== "GET") {
    throw new RefusedRequest(405, "Only GET is accepted here.");
  }
  if (url.pathname === launchHostOptionsEndpoint)
    return hostOptionsRequest(url);
  if (url.pathname === cursorRunnerSessionsEndpoint) {
    return { kind: "cursor-sessions" };
  }
  return { kind: "sessions" };
}

export { admittedAttach } from "./terminalAdmission.ts";
