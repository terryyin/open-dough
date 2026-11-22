// The reads of automatic CI follow-up: a project's Recently done cards and
// one retained follow-up reading; the authenticated reader binds the endpoint.
import {
  ciFollowUpAnswerSchema,
  ciFollowUpEndpoint,
  type CiFollowUpAnswer,
} from "./ciFollowUp.ts";
import {
  ciFollowUpReadingSchema,
  type CiFollowUpReading,
  type FollowUpDestination,
} from "./ciFollowUpReading.ts";
import { localSettingRequest } from "./localSettingRequest.ts";

export const retainedFollowUpUnreadable =
  "Retained CI follow-up evidence could not be read.";

export type CiFollowUpReadSource = {
  readonly readCards: (project: string) => Promise<CiFollowUpAnswer>;
  readonly readRetained: (
    project: string,
    destination: FollowUpDestination,
  ) => Promise<CiFollowUpReading>;
};

export const authenticatedCiFollowUpReads: CiFollowUpReadSource = {
  readCards: async (project) =>
    ciFollowUpAnswerSchema.parse(
      await localSettingRequest(
        `${ciFollowUpEndpoint}?id=${encodeURIComponent(project)}`,
        undefined,
        "Automatic CI follow-up evidence could not be read.",
      ),
    ),
  readRetained: async (project, destination) =>
    ciFollowUpReadingSchema.parse(
      await localSettingRequest(
        `${ciFollowUpEndpoint}?${new URLSearchParams({ id: project, ...destination })}`,
        undefined,
        retainedFollowUpUnreadable,
      ),
    ),
};
