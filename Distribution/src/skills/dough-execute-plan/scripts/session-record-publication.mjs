// Session close publication. publishSessionClose publishes the work through
// the shared publisher first; only an accepted result is sealed into a record
// (sealed-session-record.mjs), then the record commit follows the same
// authorized route. The session UUID is the Dashboard launch's landing context
// `reference`, or for a native start the explicitly retained `sessionId`.
// Launch state, conversations, paths and native controls stay local and never
// enter the record. resumeSessionClose resumes a close from its first
// unfinished step, so the work is published once and the record keeps its
// original bytes even after trunk advances.
import { readFile } from "node:fs/promises";
import { publishExecutionIncrement } from "./execution-increment-publication.mjs";
import { defaultBacklogPath } from "./owned-suffix-reconciliation.mjs";
import { resumeInterruptedPublication } from "./publication-resume.mjs";
import { resolvePublicationLandingContext } from "./resolve-publication-landing-context.mjs";
import {
  publishSealedRecord,
  sealAndPublishRecord,
  sessionRecord,
  sessionRecordPath,
} from "./sealed-session-record.mjs";

export { sessionRecord, sessionRecordPath };

// The kept close identity, refused before any push when absent or conflicting.
async function closeIdentity(retained, landingContext) {
  const launched = landingContext
    ? JSON.parse(await readFile(landingContext, "utf8")).reference
    : undefined;
  if (launched && retained && launched !== retained) {
    return {
      status: "session-identity-conflict",
      error: `retained session ${retained} differs from launch reference ${launched}`,
    };
  }
  const sessionId = launched ?? retained;
  if (!sessionId) {
    return {
      status: "session-identity-missing",
      error:
        "no landing context reference or retained session id names this session",
    };
  }
  return { sessionId };
}

// The close's identity and record path, refused before any push when the
// identity is absent or conflicting.
async function closeTarget({ retained, backlogPath, ...request }) {
  const landingContext = await resolvePublicationLandingContext({
    remote: "origin",
    ...request,
  });
  const identity = await closeIdentity(retained, landingContext);
  if (!identity.sessionId) {
    return {
      refused: {
        work: { ok: false, ...identity },
        record: { status: "not-published" },
      },
    };
  }
  // An invalid UUID throws here, before the work is pushed.
  sessionRecordPath(identity.sessionId, backlogPath);
  return { sessionId: identity.sessionId, landingContext };
}

export async function publishSessionClose({
  session: { sessionId: retained, workflow, story },
  now = () => new Date(),
  backlogPath = defaultBacklogPath,
  ...request
}) {
  const target = await closeTarget({ retained, backlogPath, ...request });
  if (target.refused) return target.refused;
  const { sessionId, landingContext } = target;
  const publication = { ...request, backlogPath, landingContext };
  const work = await publishExecutionIncrement(publication);
  if (!work.ok) return { work, record: { status: "not-published" } };
  return {
    work,
    record: await sealAndPublishRecord(
      { sessionId, workflow, story, closedAt: now().toISOString() },
      { suffixBase: work.suffixBase, sha: work.receipt.sha },
      publication,
    ),
  };
}

/**
 * Resumes a close from its first unfinished step without publishing the work
 * twice. With the retained sealed `record`, only the record stage runs. Without
 * one (the work's result was lost before sealing), the retained `session`,
 * `candidateSha` and `suffixBase` confirm the work through interrupted
 * publication recovery, then the record is sealed and published. A record
 * commit rebased onto an advanced target stops as `needs-validation` like any
 * publication; rerun with `validatedCandidate` set to its candidate.
 * @param {{ record?: ReturnType<typeof sessionRecord>, session?: { sessionId?: string, workflow: string, story?: unknown }, candidateSha?: string, suffixBase?: string, now?: () => Date, workspace: string, branch: string, targetRef: string, remote?: string, backlogPath?: string, validatedCandidate?: string, landingContext?: string }} request
 */
export async function resumeSessionClose({
  record,
  session,
  candidateSha,
  suffixBase,
  now = () => new Date(),
  ...request
}) {
  if (record) {
    return {
      record: await publishSealedRecord({
        ...request,
        record: sessionRecord(record),
      }),
    };
  }
  const { remote = "origin", backlogPath = defaultBacklogPath } = request;
  const target = await closeTarget({
    retained: session.sessionId,
    ...request,
    backlogPath,
  });
  if (target.refused) return target.refused;
  const { sessionId, landingContext } = target;
  const work = await resumeInterruptedPublication({
    ownedWorkspace: request.workspace,
    candidateSha,
    suffixBase,
    remote,
    targetRef: request.targetRef,
    branch: request.branch,
    landingContext,
    backlogPath,
    publishedRevisions: [],
  });
  if (work.held) return { work, record: { status: "not-published" } };
  return {
    work,
    record: await sealAndPublishRecord(
      { ...session, sessionId, closedAt: now().toISOString() },
      { suffixBase: work.suffixBase, sha: work.acceptedSha },
      { ...request, remote, backlogPath, landingContext },
    ),
  };
}
