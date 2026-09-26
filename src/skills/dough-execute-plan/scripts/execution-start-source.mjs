// The selected source a start reads from fetched trunk: queued work, or
// admission of accepted work that no backlog list holds yet.
import { readAdmissionSource } from "./execution-admission-source.mjs";
import {
  maintenance,
  reportedMaintenance,
} from "./execution-start-maintenance.mjs";
import { readPublishedExecutionSource } from "./execution-source.mjs";
import { sameSelectedSource } from "./execution-start-recovery.mjs";
import {
  backlogPath,
  claimProvenance,
  stopped,
} from "./workspace-publication-ownership.mjs";

// `read(request, ref, candidateSha)` reads it on fetched trunk; `changed`
// tells whether a source reread during claim publication no longer supports
// the claim. An admission's source is its claim candidate once one exists (a
// resumed start's retained candidate by default), reconciled again onto the
// trunk it reads rather than drafted anew, so it only changes when the work
// has meanwhile been listed.
export function startSource(request) {
  if (request.admit === true)
    return {
      admitting: true,
      read: (reader, ref, candidateSha = request.retained?.candidateSha) =>
        readAdmissionSource(reader, ref, candidateSha),
      changed: (refreshed) => Boolean(refreshed.existing),
    };
  return {
    admitting: false,
    read: readPublishedExecutionSource,
    changed: (refreshed, selected) => !sameSelectedSource(refreshed, selected),
  };
}

// Admission of work already Taken continues under the claim this publisher
// already holds; any other claim is refused. Nothing is written either way.
export async function existingClaim(request, ref) {
  const provenance = await claimProvenance(
    request.integration,
    ref,
    request.identity,
    backlogPath,
  );
  if (provenance?.publisher !== request.publisherId)
    return stopped("conflict", {
      ownership: provenance?.publisher ? "other" : "ambiguous",
      provenance,
      error: "selected identity is already Taken under another claim",
    });
  return {
    ok: true,
    status: "existing",
    publishedSha: provenance.sha,
    created: false,
    ...reportedMaintenance(await maintenance(request)),
  };
}
