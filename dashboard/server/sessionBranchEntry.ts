// An explicit entry identifies an existing checkout and keeps, with its pins,
// the entry state proposed for the launch.
import { randomUUID } from "node:crypto";
import type { IncomingMessage } from "node:http";
import path from "node:path";
import { z } from "zod";
import type { LaunchRecord } from "../src/launchRecord.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { sessionHostSchema } from "../src/sessionReference.ts";
import {
  branchPinOwner,
  sessionBranchEntryEndpoint,
  type SessionBranchEntry,
} from "../src/sessionBranchResult.ts";
import {
  type BranchPlace,
  entryRepository,
  existingEntry,
  proposeBranchEntry,
} from "./branchEntryProposal.ts";
import {
  acceptBranchLandingAnswer,
  branchLandingContext,
} from "./branchLandingContext.ts";
import { isReportingRecord } from "./completionAdmission.ts";
import { textBody } from "./jsonRequestBody.ts";
import {
  keepBranchEntryRefs,
  releaseBranchEntryRefs,
} from "./launchRecordPins.ts";
import { changeSessionRecord, keptRecords } from "./launchRecordStore.ts";
import {
  RefusedRequest,
  verifyLocalOrigin,
  verifySameOrigin,
} from "./localOrigin.ts";
import { machineDashboardPath } from "./machineHome.ts";
import {
  knownSource,
  namedKeptSession,
  noSuchSession,
} from "./sessionAdmission.ts";

const branchRequest = z.strictObject({
  source: z.string().min(1),
  host: sessionHostSchema,
  workspace: z.string().refine((workspace) => path.isAbsolute(workspace)),
  branch: z.string().min(1),
});
const requestSchema = z.union([
  branchRequest.extend({ reference: z.uuid() }),
  branchRequest.extend({ session: z.string().min(1) }),
]);
export type BranchEntrySubmission = z.infer<typeof requestSchema>;

export type BranchEntryRequestAdmission = {
  readonly route: string;
  readonly method: string | undefined;
  readonly origin: string | null | undefined;
  readonly host: string | undefined;
  readonly bodyText: string;
};

export type AdmittedBranchEntryRequest = {
  readonly origin: string;
  readonly submission: BranchEntrySubmission;
};

export type SessionBranchEntryReceipt = {
  readonly session: string;
  readonly branchEntry: SessionBranchEntry;
  readonly landingContext?: string;
};

// Admits a branch-entry request from its wire values: the branch-entry route,
// POST, same-origin Origin against Host, and a body matching the submission.
export function admitSessionBranchEntryRequest(
  request: BranchEntryRequestAdmission,
): AdmittedBranchEntryRequest {
  if (request.route !== sessionBranchEntryEndpoint) {
    throw new RefusedRequest(404, "This is not a branch handoff route.");
  }
  if (request.method !== "POST") {
    throw new RefusedRequest(405, "Only POST is accepted here.");
  }
  verifySameOrigin(request.origin, request.host);
  let parsed: unknown;
  try {
    parsed = JSON.parse(request.bodyText);
  } catch {
    throw new RefusedRequest(400, "The branch handoff request is malformed.");
  }
  const submission = requestSchema.safeParse(parsed);
  if (!submission.success) {
    throw new RefusedRequest(400, "The branch handoff request is malformed.");
  }
  return {
    origin: `http://${request.host ?? ""}`,
    submission: submission.data,
  };
}

async function namedLaunch(
  source: PublishedSource,
  request: BranchEntrySubmission,
  origin: string,
) {
  if ("session" in request)
    return namedKeptSession(source, {
      host: request.host,
      sessionId: request.session,
    });
  const record = (await keptRecords(source.id)).find(
    (candidate) =>
      isReportingRecord(candidate, request) &&
      candidate.request.reporting?.origin === origin,
  );
  if (record === undefined) throw noSuchSession();
  return record;
}

// Records the checkout the kept launch `record` names as its own branch,
// pinning the entry state, and answers the entry kept.
export async function recordSessionBranchEntry(
  source: Pick<PublishedSource, "id" | "ref">,
  record: LaunchRecord,
  request: BranchPlace,
): Promise<SessionBranchEntry> {
  const { kept, entry: proposed } = await proposeBranchEntry(
    source.ref,
    record,
    request,
  );
  if (kept) return proposed;
  const owner = branchPinOwner(record);
  const evidence = { pinning: false };
  try {
    const written = await changeSessionRecord(
      source.id,
      record.session,
      async (current) => {
        if (current.launchedAt !== record.launchedAt) throw noSuchSession();
        if (existingEntry(current, proposed) !== undefined) return current;
        if (entryRepository(current) !== proposed.repository)
          throw new RefusedRequest(
            409,
            "This launch no longer names that repository.",
          );
        evidence.pinning = true;
        await keepBranchEntryRefs(owner, proposed);
        return { ...current, branchEntry: proposed };
      },
    );
    if (written?.branchEntry === undefined) throw noSuchSession();
    return written.branchEntry;
  } catch (error) {
    if (evidence.pinning)
      await releaseBranchEntryRefs(owner, proposed).catch(() => undefined);
    throw error;
  }
}

export async function handleSessionBranchEntry(
  request: BranchEntrySubmission,
  origin: string,
  sourceOf: (id: string) => PublishedSource = knownSource,
): Promise<SessionBranchEntryReceipt> {
  const source = sourceOf(request.source);
  const record = await namedLaunch(source, request, origin);
  const entry = await recordSessionBranchEntry(source, record, request);
  const reference = record.request.reporting?.reference ?? randomUUID();
  const answered = await branchLandingContext(
    machineDashboardPath("reporting", reference, "branch-landing"),
    { ...record, branchEntry: entry },
    { origin, source: source.id, reference },
  );
  let landingContext: string | undefined;
  if (answered !== undefined) {
    await changeSessionRecord(source.id, record.session, (current) =>
      acceptBranchLandingAnswer(current, answered.record),
    );
    landingContext = answered.file;
  }
  return {
    session: record.session.sessionId,
    branchEntry: entry,
    ...(landingContext === undefined ? {} : { landingContext }),
  };
}

export async function submitSessionBranchEntry(
  req: IncomingMessage,
): Promise<SessionBranchEntryReceipt> {
  verifyLocalOrigin(req);
  const host = req.headers.host;
  const { origin, submission } = admitSessionBranchEntryRequest({
    route: new URL(req.url ?? "", `http://${host ?? "local"}`).pathname,
    method: req.method,
    origin: req.headers.origin,
    host,
    bodyText: req.method === "POST" ? await textBody(req) : "",
  });
  return handleSessionBranchEntry(submission, origin);
}
