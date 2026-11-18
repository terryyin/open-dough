// An explicit entry identifies an existing checkout and fixes the files the
// launch found there, using only the original launch's repository.
import type { IncomingMessage } from "node:http";
import path from "node:path";
import { z } from "zod";
import type { LaunchRecord } from "../src/launchRecord.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { commitIdSchema } from "../src/launchLanding.ts";
import { sessionHostSchema } from "../src/sessionReference.ts";
import {
  branchPinOwner,
  type SessionBranchEntry,
} from "../src/sessionBranchResult.ts";
import { isReportingRecord } from "./completionAdmission.ts";
import { defaultGitOutputLimit, runGit } from "./gitRunner.ts";
import { jsonBody } from "./jsonRequestBody.ts";
import {
  keepBranchEntryRefs,
  releaseBranchEntryRefs,
} from "./launchRecordPins.ts";
import { changeSessionRecord, keptRecords } from "./launchRecordStore.ts";
import { RefusedRequest, verifyLocalOrigin } from "./localOrigin.ts";
import {
  knownSource,
  namedKeptSession,
  noSuchSession,
} from "./sessionAdmission.ts";
import { readBranchWorkspace } from "./sessionBranchCapture.ts";
import { resolvedCheckout } from "./sessionCommitsCapture.ts";

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
type BranchRequest = z.infer<typeof requestSchema>;

function branchEntryConflict(): RefusedRequest {
  return new RefusedRequest(
    409,
    "This session already identified a different branch or workspace.",
  );
}

function existingEntry(
  record: LaunchRecord,
  workspace: string,
  branch: string,
) {
  const entry = record.branchEntry;
  if (
    entry !== undefined &&
    (entry.workspace !== workspace || entry.branch !== branch)
  )
    throw branchEntryConflict();
  return entry;
}

function entryRepository(record: LaunchRecord): string {
  const repository = record.defaultStart?.repository;
  if (record.request.workflow !== "ad-hoc" || repository === undefined)
    throw new RefusedRequest(
      409,
      "This launch has no recorded Default main repository for a branch handoff.",
    );
  if (record.doneAt !== undefined)
    throw new RefusedRequest(
      409,
      "Identify the branch while the session is still open.",
    );
  return repository;
}

async function namedLaunch(
  source: PublishedSource,
  request: BranchRequest,
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

async function verifyRegisteredWorkspace(
  repository: string,
  workspace: string,
  branch: string,
) {
  const listed = (
    await runGit(["worktree", "list", "--porcelain", "-z"], {
      cwd: repository,
      maxBuffer: defaultGitOutputLimit,
      signal: AbortSignal.timeout(30_000),
    })
  ).stdout;
  const registered = listed.split("\0\0").some((record) => {
    const fields = record.split("\0");
    return (
      fields[0] === `worktree ${workspace}` &&
      fields.includes(`branch refs/heads/${branch}`)
    );
  });
  if (!registered)
    throw new Error("This branch and path are not a registered worktree pair.");
}

async function defaultTipOf(record: LaunchRecord, repository: string) {
  const ref = record.defaultStart?.branch;
  if (ref === undefined) return undefined;
  const tip = await runGit(["rev-parse", "--verify", `${ref}^{commit}`], {
    cwd: repository,
    maxBuffer: defaultGitOutputLimit,
    signal: AbortSignal.timeout(30_000),
  }).catch(() => undefined);
  const parsed = commitIdSchema.safeParse(tip?.stdout.trim());
  return parsed.success ? parsed.data : undefined;
}

async function recordEntry(
  source: PublishedSource,
  record: LaunchRecord,
  request: BranchRequest,
): Promise<SessionBranchEntry> {
  const workspace = (() => {
    try {
      return resolvedCheckout(request.workspace);
    } catch {
      return path.resolve(request.workspace);
    }
  })();
  const { branch } = request;
  const previous = existingEntry(record, workspace, branch);
  if (previous !== undefined) return previous;
  const repository = entryRepository(record);
  if (branch === source.ref.replace(/^refs\/heads\//, ""))
    throw new RefusedRequest(
      409,
      "Identify your own branch after leaving the project's trunk.",
    );
  const place = { repository, workspace, branch };
  let proposed: SessionBranchEntry;
  try {
    await verifyRegisteredWorkspace(repository, workspace, branch);
    const [{ committedTip, tree }, defaultTip] = await Promise.all([
      readBranchWorkspace(place),
      defaultTipOf(record, repository),
    ]);
    proposed = { ...place, committedTip, tree, defaultTip };
  } catch {
    throw new RefusedRequest(
      409,
      "This checkout does not hold the named branch in the launch's registered repository, or its entry state could not be captured.",
    );
  }
  const owner = branchPinOwner(record);
  const evidence = { pinning: false };
  try {
    const written = await changeSessionRecord(
      source.id,
      record.session,
      async (current) => {
        if (current.launchedAt !== record.launchedAt) throw noSuchSession();
        if (existingEntry(current, workspace, branch) !== undefined)
          return current;
        if (entryRepository(current) !== repository)
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

export async function submitSessionBranchEntry(req: IncomingMessage) {
  verifyLocalOrigin(req);
  if (req.method !== "POST")
    throw new RefusedRequest(405, "Only POST is accepted here.");
  const parsed = requestSchema.safeParse(await jsonBody(req));
  if (!parsed.success)
    throw new RefusedRequest(400, "The branch handoff request is malformed.");
  const request = parsed.data;
  const source = knownSource(request.source);
  const record = await namedLaunch(
    source,
    request,
    `http://${req.headers.host}`,
  );
  const entry = await recordEntry(source, record, request);
  return { session: record.session.sessionId, branchEntry: entry };
}
