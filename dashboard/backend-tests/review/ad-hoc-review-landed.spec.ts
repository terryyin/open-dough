import { renameSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";
import { configuredFixtureProject } from "../support/fixtureProject.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { storyReview } from "../../server/storyReview.ts";
import { reviewInput } from "../../server/storyReviewInput.ts";
import { keepLaunchRecords } from "../../test-support/support/launchStore.ts";

const identity = "SEED-021#historical-delivery";
const reference = "60000000-0000-4000-8000-000000000001";
const file = "delivered[1].txt";

// A Done ad hoc session whose launch reports through a published session
// reference and kept the accepted pair of a configured project's history.
async function aDoneSessionReportingThroughReference() {
  const { repository, home } = await configuredFixtureProject(
    makeMe.aRepository
      .withRevision("base")
      .withRevision("accepted", { files: { [file]: "accepted\n" } })
      .withRevision("later", { files: { [file]: "advanced\n" } })
      .please(),
  );
  const { base, accepted } = repository.revisions;
  const unavailable = path.join(repository.fixture, "gone");
  const record = makeMe.aLaunchRecord
    .adHoc({
      source: "open-dough",
      title: "Delivered work",
      storyIdentity: identity,
    })
    .inClaudeSession({ sessionId: "retired-delivery" })
    .inIsolatedWorkspace({
      workspace: unavailable,
      branch: "review/historical-delivery",
      startingRevision: base,
      repository: unavailable,
    })
    .reportingThrough({
      origin: "http://localhost:4173",
      reference,
      command: "node report.mjs",
    })
    .markedDone()
    .withLanding(
      makeMe.aLaunchLanding
        .capturedFrom({ repository: unavailable, identity })
        .forLaunch(reference)
        .comparing({ base, revision: accepted })
        .please(),
    )
    .please();
  keepLaunchRecords(home, [record]);
  const subject = {
    source: record.request.source,
    identity,
  };
  return { repository, subject };
}

test("a story-linked Done session whose reference never synced, opened while origin is unreachable, names the failed sync", async () => {
  const { repository, subject } = await aDoneSessionReportingThroughReference();
  renameSync(repository.origin, `${repository.origin}-unreachable`);
  const signal = new AbortController().signal;

  const review = storyReview(
    await reviewInput({ subject, reference }, signal),
    signal,
  );

  await expect(review).resolves.toMatchObject({
    kind: "landing-unavailable",
    explanation: expect.stringContaining(
      "The review could not sync from origin",
    ) as unknown,
  });
});
