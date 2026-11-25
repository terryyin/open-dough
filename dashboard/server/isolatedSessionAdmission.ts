// The selected isolated checkout carries the claim and opens the native
// session. The attempt retains its draft before asking Git to publish.
import type { PublicationReceipt } from "../src/agentLaunch.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { executePlanScript, runStartScript } from "./executionStartCommands.ts";
import { admittedStoryTitle } from "./hostLaunch.ts";
import type { LocalFolder } from "./localFolder.ts";
import {
  canReuseClaimWorkspace,
  git,
  lostAdmissionArguments,
  repositoryOf,
} from "./startGit.ts";
import {
  keepSessionStart,
  sessionDraftSchema,
  type SessionStart,
} from "./sessionStartStore.ts";
import { publisherId, runStartCommand } from "./startLaunch.ts";
import { readStartResult, refusal, type StartResult } from "./startResult.ts";
import type { UnattachedRequest } from "./unattachedStartScript.ts";

type Claim = NonNullable<SessionStart["claim"]>;
type Draft = Claim["draft"];
type Admitted = {
  readonly kind: "admitted";
  readonly revision: string;
};

export type IsolatedAdmissionRefusal = {
  readonly kind: "refused";
  readonly explanation: string;
  readonly publication: PublicationReceipt;
};

const refused = (
  explanation: string,
  uncertain = false,
): IsolatedAdmissionRefusal => ({
  kind: "refused",
  explanation,
  publication: { kind: uncertain ? "unknown" : "none" },
});

function readDraft(stdout: string): Draft | undefined {
  try {
    const parsed = sessionDraftSchema.safeParse(
      JSON.parse(stdout.trim().split("\n").at(-1) ?? ""),
    );
    return parsed.success ? parsed.data : undefined;
  } catch {
    return undefined;
  }
}

function lostToAnotherOwner(result: StartResult): boolean {
  return (
    result.kind === "stopped" &&
    result.status === "conflict" &&
    result.ownership === "other"
  );
}

function canDraftAgain(
  result: StartResult,
  resumingCandidate: boolean,
): boolean {
  if (result.kind !== "stopped") return false;
  if (result.status === "retry-admission") return true;
  return (
    !resumingCandidate &&
    (lostToAnotherOwner(result) ||
      (result.status === "source-refused" &&
        /has already been used/.test(result.error ?? "")))
  );
}

export async function admitIsolatedSession(
  source: PublishedSource,
  request: UnattachedRequest,
  project: LocalFolder,
  attempt: string,
  placement: SessionStart,
  noteWorker: (pid: number) => Promise<void>,
): Promise<Admitted | IsolatedAdmissionRefusal> {
  const origin = await git(project, ["config", "--get", "remote.origin.url"]);
  if (repositoryOf(origin) !== source.repository.toLowerCase())
    return refused(
      `The origin of ${project.shown} is not ${source.repository}, where this story would be published. Nothing was launched.`,
    );

  const remote = [
    "--repository",
    project.path,
    "--remote",
    "origin",
    "--target",
    source.ref,
  ];
  const { workspace, branch } = placement;
  const publisher = `${publisherId(source)}-${attempt}`;
  const kept = placement.claim;
  if (kept?.publishedSha !== undefined)
    return { kind: "admitted", revision: kept.publishedSha };

  async function draftAdmission(): Promise<Draft | IsolatedAdmissionRefusal> {
    const title = admittedStoryTitle(request, new Date(placement.startedAt));
    const answer = await runStartCommand(
      executePlanScript(project, request.host, "execution-start.mjs"),
      [
        ...remote,
        "--title",
        title,
        "--goal",
        "Carry out the work requested in this session.",
      ],
      project,
      "draft",
      noteWorker,
    );
    const draft = readDraft(answer?.stdout ?? "");
    if (draft === undefined) {
      const result = readStartResult(answer?.stdout ?? "");
      return refused(
        result.kind === "stopped"
          ? refusal(result)
          : `The installed skills in ${project.shown} could not draft a story for this session. Nothing was launched.`,
      );
    }
    await keepSessionStart(source.id, attempt, {
      ...placement,
      claim: { draft },
    });
    return draft;
  }

  async function startClaim(draft: Draft, resumeArguments: string[]) {
    return runStartScript(
      [
        ...remote,
        "--workspace",
        workspace,
        "--branch",
        branch,
        "--mode",
        "trunk",
        "--identity",
        draft.identity,
        "--link",
        draft.link,
        "--title",
        draft.title,
        "--owned-draft",
        JSON.stringify(draft.ownedDraft),
        "--admit",
        "--publisher-id",
        publisher,
        "--host",
        request.host,
        "--workspace-authorized",
        "--push-authorized",
        ...(resumeArguments.length === 0
          ? []
          : ["--retry-admission", "true", ...resumeArguments]),
      ],
      project,
      request.host,
      noteWorker,
    );
  }

  async function recoverClaim(draft: Draft): Promise<Claim["retained"]> {
    if (kept?.retained !== undefined) return kept.retained;
    const [, startingRevision, , candidateSha] = await lostAdmissionArguments(
      workspace,
      branch,
      publisher,
      draft.identity,
    );
    if (startingRevision === undefined || candidateSha === undefined)
      return undefined;
    const retained = { startingRevision, candidateSha };
    await keepSessionStart(source.id, attempt, {
      ...placement,
      claim: { draft, retained },
    });
    return retained;
  }

  let draft = kept?.draft ?? (await draftAdmission());
  if ("kind" in draft) return draft;
  let retained = await recoverClaim(draft);
  let result = await startClaim(
    draft,
    retained === undefined
      ? []
      : [
          "--starting-revision",
          retained.startingRevision,
          "--candidate-sha",
          retained.candidateSha,
        ],
  );
  if (
    kept !== undefined &&
    canDraftAgain(result, retained !== undefined) &&
    (retained !== undefined ||
      (await canReuseClaimWorkspace(workspace, branch, source.ref)))
  ) {
    draft = await draftAdmission();
    if ("kind" in draft) return draft;
    result = await startClaim(draft, []);
    retained = undefined;
  }
  if (result.kind === "prepared")
    return refused(
      "The installed start did not confirm story admission. Nothing was launched.",
      true,
    );
  if (result.kind !== "accepted") {
    const recovery = result.kind === "stopped" ? result.recovery : undefined;
    if (
      recovery?.workspace === workspace &&
      recovery.branch === branch &&
      recovery.startingRevision !== undefined &&
      recovery.candidateSha !== undefined
    ) {
      const { startingRevision, candidateSha } = recovery;
      await keepSessionStart(source.id, attempt, {
        ...placement,
        claim: { draft, retained: { startingRevision, candidateSha } },
      });
    }
    return refused(
      refusal(result),
      !lostToAnotherOwner(result) &&
        (retained !== undefined ||
          result.kind === "unreadable" ||
          result.status === "unpublished" ||
          result.status === "conflict"),
    );
  }

  const { publishedSha } = result;
  await keepSessionStart(source.id, attempt, {
    ...placement,
    claim: { draft, publishedSha },
  });
  return { kind: "admitted", revision: publishedSha };
}
