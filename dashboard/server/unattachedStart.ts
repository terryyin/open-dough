// An unattached session's start: the project's installed shared start
// establishes where the conversation works before its native session begins,
// as the start for one-shot work that names no identity, which publishes
// nothing: in the execution checkout as it is, or in a new workspace under
// `.worktrees/` that the start creates. The dashboard owns the arguments and
// reads the receipt; the installed formatter spells the "Established session"
// block handed to the session. A launch that establishes no session
// (`establishesSession`) runs nothing here. The start is kept with its launch
// attempt (`./sessionStartStore.ts`) before its script runs, so continuing
// that attempt goes on in the same workspace on the same branch: from the
// session its script established, without running it again, or by running it
// again for that workspace when no result was kept.

import {
  establishesSession,
  unattachedPolicyOf,
  type AgentLaunchRequest,
  type EstablishedSession,
  type PublicationReceipt,
} from "../src/agentLaunch.ts";
import { admitsIsolatedStory } from "../src/launchRequest.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { executePlanScript, shipsStartScript } from "./executionStart.ts";
import { adHocLabelText } from "./hostLaunch.ts";
import type { Started } from "./launchStart.ts";
import {
  launchWorkspace,
  startWorkspaceFolder,
  type WorkspaceChoice,
} from "./launchWorkspace.ts";
import type { LocalFolder } from "./localFolder.ts";
import { installedExports, isFile } from "./startLaunch.ts";
import { shipsSessionPolicy } from "./startPolicy.ts";
import { git, takenSlugs } from "./startGit.ts";
import { keptSessionStart } from "./sessionStartStore.ts";
import { refusal } from "./startResult.ts";
import {
  scriptSession,
  type UnattachedRequest,
} from "./unattachedStartScript.ts";
import { withinStartWait } from "./startWait.ts";
import { unattachedStartWords } from "./startWorkflows.ts";
import { isolatedBranchReviewRepository } from "./sessionBranchCapture.ts";
import { directoryState } from "./sessionWorkspace.ts";
import { executionCheckoutStart } from "./defaultLaunchStart.ts";

const formatterScript = "established-session.mjs";

// Whether the selected host's installation in the project can establish an
// unattached session: it ships the start, the shared policy that start reads,
// and the formatter of the session's block.
export async function establishesUnattached(
  project: LocalFolder,
  host: AgentLaunchRequest["host"],
): Promise<boolean> {
  const shipped = await Promise.all([
    shipsStartScript(project, host),
    shipsSessionPolicy(project, host),
    isFile(executePlanScript(project, host, formatterScript)),
  ]);
  return shipped.every(Boolean);
}

// The block is written by the selected installation's own formatter, read
// anew when the skill was updated while the server runs.
async function formattedSession(
  project: LocalFolder,
  session: EstablishedSession,
  host: AgentLaunchRequest["host"],
): Promise<string> {
  const formatter = await installedExports<{
    formatEstablishedSession: (session: EstablishedSession) => string;
  }>(executePlanScript(project, host, formatterScript));
  return formatter.formatEstablishedSession(session);
}

// A start that stopped: it publishes nothing, whatever became of it.
function stopped(
  explanation: string,
  kind: "failed" | "uncertain" = "failed",
  publication: PublicationReceipt = { kind: "none" },
): Started {
  return {
    kind: "stopped",
    result:
      kind === "failed"
        ? { kind, reason: "start-refused", explanation }
        : { kind, reason: "timed-out", explanation },
    publication,
  };
}

// The new workspace of an isolated unattached session, chosen as a story's
// is (`./launchWorkspace.ts`): its slug comes from the session's label text,
// `session` when the label is a time or holds no usable word, numbered when
// a workspace folder or a host branch already has it.
async function sessionWorkspace(
  project: LocalFolder,
  request: UnattachedRequest,
): Promise<WorkspaceChoice> {
  const nameless = "session";
  return launchWorkspace(
    project,
    adHocLabelText(request) ?? nameless,
    await takenSlugs(project),
    request.host,
    nameless,
  );
}

