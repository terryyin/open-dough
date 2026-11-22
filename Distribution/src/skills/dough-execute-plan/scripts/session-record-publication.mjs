// Session close publication. publishSessionClose publishes the work through
// the shared publisher first; only an accepted result is sealed into a record
// (sealed-session-record.mjs), then the record commit follows the same
// authorized route. The session UUID is the Dashboard launch's landing context
// `reference`, or for a native start the explicitly retained `sessionId` or
// the workspace's unclosed native session evidence. The record's story is the
// session's own, else the one its landing context or native evidence names.
// Launch state, conversations, paths and native controls stay local and never
// enter the record. resumeSessionClose resumes a close from its first
// unfinished step, so the work is published once and the record keeps its
// original bytes even after trunk advances.
import { readFile } from "node:fs/promises";
import { defaultBacklogPath } from "../../dough-product-backlog/scripts/product-backlog-store.mjs";
import { publishExecutionIncrement } from "./execution-increment-publication.mjs";
import {
  closeNativeSession,
  readSessionEvidence,
} from "./execution-session-evidence.mjs";
import { resumeInterruptedPublication } from "./publication-resume.mjs";
import { resolvePublicationLandingContext } from "./resolve-publication-landing-context.mjs";
import {
  publishSealedRecord,
  sealAndPublishRecord,
  sessionRecord,
  sessionRecordPath,
} from "./sealed-session-record.mjs";
import {
  parseSharedCheckoutNote,
  sharedCheckoutNotePathBeside,
} from "./shared-checkout-note.mjs";

export { sessionRecord, sessionRecordPath };

// The Dashboard's shared-checkout note beside the landing context, if any.
async function sharedCheckoutNote(landingContext) {
  const text = await readFile(
    sharedCheckoutNotePathBeside(landingContext),
    "utf8",
  ).catch(() => undefined);
  return text === undefined ? undefined : parseSharedCheckoutNote(text);
}

// The session a close names, with the story it carries and any
// shared-checkout note beside it: a Dashboard launch's landing context, else,
// with no explicitly retained id, the workspace's unclosed native session
// evidence.
async function namedSession(retained, landingContext, workspace) {
  if (landingContext) {
    const launch = JSON.parse(await readFile(landingContext, "utf8"));
    return {
      sessionId: launch.reference,
      story: launch.identity,
      sharedCheckout: await sharedCheckoutNote(landingContext),
    };
  }
  const kept = retained ? undefined : readSessionEvidence(workspace);
  return kept && !kept.closedAt
    ? { sessionId: kept.sessionId, story: kept.story, native: true }
    : {};
}

// The close's identity, story and record path, refused before any push when
// the identity is absent or conflicting.
async function closeTarget({ retained, story, backlogPath, ...request }) {
  const landingContext = await resolvePublicationLandingContext({
    remote: "origin",
    ...request,
  });
  const named = await namedSession(retained, landingContext, request.workspace);
  const refusal = identityRefusal(retained, named.sessionId);
  if (refusal) {
    return {
      refused: {
        work: { ok: false, ...refusal },
        record: { status: "not-published" },
      },
    };
  }
  const sessionId = named.sessionId ?? retained;
  // An invalid UUID throws here, before the work is pushed.
  sessionRecordPath(sessionId, backlogPath);
  return {
    sessionId,
    story: story ?? named.story,
    native: named.native === true,
    landingContext,
    sharedCheckout: named.sharedCheckout,
  };
}

function identityRefusal(retained, named) {
  if (named && retained && named !== retained) {
    return {
      status: "session-identity-conflict",
      error: `retained session ${retained} differs from launch reference ${named}`,
    };
  }
  if (!named && !retained) {
    return {
      status: "session-identity-missing",
      error:
        "no landing context reference or retained session id names this session",
    };
  }
  return undefined;
}

// Seals the accepted close's record, closing the native session it came from
// before the record stage, so a later close in that workspace needs its own
// identity while a retry keeps the sealed record.
function sealClose(target, close, accepted, publication) {
  if (target.native)
    closeNativeSession(publication.workspace, {
      sessionId: target.sessionId,
      closedAt: close.closedAt,
    });
  return sealAndPublishRecord(
    {
      sessionId: target.sessionId,
      ...close,
      story: target.story,
      sharedCheckout: target.sharedCheckout,
    },
    accepted,
    publication,
  );
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
  const work = await publishExecutionIncrement(publication);
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
        now,
        record: sessionRecord(record),
      }),
    };
  }
  const { remote = "origin", backlogPath = defaultBacklogPath } = request;
  const target = await closeTarget({
    retained: session.sessionId,
    story: session.story,
    ...request,
    backlogPath,
  });
  if (target.refused) return target.refused;
  const { landingContext } = target;
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
    record: await sealClose(
      target,
      { workflow: session.workflow, closedAt: now().toISOString() },
      { suffixBase: work.suffixBase, sha: work.acceptedSha },
      { ...request, remote, backlogPath, landingContext, now },
    ),
  };
}
