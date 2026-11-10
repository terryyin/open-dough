// Exact GET paths admitted on the launch boundary.
import { agentChangedEndpoint } from "../src/agentLaunch.ts";
import { finalReportEndpoint } from "../src/finalReportContract.ts";
import {
  completedStoryAssociationEndpoint,
  completedStoryAssociationRequest,
  type AdmittedCompletedStoryAssociation,
} from "./completedStoryAssociationAdmission.ts";
import {
  changedRequest,
  type AdmittedChanged,
} from "./launchAttemptChanges.ts";
import {
  finalReportRequest,
  type AdmittedFinalReport,
} from "./finalReportAdmission.ts";
import {
  storyReviewExactReads,
  type StoryReviewExactRead,
} from "./storyReviewExactReads.ts";

export type LaunchExactAdmitted =
  | AdmittedChanged
  | AdmittedFinalReport
  | AdmittedCompletedStoryAssociation
  | StoryReviewExactRead;

export const launchExactReads = new Map<
  string,
  (url: URL) => LaunchExactAdmitted | Promise<LaunchExactAdmitted>
>([
  [agentChangedEndpoint, changedRequest],
  [finalReportEndpoint, finalReportRequest],
  [completedStoryAssociationEndpoint, completedStoryAssociationRequest],
  ...storyReviewExactReads,
]);
