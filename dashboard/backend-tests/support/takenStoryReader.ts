// A backend case's configured project whose Taken story origin publishes,
// with the writer that publishes story commits to it.
import { mkdirSync } from "node:fs";
import path from "node:path";
import { onTestFinished, vi } from "vitest";
import { fixtureRepository, stubFixtureHome } from "./fixtureHome.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeRepository } from "../../../Distribution/tests/support/repository-fixture.mjs";
import {
  appendConfiguredProject,
  mountProjectConfiguration,
} from "../../server/projectConfiguration.ts";
import { reviewRepositoryPath } from "../../server/reviewRepository.ts";
import { knownSource } from "../../server/sessionAdmission.ts";
import { queuedIdentity } from "../../test-support/support/startOrigin.ts";
import type { StartRepository } from "../../test-support/support/startOriginPreparation.ts";
import { yui } from "../../test-support/support/storyReviewTrunkCommits.ts";
import {
  branch,
  git,
  writeAt,
} from "../../test-support/support/storyReviewWorktree.ts";
import { takenBranchContributionHistory } from "../../test-support/support/takenBranchContributionHistory.ts";

// The configured project's execution checkout is absent: every Taken read
// goes through the Review repository under the fixture HOME.
export async function takenStoryReader(
  history: StartRepository = takenBranchContributionHistory(),
) {
  const repository = await materializeRepository(history);
  const home = path.join(repository.fixture, "home");
  mkdirSync(home, { recursive: true });
  stubFixtureHome(home, repository.origin);
  const unmount = mountProjectConfiguration("development");
  onTestFinished(async () => {
    unmount();
    vi.unstubAllEnvs();
    await repository.cleanup();
  });
  const project = makeMe.aConfiguredProject
    .with({
      id: "open-dough",
      label: "Open Dough",
      repository: fixtureRepository,
      localPath: path.join(repository.fixture, "absent-checkout"),
    })
    .please();
  appendConfiguredProject(project);
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
    writeAt(writer, written, text);
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
