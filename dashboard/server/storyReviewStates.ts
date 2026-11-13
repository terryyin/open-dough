// This machine's story review states (`../src/storyReviewState.ts`), kept by
// project id and story identity in
// `~/.open-dough/dashboard/story-review-states.json`, resolved through
// `HOME`: an entry means the story is reviewed, and no entry means it is not.
// A missing or unreadable file reads as every story unreviewed. It is not
// the story review's snapshot marks (`./storyReviewMarks.ts`): neither reads
// or changes the other. Nothing is written to a project's repository. The
// file is read, replaced atomically, and moved aside when unreadable as
// `./machineJsonStore.ts` describes.

import type { IncomingMessage } from "node:http";
import { z } from "zod";
import {
  storyReviewStateChangeSchema,
  type StoryReviewStatesAnswer,
} from "../src/storyReviewState.ts";
import { configuredProject } from "./projectConfiguration.ts";
import { jsonBody } from "./jsonRequestBody.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { machineDashboardPath } from "./machineHome.ts";
import {
  readMachineJson,
  replaceMachineJson,
  type MachineJsonStore,
} from "./machineJsonStore.ts";

const storeSchema = z.record(
  z.string(),
  z.record(z.string(), z.object({ reviewedAt: z.iso.datetime() })),
);

type StoredStates = z.infer<typeof storeSchema>;

const stateStore = (): MachineJsonStore<StoredStates> => ({
  file: machineDashboardPath("story-review-states.json"),
  schema: storeSchema,
  empty: {},
});

const answerOf = (
  stored: StoredStates,
  project: string,
): StoryReviewStatesAnswer => ({
  reviewed: Object.keys(stored[project] ?? {}),
});

async function reviewStates(project: string): Promise<StoryReviewStatesAnswer> {
  const read = await readMachineJson(stateStore());
  return answerOf(read.kind === "document" ? read.document : {}, project);
}

async function changeReviewState(
  project: string,
  identity: string,
  reviewed: boolean,
): Promise<StoryReviewStatesAnswer> {
  let answer: StoryReviewStatesAnswer = { reviewed: [] };
  await replaceMachineJson(stateStore(), (stored) => {
    const others = Object.fromEntries(
      Object.entries(stored[project] ?? {}).filter(
        ([kept]) => kept !== identity,
      ),
    );
    const next = {
      ...stored,
      [project]: reviewed
        ? { ...others, [identity]: { reviewedAt: new Date().toISOString() } }
        : others,
    };
    answer = answerOf(next, project);
    return next;
  });
  return answer;
}

// One request naming a configured project: GET answers its reviewed stories,
// POST sets or clears one story's state and answers the same.
export async function answerStoryReviewStates(
  req: IncomingMessage,
  signal: AbortSignal,
): Promise<StoryReviewStatesAnswer> {
  if (req.method !== "GET" && req.method !== "POST")
    throw new RefusedRequest(405, "Only GET and POST are accepted.");
  const project = new URL(req.url ?? "", "http://local").searchParams.get("id");
  if (project === null)
    throw new RefusedRequest(
      400,
      "The review state request names one project.",
    );
  if (configuredProject(project) === undefined)
    throw new RefusedRequest(404, "The project is not configured.");
  if (req.method === "GET") return reviewStates(project);
  const change = storyReviewStateChangeSchema.safeParse(
    await jsonBody(req, signal),
  );
  if (!change.success)
    throw new RefusedRequest(400, "The review state request is malformed.");
  signal.throwIfAborted();
  return changeReviewState(project, change.data.identity, change.data.reviewed);
}
