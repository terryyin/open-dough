import {
  establishesSession,
  startsAdHocSession,
  unattachedPolicyOf,
  type AgentLaunchRequest,
  type EstablishedSession,
  type PublicationReceipt,
} from "../src/agentLaunch.ts";
import { admitsAdHocStory } from "../src/launchRequest.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import {
  executePlanScript,
  shipsStartScript,
} from "./executionStartCommands.ts";
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
import {
  refuseBlankCursor,
  refuseDefaultCodexSettings,
} from "./unattachedStartupRefusal.ts";

const formatterScript = "established-session.mjs";

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

// A start that could not hand off to the native host.
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

export async function unattachedStarted(
  source: PublishedSource,
  request: UnattachedRequest,
  project: LocalFolder,
  attempt: string,
  began: Date,
  noteWorker: (pid: number) => Promise<void>,
): Promise<Started> {
  if (!startsAdHocSession(request)) return { kind: "none" };
  const cursorRefusal = refuseBlankCursor(request);
  if (cursorRefusal !== undefined) return cursorRefusal;
  const establishes = establishesSession(request);
  const installed = establishes
    ? await establishesUnattached(project, request.host)
    : await shipsStartScript(project, request.host);
  if (!installed)
    return stopped(unattachedStartWords.notInstalled(project.shown));
  const kept = await keptSessionStart(source.id, attempt);
  if (kept?.claim?.publishedSha === undefined) {
    const codexRefusal = await refuseDefaultCodexSettings(
      request,
      project.path,
    );
    if (codexRefusal !== undefined) return codexRefusal;
  }
  const admitting = admitsAdHocStory(request);
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
    (kept?.claim?.publishedSha !== undefined || !admitting
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
  const settled = await keptSessionStart(source.id, attempt);
  const claim = settled?.claim;
  const checkout = settled?.claimCheckout;
  const publication: PublicationReceipt =
    claim?.publishedSha === undefined
      ? { kind: "none" }
      : {
          kind: "published",
          identity: claim.draft.identity,
          revision: claim.publishedSha,
        };
  if (admitting) {
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
    const expectedRevision =
      result.role === "isolated"
        ? publication.revision
        : result.startingRevision;
    if (revision.trim() !== `${expectedRevision ?? ""}\n${result.branch}`)
      return stopped(
        "The session checkout changed during admission. Restore its branch and starting revision to continue.",
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
          ...(establishes ? { establishedSession: result } : {}),
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
        ...(establishes
          ? { formatted: await formattedSession(project, result, request.host) }
          : {}),
      },
      workspace: chosen.workspace,
      publication,
      ...(checkout && claim?.publishedSha
        ? {
            nativeCheckout: result,
            admission: { ...checkout, publishedSha: claim.publishedSha },
          }
        : {}),
      ...(claim === undefined ? {} : { storyTitle: claim.draft.title }),
    };
  } catch {
    return stopped(unattachedStartWords.formatFailed(), "failed", publication);
  }
}
