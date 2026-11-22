// A session close record sealed from accepted work, and its publication once:
// one versioned JSON file per session UUID beside the configured backlog,
// carrying only accepted Git comparisons. Sealing fixes the UUID, close time and
// comparisons once the work is accepted; publishing a sealed record settles on an
// identical published record, reports a different one at the same UUID as a
// conflict, and otherwise sends one record commit the authorized route.
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { publishExecutionIncrement } from "./execution-increment-publication.mjs";
import { defaultBacklogPath } from "./owned-suffix-reconciliation.mjs";
import { git, originTrackingRef } from "./publication-git.mjs";
import {
  isSessionId,
  sessionRecordPathBeside,
  sessionRecordVersion,
} from "./session-record.mjs";

export function sessionRecordPath(sessionId, backlogPath = defaultBacklogPath) {
  if (!isSessionId(sessionId)) {
    throw new Error(`session id ${JSON.stringify(sessionId)} is not a UUID`);
  }
  return sessionRecordPathBeside(backlogPath, sessionId);
}

/**
 * Ranges are ordered `{ base, candidate }` full commit pairs.
 * @param {{ sessionId: string, workflow: string, closedAt: string, story?: unknown, ranges: { base: string, candidate: string }[] }} close
 */
export function sessionRecord({
  sessionId,
  workflow,
  closedAt,
  story,
  ranges,
}) {
  return {
    version: sessionRecordVersion,
    sessionId,
    workflow,
    closedAt,
    ...(story ? { story } : {}),
    ranges: ranges.map(({ base, candidate }) => ({ base, candidate })),
  };
}

// Seals the record from the accepted work, then publishes it. A record-stage
// failure still returns the sealed record so the close can resume.
export async function sealAndPublishRecord(
  { sessionId, workflow, story, closedAt },
  { suffixBase, sha },
  publication,
) {
  const record = sessionRecord({
    sessionId,
    workflow,
    closedAt,
    story,
    ranges: [{ base: suffixBase, candidate: sha }],
  });
  return publishSealedRecord({
    ...publication,
    record,
    validatedCandidate: undefined,
  });
}

const recordBytes = (record) => `${JSON.stringify(record, null, 2)}\n`;

async function publishedBytes({ workspace, remote, targetRef }, path) {
  await git(workspace, "fetch", remote);
  try {
    return (
      await git(
        workspace,
        "show",
        `${originTrackingRef(targetRef, remote)}:${path}`,
      )
    ).stdout;
  } catch {
    return undefined;
  }
}

// Commits the record once; a rerun finds it already committed.
async function commitRecord(workspace, path, record) {
  const file = join(workspace, path);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, recordBytes(record));
  // The record is published content even where the project's own directory
  // is ignored, as for a project below an ignoring Git toplevel.
  await git(workspace, "add", "--force", "--", path);
  const pending = (await git(workspace, "status", "--porcelain", "--", path))
    .stdout;
  if (!pending.trim()) return;
  await git(
    workspace,
    "commit",
    "-m",
    `Record session ${record.sessionId}`,
    "--",
    path,
  );
}

// Publishes a sealed record after its work was accepted. A commit or
// publication that throws stops the record stage with the sealed record kept,
// so the close can resume.
export async function publishSealedRecord({
  record,
  remote = "origin",
  backlogPath = defaultBacklogPath,
  ...request
}) {
  const path = sessionRecordPath(record.sessionId, backlogPath);
  const publication = { ...request, remote, backlogPath };
  try {
    return await sendRecord(publication, path, record);
  } catch (error) {
    return {
      status: "stopped",
      path,
      record,
      error: error.message,
      ...(error.code ? { code: error.code, stage: error.stage } : {}),
    };
  }
}

async function sendRecord(publication, path, record) {
  const accepted = await publishedBytes(publication, path);
  if (accepted !== undefined) {
    const identical = accepted === recordBytes(record);
    return {
      status: identical ? "published" : "session-record-conflict",
      path,
      record,
      publication: { ok: identical, pushCount: 0 },
    };
  }
  await commitRecord(publication.workspace, path, record);
  // The record commit's parent is the accepted tip it was committed or
  // last rebased onto: the session's last range, or the integrated trunk.
  const recordBase = (
    await git(publication.workspace, "rev-parse", "HEAD^")
  ).stdout.trim();
  const published = await publishExecutionIncrement({
    ...publication,
    previouslyPublishedBase: recordBase,
    // A record commit is never the launch's landing, even while its landing
    // expectation is still open.
    landingContext: null,
  });
  return {
    status: published.ok ? "published" : "stopped",
    path,
    record,
    publication: published,
  };
}
