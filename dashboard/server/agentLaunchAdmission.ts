// Local launch admission verifies dashboard origin and known projects for
// launches, continuations, reconciliation, verification and session actions.
// Delete, terminal attachment and native Done require an existing folder;
// reported local Done needs only the retained session.
// Launch options follow installed definitions and policy follows installed startup.
// Reads cover attempts, sessions, reports and host choices; only terminal admission
// reads native session availability.

import { completionEndpoint } from "./completionReporting.ts";
import { admitLaunchSettings } from "./launchSettingsAdmission.ts";
import { launchHostOptionsEndpoint } from "../src/launchHostOptions.ts";
import { sessionHostSchema } from "../src/sessionReference.ts";
import { sessionResultEndpoint } from "../src/sessionResult.ts";
import { launchHost } from "./launchHosts.ts";
import type { IncomingMessage } from "node:http";
import { z } from "zod";
import {
  agentAcceptEndpoint,
  agentChangedEndpoint,
  agentContinueEndpoint,
  agentLaunchEndpoint,
  agentLaunchRequestSchema,
  agentReconciledEndpoint,
  agentVerifyEndpoint,
  attemptRequestSchema,
  launchKindName,
  type AgentLaunchRequest,
  type LaunchRecord,
} from "../src/agentLaunch.ts";
import { agentDeleteEndpoint } from "../src/deleteRecord.ts";
import { agentDoneEndpoint } from "../src/doneMark.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import type { AgentLaunches } from "./agentLaunches.ts";
import { withSelectedOptions } from "./launchOptions.ts";
import { withSessionPolicy } from "./launchSessionPolicy.ts";
import { RefusedRequest, verifyLocalOrigin } from "./localOrigin.ts";
import {
  projectFolder,
  folderExists,
  type ProjectFolder,
} from "./projectFolders.ts";
import { jsonBody } from "./jsonRequestBody.ts";
import {
  knownSource,
  namedSession,
  resultRequest,
} from "./sessionAdmission.ts";

export type Admitted =
  | { readonly kind: "sessions" }
  | {
      readonly kind: "host-options";
      readonly cwd?: string;
      readonly host: NonNullable<ReturnType<typeof launchHost>>;
    }
  | { readonly kind: "result"; readonly record: LaunchRecord }
  | { readonly kind: "changed"; readonly attempt: string }
  | {
      // Answered once the launch is accepted.
      readonly kind: "accept";
      readonly source: PublishedSource;
      readonly request: AgentLaunchRequest;
    }
  | {
      // A continuation, answered once the kept attempt is accepted again, a
      // note that a settled attempt a page found reconciled with published
      // state, or a verification of an uncertain launch.
      readonly kind: "continue" | "reconciled" | "verify";
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
    };

async function doneRequest(
  req: IncomingMessage,
  launches: AgentLaunches,
): Promise<Admitted> {
  const { source, record, folder } = await namedSession(req, launches, "done");
  if (
    record.completion === undefined &&
    launchHost(record.session.host)?.stop === undefined
  ) {
    throw new RefusedRequest(400, "This host cannot mark a session done.");
  }
  return { kind: "done", source, record, folder };
}

async function deleteRequest(
  req: IncomingMessage,
  launches: AgentLaunches,
): Promise<Admitted> {
  const { source, record } = await namedSession(req, launches, "delete");
  return { kind: "delete", source, record };
}

// A request about one of the project's kept attempts.
async function attemptRequest(
  req: IncomingMessage,
  kind: "continue" | "reconciled" | "verify",
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
  [agentDoneEndpoint, doneRequest],
  [agentDeleteEndpoint, deleteRequest],
  [agentAcceptEndpoint, launchRequest],
  [agentContinueEndpoint, (req) => attemptRequest(req, "continue")],
  [agentReconciledEndpoint, (req) => attemptRequest(req, "reconciled")],
  [agentVerifyEndpoint, (req) => attemptRequest(req, "verify")],
]);

// Every path whose requests this boundary admits or refuses.
export const launchBoundaryPaths: ReadonlySet<string> = new Set([
  completionEndpoint,
  launchHostOptionsEndpoint,
  sessionResultEndpoint,
  agentLaunchEndpoint,
  agentChangedEndpoint,
  ...postRequests.keys(),
]);

export async function admitted(
  req: IncomingMessage,
  url: URL,
  launches: AgentLaunches,
): Promise<Admitted> {
  verifyLocalOrigin(req);
  if (url.pathname === sessionResultEndpoint) {
    if (req.method !== "GET")
      throw new RefusedRequest(405, "Only GET is accepted here.");
    return resultRequest(url);
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
  if (url.pathname === launchHostOptionsEndpoint) {
    const source = knownSource(url.searchParams.get("source"));
    const identity = sessionHostSchema.safeParse(url.searchParams.get("host"));
    const host = identity.success ? launchHost(identity.data) : undefined;
    if (host?.options === undefined)
      throw new RefusedRequest(400, "This host cannot offer startup choices.");
    if (!(await folderExists(projectFolder(source))))
      throw new RefusedRequest(
        404,
        "The project folder is not available on this machine.",
      );
    return {
      kind: "host-options",
      host,
      ...(url.searchParams.get("context") === "project"
        ? { cwd: projectFolder(source).path }
        : {}),
    };
  }
  if (url.pathname === agentChangedEndpoint) {
    const attempt = z.uuid().safeParse(url.searchParams.get("attempt"));
    if (!attempt.success) {
      throw new RefusedRequest(400, "The attempt request is malformed.");
    }
    return { kind: "changed", attempt: attempt.data };
  }
  return { kind: "sessions" };
}

export { admittedAttach } from "./terminalAdmission.ts";
