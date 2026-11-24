// The selected isolated checkout carries the claim and opens the native
// session. The attempt retains its draft before asking Git to publish.
import type { PublicationReceipt } from "../src/agentLaunch.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { executePlanScript, runStartScript } from "./executionStart.ts";
import { admittedStoryTitle } from "./hostLaunch.ts";
import type { LocalFolder } from "./localFolder.ts";
import { git, lostStartArguments, repositoryOf } from "./startGit.ts";
import {
  keepSessionStart,
  sessionDraftSchema,
  type SessionStart,
} from "./sessionStartStore.ts";
import { publisherId, runStartCommand } from "./startLaunch.ts";
import { readStartResult, refusal } from "./startResult.ts";
import type { UnattachedRequest } from "./unattachedStartScript.ts";

type Draft = NonNullable<SessionStart["claim"]>["draft"];
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
  let claim = placement.claim;
  if (claim === undefined) {
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
    claim = { draft };
    await keepSessionStart(source.id, attempt, { ...placement, claim });
  }

  const { draft } = claim;
  const { workspace, branch } = placement;
  const publisher = `${publisherId(source)}-${attempt}`;
  let publishedSha = claim.publishedSha;
  if (publishedSha === undefined) {
    const message = await git({ path: workspace }, [
      "log",
      "-1",
      "--format=%B",
    ]);
    const resumeArguments =
      message.split("\n").includes(`Claim-Publisher: ${publisher}`) &&
      message.split("\n").includes(`Claim-Identity: ${draft.identity}`)
        ? await lostStartArguments(workspace, branch)
        : [];
    const result = await runStartScript(
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
        ...resumeArguments,
      ],
      project,
      request.host,
      noteWorker,
    );
    if (result.kind !== "accepted") {
      if (result.kind === "prepared")
        return refused(
          "The installed start did not confirm story admission. Nothing was launched.",
          true,
        );
      const anotherOwner =
        result.kind === "stopped" &&
        result.status === "conflict" &&
        result.ownership === "other";
      const occupied =
        result.kind === "stopped" &&
        result.status === "source-refused" &&
        /has already been used/.test(result.error ?? "");
      if (resumeArguments.length === 0 && (anotherOwner || occupied)) {
        await keepSessionStart(source.id, attempt, {
          ...placement,
          claim: undefined,
        });
      }
      return refused(
        refusal(result),
        !anotherOwner &&
          (resumeArguments.length > 0 ||
            result.kind === "unreadable" ||
            result.status === "unpublished" ||
            result.status === "conflict"),
      );
    }
    publishedSha = result.publishedSha;
    await keepSessionStart(source.id, attempt, {
      ...placement,
      claim: { draft, publishedSha },
    });
  }
  return { kind: "admitted", revision: publishedSha };
}
