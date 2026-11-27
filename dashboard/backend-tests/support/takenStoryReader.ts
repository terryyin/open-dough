// A backend case's configured project whose Taken story origin publishes,
// with the writer that publishes story commits to it.
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { configuredFixtureProject } from "./fixtureProject.ts";
import { reviewRepositoryPath } from "../../server/reviewRepository.ts";
import { knownSource } from "../../server/sessionAdmission.ts";
import { queuedIdentity } from "../../test-support/support/startOrigin.ts";
import type { StartRepository } from "../../test-support/support/startOriginPreparation.ts";
import { yui } from "../../test-support/support/storyReviewTrunkCommits.ts";
import { branch, git } from "../../test-support/support/storyReviewWorktree.ts";
import { takenBranchContributionHistory } from "../../test-support/support/takenBranchContributionHistory.ts";

// The configured project's execution checkout is absent: every Taken read
// goes through the Review repository under the fixture HOME.
export async function takenStoryReader(
  history: StartRepository = takenBranchContributionHistory(),
) {
  const { repository, home, project } = await configuredFixtureProject(
    history,
    ({ fixture }) => path.join(fixture, "absent-checkout"),
  );
  if (repository.execution === undefined) throw new Error("Missing writer");
  return {
    home,
    origin: repository.origin,
    writer: repository.execution,
    revisions: repository.revisions,
    reviewRepository: () => reviewRepositoryPath(knownSource(project.id)),
    subject: { source: project.id, identity: queuedIdentity },
    signal: new AbortController().signal,
  };
}

// Publishes the writer's HEAD as the Taken story branch.
export const publishBranch = (writer: string) =>
  git(writer, "push", "--quiet", "origin", `HEAD:refs/heads/${branch}`);

// Commits `text` to each named file as the story agent; returns the commit.
export function commitStoryFile(
  writer: string,
  file: string,
  text: string,
  ...alongside: readonly string[]
) {
  for (const written of [file, ...alongside]) {
    makeMe.theWorkspace(writer).writeAt(written, text).please();
    git(writer, "--literal-pathspecs", "add", "--", written);
  }
  git(
    writer,
    "-c",
    `user.name=${yui.agent}`,
    "-c",
    `user.email=${yui.email}`,
    "commit",
    "--quiet",
    "-m",
    "Published story file",
  );
  return git(writer, "rev-parse", "HEAD");
}