// The start of an unattached launch's `attempt`, waiting for its script as a
// story's start is waited for: none for a launch that establishes no session;
// otherwise the session the installed start established, with its block, in
// the project's execution checkout on the trunk target or in the new workspace
// its policy chose, where the native session then opens. A start kept from
// the attempt's earlier run goes on where it was: from its established
// session as it is, else by its script run again there.
export async function unattachedStarted(
  source: PublishedSource,
  request: UnattachedRequest,
  project: LocalFolder,
  attempt: string,
  began: Date,
  noteWorker: (pid: number) => Promise<void>,
): Promise<Started> {
  if (!establishesSession(request)) return { kind: "none" };
  if (!(await establishesUnattached(project, request.host))) {
    return stopped(unattachedStartWords.notInstalled(project.shown));
  }
  const kept = await keptSessionStart(source.id, attempt);
  const chosen: WorkspaceChoice =
    kept !== undefined
      ? {
          workspace: startWorkspaceFolder(project, kept.workspace),
          branch: kept.branch,
        }
      : unattachedPolicyOf(request).workspace === "isolated"
        ? await sessionWorkspace(project, request)
        : { workspace: project, branch: source.ref };
  const place = { workspace: chosen.workspace.shown, branch: chosen.branch };
  const result =
    (kept?.claim !== undefined || !admitsIsolatedStory(request)
      ? kept?.session
      : undefined) ??
    (await withinStartWait(
      scriptSession(
        source,
        request,
        project,
        attempt,
        chosen,
        kept !== undefined,
        began,
        noteWorker,
      ),
    ));
  if (result === "expired") {
    const admitting = admitsIsolatedStory(request);
    return stopped(
      unattachedStartWords.uncertain(place, admitting),
      "uncertain",
      { kind: admitting ? "unknown" : "none" },
    );
  }
  if ("kind" in result) {
    if (result.kind === "refused")
      return stopped(result.explanation, "failed", result.publication);
    return stopped(
      result.kind === "stopped"
        ? refusal(result)
        : unattachedStartWords.unreadable,
    );
  }
  const claim = (await keptSessionStart(source.id, attempt))?.claim;
  const publication: PublicationReceipt =
    claim?.publishedSha === undefined
      ? { kind: "none" }
      : {
          kind: "published",
          identity: claim.draft.identity,
          revision: claim.publishedSha,
        };
  if (admitsIsolatedStory(request)) {
    if (publication.kind !== "published")
      return stopped(
        "Story admission could not be read. Continue to recover it.",
        "failed",
        { kind: "unknown" },
      );
    if (directoryState(result.workspace).kind === "missing")
      return {
        kind: "stopped",
        publication,
        result: {
          kind: "failed",
          reason: "folder-not-found",
          explanation: `The workspace ${result.workspace} was not found on this machine. Nothing was launched.`,
        },
      };
    const revision = await git({ path: result.workspace }, [
      "rev-parse",
      "HEAD",
      "--abbrev-ref",
      "HEAD",
    ]);
    if (revision.trim() !== `${publication.revision}\n${result.branch}`)
      return stopped(
        "The admitted workspace no longer holds the Take. Restore its branch and revision to continue.",
        "failed",
        publication,
      );
  }
  try {
    const repository = await isolatedBranchReviewRepository(result);
    return {
      kind: "session",
      handoff: {
        established: {
          establishedSession: result,
          ...(result.role === "default-checkout" &&
          result.startingRevision !== undefined
            ? {
                defaultStart: await executionCheckoutStart(result.workspace),
              }
            : {}),
          ...(repository === undefined
            ? {}
            : { branchReviewRepository: repository }),
        },
        formatted: await formattedSession(project, result, request.host),
      },
      workspace: chosen.workspace,
      publication,
      ...(claim === undefined ? {} : { storyTitle: claim.draft.title }),
    };
  } catch {
    return stopped(unattachedStartWords.formatFailed(), "failed", publication);
  }
}
