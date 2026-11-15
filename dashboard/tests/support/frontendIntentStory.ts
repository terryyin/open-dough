// Published tree and explicit comparison answers for whole-app story reading.
// These answers do not prove Git's workspace, diff or historical-source judgment.
import type { Page } from "@playwright/test";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  storyA,
  storyB,
} from "../../../Distribution/tests/support/queued-repository.mjs";
import { renderStorySection } from "../../../Distribution/tests/support/published-seed.mjs";
import { describedRevision } from "../describedRevisions.ts";
import { intentSettings, intentTrunkRevision } from "./intentStoryWorktree.ts";
import { putFrontendIntentSources } from "./frontendIntentSources.ts";
import {
  frontendFileDiff,
  frontendReviewSnapshot,
  installFrontendStoryReview,
} from "./frontendStoryReview.ts";
import {
  frontendRevision,
  openDoughSource,
  type FrontendServiceState,
} from "./frontendServiceState.ts";
import type { ReviewedFile } from "../../src/storyReviewContract.ts";

export const frontendIntentChanges = [
  { kind: "modified", path: "dashboard/tests/a.spec.ts" },
  { kind: "added", path: "dashboard/tests/boundary/b.spec.ts" },
  { kind: "deleted", path: "dashboard/tests/gone.spec.ts" },
  {
    kind: "renamed",
    oldPath: "dashboard/tests/between/moved.spec.ts",
    path: "tests/moved.sh",
  },
  {
    kind: "renamed",
    oldPath: "scripts/arriving.spec.ts",
    path: "dashboard/tests/arriving/arriving.spec.ts",
  },
  {
    kind: "renamed",
    oldPath: "dashboard/tests/out/leaving.spec.ts",
    path: "scripts/leaving.spec.ts",
  },
  { kind: "modified", path: "dashboard/src/App.tsx" },
  { kind: "renamed", oldPath: "docs/notes.md", path: "docs/renamed-notes.md" },
].map((file) => makeMe.aReviewedFile.with(file as ReviewedFile).please());

export function putFrontendIntentStory(
  services: FrontendServiceState,
  {
    workspace = true,
    locations = true,
    taken = true,
    story = storyA,
    branch = "claude/story-a",
  } = {},
) {
  const publication = describedRevision(
    makeMe.aRepository
      .withRevision("published", {
        backlog: {
          taken: taken ? [story] : [],
          queued: taken ? [storyB] : [story, storyB],
        },
        files: {
          ...intentTrunkRevision.files,
          ".planning/seeds/A.md": renderStorySection(story),
          ".planning/seeds/B.md": renderStorySection(storyB),
        },
      })
      .please(),
    frontendRevision,
  );
  putFrontendIntentSources(
    services,
    { ...openDoughSource, ...publication },
    locations
      ? intentSettings.intent.locations.map((location) =>
          makeMe.anIntentLocation
            .at(location.path)
            .ofKind(
              location.path === "tests" ? "shell" : "typescript",
              location.path === "tests" ? ["*.sh"] : ["**/*.spec.ts"],
            )
            .selecting(
              ...Object.keys(intentTrunkRevision.files).filter((path) =>
                location.path === "tests"
                  ? path.startsWith("tests/")
                  : path.startsWith("dashboard/tests/"),
              ),
            )
            .please(),
        )
      : [],
    {},
  );
  const launch = makeMe.anObservedLaunch
    .of(
      makeMe.aLaunchRecord
        .executing(story)
        .onStoryBranch({
          workspace: "/tmp/intent-story",
          branch,
        })
        .please(),
    )
    .withSessionState(makeMe.aSessionState.loaded("working").please())
    .please();
  Object.assign(services, {
    machine: workspace
      ? makeMe.aMachineAnswer.observing(launch).please()
      : makeMe.aMachineAnswer.please(),
    ...(locations
      ? {}
      : { locations: { revision: frontendRevision, locations: null } }),
    candidates: { revision: frontendRevision, candidates: null },
  });
}

export async function answerFrontendIntentChanges(
  page: Page,
  files = frontendIntentChanges,
) {
  const review = await installFrontendStoryReview(
    page,
    frontendReviewSnapshot({ files }),
  );
  review.answerFile(
    frontendFileDiff("dashboard/tests/a.spec.ts", ["+more"]),
    "dashboard/tests/a.spec.ts",
  );
  return review;
}
