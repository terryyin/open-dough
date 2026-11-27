// The read (and change) of one project's story review states; the
// authenticated implementation binds the local endpoint.
import { localSettingRequest } from "./localSettingRequest.ts";
import {
  storyReviewStateEndpoint,
  storyReviewStatesAnswerSchema,
  type StoryReviewStateChange,
} from "./storyReviewState.ts";

const notRead = "The review state could not be read.";

// What a card says when a review state change could not be saved (the
// machine could not write its local records or the dashboard was not reached),
// and a rejected change's message when the dashboard gives none.
export const reviewStateNotSaved = "The review state could not be saved.";

/** Reads a project's story marks (`reviewedAt` by story identity), or changes
 * one and answers with them. */
export type StoryReviewStatesReadSource = (
  project: string,
  change?: StoryReviewStateChange,
) => Promise<ReadonlyMap<string, string>>;

export const authenticatedStoryReviewStatesReads: StoryReviewStatesReadSource =
  async (project, change) =>
    new Map(
      Object.entries(
        storyReviewStatesAnswerSchema.parse(
          await localSettingRequest(
            `${storyReviewStateEndpoint}?id=${encodeURIComponent(project)}`,
            change,
            change === undefined ? notRead : reviewStateNotSaved,
          ),
        ).stories,
      ).map(([identity, mark]) => [identity, mark.reviewedAt]),
    );
