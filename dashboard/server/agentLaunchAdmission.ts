// Local launch admission verifies the dashboard origin and known project for
// launches, continuations, done marks, deletion and terminal upgrades. Done,
// delete and upgrade also require a recorded session in an existing folder.
// Launch options follow the installed definition (`./launchOptions.ts`) and
// policy follows installed startup (`./launchSessionPolicy.ts`). Reads cover
// attempts, sessions, reports and host choices; only terminal admission reads
// native session availability.

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
  agentLaunchRequestSchema,
  continueRequestSchema,
  attachOpens,
  launchKindName,
  type AgentLaunchRequest,
  type LaunchRecord,
} from "../src/agentLaunch.ts";
import {
  agentDeleteEndpoint,
  deleteRecordRequestSchema,
} from "../src/deleteRecord.ts";
import { agentDoneEndpoint, markDoneRequestSchema } from "../src/doneMark.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import type { AgentLaunches } from "./agentLaunches.ts";
import type { TerminalSession } from "./agentTerminals.ts";
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
  recordedSession,
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
      // Answered once the kept attempt is accepted again.
      readonly kind: "continue";
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
  const parsed = markDoneRequestSchema.safeParse(await jsonBody(req));
  if (!parsed.success) {
    throw new RefusedRequest(400, "The done request is malformed.");
  }
  const source = knownSource(parsed.data.source);
  const { record, folder } = await recordedSession(launches, source, {
    sessionId: parsed.data.session,
    host: parsed.data.host,
  });
  if (launchHost(record.session.host)?.stop === undefined) {
    throw new RefusedRequest(400, "This host cannot mark a session done.");
  }
  return { kind: "done", source, record, folder };
}

async function deleteRequest(
  req: IncomingMessage,
  launches: AgentLaunches,
): Promise<Admitted> {
  const parsed = deleteRecordRequestSchema.safeParse(await jsonBody(req));
  if (!parsed.success) {
    throw new RefusedRequest(400, "The delete request is malformed.");
  }
  const source = knownSource(parsed.data.source);
  const { record } = await recordedSession(launches, source, {
    sessionId: parsed.data.session,
    host: parsed.data.host,
  });
  return { kind: "delete", source, record };
}

async function continueRequest(req: IncomingMessage): Promise<Admitted> {
  const parsed = continueRequestSchema.safeParse(await jsonBody(req));
  if (!parsed.success) {
    throw new RefusedRequest(400, "The continue request is malformed.");
  }
  return {
    kind: "continue",
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
  const postOnly = new Map([
    [agentDoneEndpoint, () => doneRequest(req, launches)],
    [agentDeleteEndpoint, () => deleteRequest(req, launches)],
    [agentAcceptEndpoint, () => launchRequest(req)],
    [agentContinueEndpoint, () => continueRequest(req)],
  ]).get(url.pathname);
  if (postOnly !== undefined) {
    if (req.method !== "POST") {
      throw new RefusedRequest(405, "Only POST is accepted here.");
    }
    return postOnly();
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

// An upgrade attaches only a kept session through its host’s supported
// operation, in an existing folder, unless the host confirms it unavailable.
export async function admittedAttach(
  req: IncomingMessage,
  url: URL,
  launches: AgentLaunches,
): Promise<TerminalSession> {
  verifyLocalOrigin(req);
  const source = knownSource(url.searchParams.get("source"));
  const host = sessionHostSchema.safeParse(
    url.searchParams.get("host") ?? "claude",
  );
  if (!host.success)
    throw new RefusedRequest(400, "The session host is malformed.");
  const { record, folder } = await recordedSession(launches, source, {
    sessionId: url.searchParams.get("session") ?? "",
    host: host.data,
  });
  const hostBoundary = launchHost(record.session.host);
  if (hostBoundary?.attach === undefined) {
    throw new RefusedRequest(
      400,
      "This host cannot open an embedded terminal.",
    );
  }
  const joined = await launches.stateOf(source, record);
  if (!attachOpens(joined.sessionState)) {
    throw new RefusedRequest(
      410,
      hostBoundary.description.unavailableSessionExplanation ??
        `The session is no longer available in ${hostBoundary.description.name}.`,
    );
  }
  return {
    sourceId: source.id,
    session: record.session,
    markedDone: record.doneAt !== undefined,
    folder,
  };
}
