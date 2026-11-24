import { renameSync } from "node:fs";
import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import { fixtureRepository, stubFixtureHome } from "../support/fixtureHome.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeRepository } from "../../../Distribution/tests/support/repository-fixture.mjs";
import {
  appendConfiguredProject,
  mountProjectConfiguration,
} from "../../server/projectConfiguration.ts";
import { reviewedFileDiff } from "../../server/storyReviewFileResponse.ts";
import { storyReview } from "../../server/storyReview.ts";
import { keepLaunchRecords } from "../../test-support/support/launchStore.ts";
import { reviewLaunch } from "../../test-support/support/reviewRunRecords.ts";
import { queuedIdentity } from "../../test-support/support/startOrigin.ts";
import { git } from "../../test-support/support/storyReviewWorktree.ts";

const reference = "11111111-1111-4111-8111-111111111111";
const literal = "[literal]*.txt";

test("a legacy receipt reads the exact accepted origin pair with the execution checkout retired, and loses authority when origin omits it", async () => {
  const repository = await materializeRepository(
    makeMe.aRepository
      .withRevision("base")
      .withRevision("accepted", { files: { [literal]: "accepted file\n" } })
      .withRevision("later", { files: { [literal]: "later change\n" } })
      .please(),
  );
  stubFixtureHome(repository.fixture, repository.origin);
  const unmount = mountProjectConfiguration("development");
  onTestFinished(async () => {
    unmount();
    vi.unstubAllEnvs();
    await repository.cleanup();
  });
  appendConfiguredProject(
    makeMe.aConfiguredProject
      .with({
        id: "open-dough",
        label: "Open Dough",
        repository: fixtureRepository,
        localPath: repository.integration,
      })
      .please(),
  );
  const { base, accepted } = repository.revisions;
  keepLaunchRecords(repository.fixture, [
    reviewLaunch({
      sessionId: "retired",
      workspace: path.join(repository.fixture, "retired"),
      launchedAt: "2026-01-02T00:00:00.000Z",
      reference,
    })
      .withLanding(
        makeMe.aLaunchLanding
          .capturedFrom({ repository: path.join(repository.fixture, "gone") })
          .forLaunch(reference)
          .comparing({ base, revision: accepted })
          .please(),
      )
      .please(),
  ]);

  renameSync(repository.integration, `${repository.integration}-retired`);

  const signal = new AbortController().signal;
  const subject = { source: "open-dough", identity: queuedIdentity };
  const review = { read: { subject, run: reference } };
  const file = {
    subject,
    reference,
    baseline: base,
    tree: accepted,
    path: literal,
  };
  await expect(storyReview(review, signal)).resolves.toMatchObject({
    kind: "landed",
    baseline: base,
    tree: accepted,
  });
  const diff = await reviewedFileDiff({ read: file }, signal);
  if (diff.kind !== "diff")
    throw new Error("The accepted file is not readable.");
  expect(diff.printed).toContain("+accepted file");
  expect(diff.printed).not.toContain("later change");
  await expect(
    reviewedFileDiff({ read: { ...file, path: "*.txt" } }, signal),
  ).rejects.toMatchObject({ status: 409 });

  git(repository.origin, "update-ref", "refs/heads/main", base);
  await expect(storyReview(review, signal)).resolves.toMatchObject({
    kind: "landing-unavailable",
  });
  await expect(reviewedFileDiff({ read: file }, signal)).rejects.toMatchObject({
    status: 409,
  });
});
