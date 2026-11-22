// Session close publication. publishSessionClose publishes the work through
// the shared publisher first; only an accepted result is sealed into a record
// (sealed-session-record.mjs), then the record commit follows the same
// authorized route. The session's identity and story come from
// session-close-identity.mjs.
// Launch state, conversations, paths and native controls stay local and never
// enter the record. resumeSessionClose resumes a close from its first
// unfinished step, so the work is published once and the record keeps its
// original bytes even after trunk advances. Each close saves its exact
// comparison before every work push and its sealed record before publishing
// it, locally per session (session-close-state.mjs), so a resume needs only
// the session's identity.
import { defaultBacklogPath } from "../../dough-product-backlog/scripts/product-backlog-store.mjs";
import { publishExecutionIncrement } from "./execution-increment-publication.mjs";
import { closeNativeSession } from "./execution-session-evidence.mjs";
import { resumeInterruptedPublication } from "./publication-resume.mjs";
import {
  publishSealedRecord,
  sealRecord,
  sessionRecord,
  sessionRecordPath,
} from "./sealed-session-record.mjs";
import { closeTarget } from "./session-close-identity.mjs";
import { readCloseState, saveCloseState } from "./session-close-state.mjs";

export { sessionRecord, sessionRecordPath };

// Seals the accepted close's record and saves it before publishing, closing
// the native session it came from before the record stage, so a later close
// in that workspace needs its own identity while a retry keeps the sealed
// record.
function sealClose(target, close, accepted, publication) {
  if (target.native)
    closeNativeSession(publication.workspace, {
      sessionId: target.sessionId,
      closedAt: close.closedAt,
    });
  const record = sealRecord(
    {
      sessionId: target.sessionId,
      ...close,
      story: target.story,
      sharedCheckout: target.sharedCheckout,
    },
    accepted,
  );
  saveCloseState(publication.workspace, target.sessionId, { record });
  return publishSealedRecord({
    ...publication,
    record,
    validatedCandidate: undefined,
  });
}

// Publishes a record sealed by an earlier close attempt, keeping its bytes.
function publishRetained(record, request) {
  return publishSealedRecord({ ...request, record: sessionRecord(record) });
}

export async function publishSessionClose({
  session: { sessionId: retained, workflow, story },
  now = () => new Date(),
  backlogPath = defaultBacklogPath,
  ...request
}) {
  const target = await closeTarget({
    retained,
    story,
    backlogPath,
    ...request,
  });
  if (target.refused) return target.refused;
  const { landingContext } = target;
  const publication = { ...request, backlogPath, landingContext };
  const work = await publishExecutionIncrement({
    ...publication,
    beforePush: async (comparison) => {
      const { candidate, suffixBase } = comparison;
      saveCloseState(request.workspace, target.sessionId, {
        candidate,
        suffixBase,
      });
      await request.beforePush?.(comparison);
    },
  });
  if (!work.ok) return { work, record: { status: "not-published" } };
  return {
    work,
    record: await sealClose(
      target,
      { workflow, closedAt: now().toISOString() },
      { suffixBase: work.suffixBase, sha: work.receipt.sha },
      { ...publication, now },
    ),
  };
}

/**
 * Resumes a close from its first unfinished step without publishing the work
 * twice. With the sealed `record`, only the record stage runs. Without one
 * (the work's result was lost before sealing), `candidateSha` and
 * `suffixBase` confirm the work through interrupted publication recovery, then
 * the record is sealed and published. Whatever the caller does not supply
 * comes from the state the session's close saved in this workspace, found by
 * the `session` identity or the landing context's reference. A record
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
  if (record)
    return { record: await publishRetained(record, { ...request, now }) };
  const { remote = "origin", backlogPath = defaultBacklogPath } = request;
  const target = await closeTarget({
    retained: session.sessionId,
    story: session.story,
    ...request,
    backlogPath,
  });
  if (target.refused) return target.refused;
  const { landingContext } = target;
  const saved = readCloseState(request.workspace, target.sessionId) ?? {};
  if (saved.record && !candidateSha)
    return { record: await publishRetained(saved.record, { ...request, now }) };
  const work = await resumeInterruptedPublication({
    ownedWorkspace: request.workspace,
    candidateSha: candidateSha ?? saved.candidate,
    suffixBase: candidateSha ? suffixBase : saved.suffixBase,
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
    record: await sealClose(
      target,
      { workflow: session.workflow, closedAt: now().toISOString() },
      { suffixBase: work.suffixBase, sha: work.acceptedSha },
      { ...request, remote, backlogPath, landingContext, now },
    ),
  };
}
