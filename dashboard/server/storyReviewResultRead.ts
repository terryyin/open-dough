// A story's named comparison determines the only Git tree a browse can read.
import type { ServerResponse } from "node:http";
import { agentSettingsPath } from "../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { locationSelectsRepositoryPath } from "../src/intentLocationSelection.ts";
import { storyReviewWaitMs } from "../src/storyReviewContract.ts";
import type {
  StoryReviewResult,
  StoryReviewResultRead,
} from "../src/storyReviewResult.ts";
import type { AgentLaunchAnswer } from "./agentLaunchResponse.ts";
import { gitProblem } from "./gitRunner.ts";
import { textAtTree, trackedFiles } from "./gitTreeFiles.ts";
import {
  declaredLocations,
  intentLocationAnswer,
} from "./intentLocationsSettings.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { withResponseSignal } from "./responseSignal.ts";
import { reviewRepositoryPath } from "./reviewRepository.ts";
import { knownSource } from "./sessionAdmission.ts";
import { readNamedLandedReview } from "./storyReviewLandedAdmission.ts";
import {
  requirePublishedCompletion,
  requirePublishedHead,
} from "./storyReviewPublishedAdmission.ts";
import type { AdmittedStoryReviewResult } from "./storyReviewResultRequest.ts";

export async function storyReviewResultResponse(
  { read }: AdmittedStoryReviewResult,
  res: ServerResponse,
): Promise<AgentLaunchAnswer> {
  const body = await withResponseSignal(
    res,
    (signal) => readStoryReviewResult(read, signal),
    storyReviewWaitMs,
  );
  return { status: 200, body };
}

async function admittedResult(
  read: StoryReviewResultRead,
  signal: AbortSignal,
) {
  const { identity, source: project } = read.subject;
  const source = knownSource(project);
  const review =
    "completion" in read
      ? await requirePublishedCompletion(
          source,
          identity,
          read.completion,
          signal,
        )
      : "publishedHead" in read
        ? await requirePublishedHead(
            source,
            identity,
            read.publishedHead,
            signal,
          )
        : await readNamedLandedReview(source, identity, read.reference, signal);
  if (review.tree !== read.tree)
    throw new RefusedRequest(
      409,
      "The result tree does not belong to this published comparison.",
    );
  const revision =
    review.kind === "published"
      ? review.completion
      : review.kind === "published-taken"
        ? review.head
        : review.landing.revision;
  return {
    repository: reviewRepositoryPath(source),
    tree: review.tree,
    revision,
  };
}

async function readStoryReviewResult(
  read: StoryReviewResultRead,
  signal: AbortSignal,
): Promise<StoryReviewResult> {
  const { repository, tree, revision } = await admittedResult(read, signal);
  if (read.path !== undefined) {
    const result = await textAtTree(repository, tree, read.path, signal);
    signal.throwIfAborted();
    return { ...result, revision, path: read.path };
  }

  let paths: string[];
  try {
    paths = await trackedFiles(repository, tree, signal);
  } catch (error) {
    signal.throwIfAborted();
    return {
      kind: "unavailable",
      revision,
      explanation: `The result tree could not be listed: ${gitProblem(error)}`,
    };
  }
  const inventory = { kind: "inventory" as const, revision, paths };
  const settings = await textAtTree(
    repository,
    tree,
    agentSettingsPath,
    signal,
  );
  signal.throwIfAborted();
  if (settings.kind === "absent") return { ...inventory, locations: null };
  if (settings.kind === "unavailable")
    return { ...inventory, locations: null, settingsProblem: "unreadable" };
  const declared = declaredLocations(settings.text);
  if (declared.kind === "malformed")
    return { ...inventory, locations: null, settingsProblem: "malformed" };
  if (declared.kind === "absent") return { ...inventory, locations: null };
  return {
    ...inventory,
    locations: declared.locations.map((location) =>
      intentLocationAnswer(
        location,
        paths.filter((path) => locationSelectsRepositoryPath(path, location)),
      ),
    ),
  };
}
