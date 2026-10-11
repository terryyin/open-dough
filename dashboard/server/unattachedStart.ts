// An unattached session's start: the project's installed shared start
// establishes where the conversation works before its native session begins,
// as the start for one-shot work that names no identity, which publishes
// nothing: in the default checkout as it is, or in a new workspace under
// `.worktrees/` that the start creates. The dashboard owns the arguments and
// reads the receipt; the installed formatter spells the "Established session"
// block handed to the session. A launch that establishes no session
// (`establishesSession`) runs nothing here.

import { unattachedStartPolicy } from "../../src/skills/dough-execute-plan/scripts/session-policy.mjs";
import {
  establishesSession,
  unattachedPolicyOf,
  type AgentLaunchRequest,
  type EstablishedSession,
} from "../src/agentLaunch.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import {
  executePlanScript,
  runStartScript,
  shipsStartScript,
} from "./executionStart.ts";
import { adHocLabelText } from "./hostLaunch.ts";
import type { Started } from "./launchStart.ts";
import { launchWorkspace, type WorkspaceChoice } from "./launchWorkspace.ts";
import type { ProjectFolder } from "./projectFolders.ts";
import { installedExports, isFile } from "./startLaunch.ts";
import { policyArguments, shipsSessionPolicy } from "./startPolicy.ts";
import { takenSlugs } from "./startGit.ts";
import { refusal } from "./startResult.ts";
import { withinStartWait } from "./startWait.ts";
import { unattachedStartWords } from "./startWorkflows.ts";

type UnattachedRequest = Extract<AgentLaunchRequest, { workflow: "ad-hoc" }>;

const formatterScript = "established-session.mjs";

// Whether the selected host's installation in the project can establish an
// unattached session: it ships the start, the shared policy that start reads,
// and the formatter of the session's block.
export async function establishesUnattached(
  project: ProjectFolder,
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
  project: ProjectFolder,
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
): Started {
  return {
    kind: "stopped",
    result:
      kind === "failed"
        ? { kind, reason: "start-refused", explanation }
        : { kind, reason: "timed-out", explanation },
    publishedNothing: true,
  };
}

// The new workspace of an isolated unattached session, chosen as a story's
// is (`./launchWorkspace.ts`): its slug comes from the session's label text,
// `session` when the label is a time or holds no usable word, numbered when
// a workspace folder or a host branch already has it.
async function sessionWorkspace(
  project: ProjectFolder,
  request: UnattachedRequest,
): Promise<WorkspaceChoice> {
  const nameless = "session";
  return launchWorkspace(
    project,
    adHocLabelText(request.instruction) ?? nameless,
    await takenSlugs(project),
    request.host,
    nameless,
  );
}

// The start of an unattached launch, waiting for its script as a story's
// start is waited for: none for a launch that establishes no session;
// otherwise the session the installed start established, with its block, in
// the project's default checkout on the trunk target or in the new workspace
// its policy chose, where the native session then opens.
export async function unattachedStarted(
  source: PublishedSource,
  request: UnattachedRequest,
  project: ProjectFolder,
): Promise<Started> {
  if (!establishesSession(request)) return { kind: "none" };
  const policy = unattachedPolicyOf(request);
  if (!(await establishesUnattached(project, request.host))) {
    return stopped(unattachedStartWords.notInstalled(project.shown));
  }
  const isolated = policy.workspace === "isolated";
  const chosen = isolated
    ? await sessionWorkspace(project, request)
    : { workspace: project, branch: source.ref };
  const where = {
    workspace: chosen.workspace.path,
    branch: chosen.branch,
    remote: "origin",
    target: source.ref,
  } as const;
  const place = { workspace: chosen.workspace.shown, branch: where.branch };
  const result = await withinStartWait(
    runStartScript(
      [
        ...policyArguments(unattachedStartPolicy(policy), project),
        "--workspace",
        where.workspace,
        "--branch",
        where.branch,
        "--mode",
        "story-branch",
        "--remote",
        where.remote,
        "--target",
        where.target,
        "--workspace-authorized",
      ],
      project,
      request.host,
    ),
  );
  if (result === "expired") {
    return stopped(
      unattachedStartWords.uncertain(place, isolated),
      "uncertain",
    );
  }
  if (result.kind === "unreadable" || result.kind === "accepted") {
    return stopped(unattachedStartWords.unreadable);
  }
  if (result.kind === "stopped") return stopped(refusal(result));
  const session: EstablishedSession = {
    ...where,
    role: result.role ?? "isolated",
    landing: policy.landing,
    startingRevision: result.startingRevision,
    ...(result.fetched === undefined ? {} : { fetched: result.fetched }),
    ...(result.created === undefined ? {} : { created: result.created }),
  };
  try {
    return {
      kind: "session",
      handoff: {
        established: { establishedSession: session },
        formatted: await formattedSession(project, session, request.host),
      },
      workspace: chosen.workspace,
    };
  } catch {
    return stopped(unattachedStartWords.formatFailed(place));
  }
}
