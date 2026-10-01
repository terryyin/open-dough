// Establishes a one-shot preparation of a queued story: its owned workspace
// at fetched trunk, with nothing published. No assignment profile, agent
// name, or backlog change is made; the result waits in the workspace for
// review. Another holder of the story (a Taken entry or any agent profile)
// refuses it, while a recorded not-ready assessment does not: preparation
// may be what repairs it.
import { maintenance } from "../../dough-execute-plan/scripts/execution-start-maintenance.mjs";
import { requireUnheld } from "../../dough-execute-plan/scripts/one-shot-ownership.mjs";
import { git } from "../../dough-execute-plan/scripts/publication-git.mjs";
import {
  backlogPath,
  remoteRef,
} from "../../dough-execute-plan/scripts/workspace-publication-ownership.mjs";
import {
  assignedElsewhereError,
  assignmentFields,
  stop,
  workspaceAssignment,
} from "./preparation-assignment-ownership.mjs";
import { requestOf } from "./preparation-assignment-request.mjs";
import {
  fetchQueuedTrunk,
  preparationRepository,
  selectAtFetchedTrunk,
} from "./preparation-assignment-trunk.mjs";

// The stop for a workspace that holds a published preparation assignment:
// its own story's continues under that assignment, another story's first
// ends there.
async function assignedWorkspace(request, ref) {
  const found = await workspaceAssignment(request, ref);
  const held = found.state === "held" ? found.own : found.assigned;
  if (!held) return undefined;
  return stop("workspace-assigned", {
    workspace: request.workspace,
    ...assignmentFields(held.profile, held),
    error:
      found.state === "held"
        ? "this workspace already holds the story's published preparation assignment; continue it with start without --one-shot"
        : assignedElsewhereError,
  });
}

export async function startOneShotPreparation(input) {
  const requested = requestOf("start", input);
  if (!requested.ok) return requested;
  const { request } = requested;
  const { workspace, identity } = request;
  const located = preparationRepository(request);
  if (!located.ok) return located;
  const { repository, exists } = located;
  const trunk = await fetchQueuedTrunk(repository, request);
  if (!trunk.ok) return trunk;
  const { fetched } = trunk;
  const ref = remoteRef(request);
  const assigned = exists && (await assignedWorkspace(request, ref));
  if (assigned) return { ...assigned, fetched };
  try {
    await requireUnheld(repository, ref, identity, backlogPath);
  } catch (error) {
    return stop("source-refused", { workspace, fetched, error: error.message });
  }
  const selected = await selectAtFetchedTrunk(request, repository, fetched);
  if (!selected.ok) return selected;
  const branch = (
    await git(workspace, "branch", "--show-current")
  ).stdout.trim();
  return {
    ok: true,
    status: "prepared",
    tracking: "one-shot",
    identity,
    workspace,
    branch,
    startingRevision: selected.startingRevision,
    created: selected.created,
    refresh: await maintenance(request),
  };
}
