// Explicit historical/live payloads for whole-app mode transitions. Real Git
// choice is retained in review/story-review-historical-choice and E2E.
import type { Page } from "@playwright/test";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { storyA } from "../../../Distribution/tests/support/queued-repository.mjs";
import type { FrontendServiceState } from "./frontendServiceState.ts";
import { prepareFrontendDoneIntent } from "./frontendIntentDoneStory.ts";
import {
  frontendFileDiff,
  frontendReviewSnapshot,
} from "./frontendStoryReview.ts";

export async function prepareFrontendDoneReview(
  page: Page,
  services: FrontendServiceState,
  historical: string,
) {
  const path = "dashboard/tests/a.spec.ts";
  const files = [
    makeMe.aReviewedFile.with({ kind: "modified", path }).please(),
    makeMe.aReviewedFile
      .with({ kind: "modified", path: "dashboard/src/App.tsx" })
      .please(),
  ];
  const setup = await prepareFrontendDoneIntent(page, services, undefined, {
    files: { [path]: `${historical}\n` },
    changed: files,
    locations: [
      makeMe.anIntentLocation
        .at("dashboard/tests")
        .ofKind("typescript", ["**/*.spec.ts"])
        .selecting(path)
        .please(),
    ],
  });
  services.answerMachine(
    makeMe.aMachineAnswer
      .observingDone(
        makeMe.aLaunchRecord
          .executing({ ...storyA, title: "Retained Done session" })
          .onStoryBranch({
            workspace: "/tmp/retained-done",
            branch: "claude/done",
          })
          .markedDone()
          .please(),
      )
      .please(),
  );
  setup.review.answerFile(frontendFileDiff(path, [`+${historical}`]), path);
  const live = frontendReviewSnapshot({ files });
  const published = setup.review.snapshot();
  if (published.kind !== "published")
    throw new Error("Expected published Done fixture");
  return { ...setup, published, live };
}
