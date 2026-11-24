import path from "node:path";
import { expect, test, onTestFinished, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeRepository } from "../../../Distribution/tests/support/repository-fixture.mjs";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import {
  reviewedFileDiff,
  reviewedFileText,
} from "../../server/storyReviewFileResponse.ts";
import { storyReview } from "../../server/storyReview.ts";
import {
  appendConfiguredProject,
  mountProjectConfiguration,
} from "../../server/projectConfiguration.ts";
import { reviewInput } from "../../server/storyReviewInput.ts";
import { keepLaunchRecords } from "../../test-support/support/launchStore.ts";

const reference = "60000000-0000-4000-8000-000000000001";
const file = "delivered[1].txt";

test("a Done session reads a legacy accepted pair through origin without its capture repository", async () => {
  const repository = await materializeRepository(
    makeMe.aRepository
      .withRevision("base")
      .withRevision("accepted", { files: { [file]: "accepted\n" } })
      .withRevision("later", { files: { [file]: "advanced\n" } })
      .please(),
  );
  vi.stubEnv("HOME", repository.fixture);
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
        repository: "terryyin/open-dough",
        localPath: repository.integration,
      })
      .please(),
  );
  const { base, accepted } = repository.revisions;
  const record = makeMe.aLaunchRecord
    .adHoc({ source: "open-dough", title: "Delivered work" })
    .inClaudeSession({ sessionId: "retired-delivery" })
    .reportingThrough({
      origin: "http://localhost:4173",
      reference,
      command: "node report.mjs",
    })
    .markedDone()
    .withLanding(
      makeMe.aLaunchLanding
        .capturedFrom({ repository: path.join(repository.fixture, "gone") })
        .forLaunch(reference)
        .comparing({ base, revision: accepted })
        .please(),
    )
    .please();
  keepLaunchRecords(repository.fixture, [record]);
  const signal = new AbortController().signal;
  const subject = {
    source: record.request.source,
    host: record.session.host,
    session: record.session.sessionId,
  };
  const snapshot = async () =>
    storyReview(await reviewInput({ subject }, signal), signal);
  await expect(snapshot()).resolves.toMatchObject({
    kind: "landed",
    baseline: base,
    tree: accepted,
  });
  const read = {
    subject,
    reference,
    baseline: base,
    tree: accepted,
    path: file,
  };
  const diff = await reviewedFileDiff(await reviewInput(read, signal), signal);
  if (diff.kind !== "diff") throw new Error("Missing delivered diff.");
  expect(diff.printed).toContain("+accepted");
  const text = async () =>
    reviewedFileText(await reviewInput(read, signal), signal);
  await expect(text()).resolves.toEqual({
    kind: "text",
    baseline: null,
    tree: "accepted\n",
  });
  const glob = await reviewInput({ ...read, path: "*.txt" }, signal);
  await expect(reviewedFileDiff(glob, signal)).rejects.toMatchObject({
    status: 409,
  });
  await git(repository.origin, "update-ref", "refs/heads/main", base);
  await expect(snapshot()).resolves.toMatchObject({
    kind: "landing-unavailable",
  });
  await expect(text()).rejects.toMatchObject({ status: 409 });
});
