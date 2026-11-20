// Done captures rewritten checkout work from Git's own log and supplies the
// kept run to the typed review and file readers.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { performCheckoutWork } from "../../../Distribution/tests/support/repository-checkout-work.mjs";
import {
  integrationDeveloper,
  materializeLocalCheckout,
  materializeRepository,
} from "../../../Distribution/tests/support/repository-fixture.mjs";
import {
  keptRecords,
  setRecordDoneAt,
} from "../../server/launchRecordStore.ts";
import { reviewedFileText } from "../../server/storyReviewFileResponse.ts";
import { storyReview } from "../../server/storyReviewSnapshot.ts";
import { keepLaunchStore } from "../../test-support/support/launchStore.ts";

const source = "open-dough";
const sessionId = "established-default-main";
const minutesBefore = (now: number, minutes: number) =>
  new Date(now - minutes * 60_000).toISOString();
const baseHistory = () =>
  makeMe.aRepository.withRevision("base", {
    backlog: null,
    committer: { ...integrationDeveloper, date: "2019-01-01T00:00:00Z" },
  });

function keepSession(workspace: string, revision: string, launchedAt: string) {
  const record = makeMe.aLaunchRecord
    .adHoc({ title: "Established in Default main" })
    .inDefaultCheckout({ workspace, landing: "review", revision })
    .inClaudeSession({ sessionId })
    .launchedAt(launchedAt)
    .please();
  const home = mkdtempSync(path.join(tmpdir(), "dough-done-rewrites-"));
  vi.stubEnv("HOME", home);
  if (process.platform === "win32") vi.stubEnv("USERPROFILE", home);
  onTestFinished(() => {
    vi.unstubAllEnvs();
    rmSync(home, { recursive: true, force: true });
  });
  keepLaunchStore(home, { [source]: [record] });
  return record;
}

test("a continued cherry-pick is kept with the session's conflict resolution", async () => {
  const now = Date.now();
  const repository = await materializeRepository(baseHistory().please());
  onTestFinished(repository.cleanup);
  const file = "notes.txt";
  const original = "Local notes\n";
  const resolution = "Reconciled notes\n";
  const { baseline } = await performCheckoutWork(
    repository,
    makeMe.aCheckoutWork
      .committing("baseline", {
        at: minutesBefore(now, 90),
        message: "Add notes.txt",
        files: { [file]: original },
      })
      .please(),
  );
  const record = keepSession(
    repository.integration,
    baseline,
    minutesBefore(now, 60),
  );
  const { tree } = await performCheckoutWork(
    repository,
    makeMe.aCheckoutWork
      .continuingConflictedCherryPick("tree", {
        at: minutesBefore(now, 30),
        file,
        incoming: "Incoming notes\n",
        resolution,
      })
      .please(),
  );

  await setRecordDoneAt(source, record.session, minutesBefore(now, 10));

  const review = makeMe.aSessionReviewRead
    .ofSession(sessionId)
    .keeping(await keptRecords(source));
  const signal = new AbortController().signal;
  expect(await storyReview(review.please(), signal)).toMatchObject({
    kind: "session-commits",
    commitRuns: [{ commits: 1, baseline, tree }],
    baseline,
    tree,
  });
  expect(
    await reviewedFileText(
      review.readingFile({ baseline, tree, path: file }).please(),
      signal,
    ),
  ).toEqual({
    kind: "text",
    baseline: original,
    tree: resolution,
  });
});

for (const kind of ["fixup", "squash"] as const) {
  test(`an autosquashed ${kind} is kept as one commit with both files`, async () => {
    const now = Date.now();
    const repository = await materializeLocalCheckout(
      undefined,
      baseHistory().please(),
    );
    onTestFinished(repository.cleanup);
    const { base: baseline } = repository.revisions;
    const record = keepSession(
      repository.integration,
      baseline,
      minutesBefore(now, 60),
    );
    const { target } = await performCheckoutWork(
      repository,
      makeMe.aCheckoutWork
        .committing("target", {
          at: minutesBefore(now, 40),
          message: "Add first.txt",
          files: { "first.txt": "First file\n" },
        })
        .please(),
    );
    const { tree } = await performCheckoutWork(
      repository,
      makeMe.aCheckoutWork
        .autosquashing("tree", {
          at: minutesBefore(now, 25),
          target,
          mode: kind,
          file: "added.txt",
          content: "Added file\n",
        })
        .please(),
    );

    await setRecordDoneAt(source, record.session, minutesBefore(now, 10));

    const input = makeMe.aSessionReviewRead
      .ofSession(sessionId)
      .keeping(await keptRecords(source))
      .please();
    expect(
      await storyReview(input, new AbortController().signal),
    ).toMatchObject({
      kind: "session-commits",
      commitRuns: [{ commits: 1, baseline, tree }],
      baseline,
      tree,
      files: [{ path: "added.txt" }, { path: "first.txt" }],
    });
  });
}
