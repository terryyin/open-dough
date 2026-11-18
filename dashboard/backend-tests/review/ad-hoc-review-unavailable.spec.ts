// Explain why a standalone session has no readable captured comparison.
import path from "node:path";
import { renameSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { expect, test } from "../../tests/support/codexStart.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeLocalCheckout } from "../../../Distribution/tests/support/repository-fixture.mjs";
import {
  adHocReview,
  establishDefaultMainSession,
  keptAdHocRecord,
  launchDefaultMainSession,
  markAdHocDone,
} from "../../tests/support/adHocReview.ts";
import { keepLaunchRecords } from "../../tests/support/launchStore.ts";
import {
  commitInCheckout,
  commitOnSideBranch,
  rewordInCheckout,
} from "../../tests/support/sessionCheckoutWork.ts";

test.use({ serverMode: "boundary" });

test("a default launch without a landing says its changes were not captured", async ({
  request,
  dashboard,
}) => {
  const sessionId = "default-no-landing";
  keepLaunchRecords(dashboard, [
    makeMe.aLaunchRecord
      .adHoc({ title: "Default" })
      .inClaudeSession({ sessionId })
      .markedDone()
      .please(),
  ]);

  expect(await adHocReview(request, dashboard, sessionId)).toEqual({
    kind: "landing-unavailable",
    explanation: "This session's changes were not captured.",
  });
});

test("an ad hoc landing whose repository is gone explains the gap", async ({
  request,
  dashboard,
}) => {
  const sessionId = "missing-repo";
  keepLaunchRecords(dashboard, [
    makeMe.aLaunchRecord
      .adHoc({ title: "Missing repo" })
      .inIsolatedWorkspace({
        workspace: path.join(dashboard.home, "missing-repo-retired"),
        branch: "ad-hoc/landed",
      })
      .inClaudeSession({ sessionId })
      .withLanding(
        makeMe.aLaunchLanding
          .capturedFrom({
            repository: path.join(dashboard.home, "gone-landing-repo"),
          })
          .comparing({ base: "a".repeat(40), revision: "b".repeat(40) }),
      )
      .markedDone()
      .please(),
  ]);

  expect(await adHocReview(request, dashboard, sessionId)).toEqual({
    kind: "landing-unavailable",
    explanation: "The captured landing repository is missing or unreadable.",
  });
});

test("an ad hoc landing whose comparison objects are gone explains the gap", async ({
  request,
  dashboard,
}) => {
  const repository = await materializeLocalCheckout(
    undefined,
    makeMe.aRepository.withRevision("base").withRevision("result").please(),
  );
  try {
    const base = repository.revisions.base;
    const revision = repository.revisions.result;
    const sessionId = "missing-objects";
    keepLaunchRecords(dashboard, [
      makeMe.aLaunchRecord
        .adHoc({ title: "Missing objects" })
        .inIsolatedWorkspace({
          workspace: path.join(dashboard.home, "missing-objects-retired"),
          branch: "ad-hoc/landed",
        })
        .inClaudeSession({ sessionId })
        .withLanding(
          makeMe.aLaunchLanding
            .capturedFrom({ repository: repository.integration })
            .comparing({ base, revision }),
        )
        .markedDone()
        .please(),
    ]);
    unlinkSync(
      path.join(
        repository.integration,
        ".git",
        "objects",
        revision.slice(0, 2),
        revision.slice(2),
      ),
    );

    expect(await adHocReview(request, dashboard, sessionId)).toEqual({
      kind: "landing-unavailable",
      explanation:
        "The captured landing comparison objects are missing or unreadable.",
    });
  } finally {
    await repository.cleanup();
  }
});

test("a blank default launch that edited files and committed nothing says it made no commits in the Default main checkout", async ({
  request,
  dashboard,
  origin,
}) => {
  const { sessionId } = (await launchDefaultMainSession(dashboard)).session;
  writeFileSync(path.join(origin.project, "edited.txt"), "uncommitted\n");
  dashboard.claudeSessionBecomes(sessionId, "working-idle");

  await markAdHocDone(dashboard, sessionId);

  expect(await adHocReview(request, dashboard, sessionId)).toEqual({
    kind: "landing-unavailable",
    explanation: "This session made no commits in the Default main checkout.",
  });
});

test("a session whose only commit stays on another branch says its changes were not captured", async ({
  request,
  dashboard,
  origin,
}) => {
  const sessionId = "side-branch";
  establishDefaultMainSession(dashboard, origin, sessionId);
  await commitOnSideBranch(origin.project, "2099-01-02T12:00:00Z", "side.txt");
  await markAdHocDone(dashboard, sessionId);

  expect(await adHocReview(request, dashboard, sessionId)).toEqual({
    kind: "landing-unavailable",
    explanation: "This session's changes were not captured.",
  });
});

for (const { when, earlierFiles } of [
  { when: "on its own", earlierFiles: [] },
  { when: "after a retained commit", earlierFiles: ["first.txt"] },
]) {
  test(`a session commit reworded ${when} leaves changes not captured`, async ({
    request,
    dashboard,
    origin,
  }) => {
    const sessionId = "reworded";
    const checkout = origin.project;
    establishDefaultMainSession(dashboard, origin, sessionId);
    for (const file of earlierFiles)
      await commitInCheckout(checkout, "2099-01-02T12:00:00Z", file);
    await commitInCheckout(checkout, "2099-01-02T12:05:00Z", "notes.txt");
    rewordInCheckout(checkout, "2099-01-02T12:10:00Z", "Clarify session notes");
    await markAdHocDone(dashboard, sessionId);

    expect(await adHocReview(request, dashboard, sessionId)).toEqual({
      kind: "landing-unavailable",
      explanation: "This session's changes were not captured.",
    });
  });
}

test("a session whose checkout log cannot be read at Done is done and says its changes were not captured", async ({
  request,
  dashboard,
  origin,
}) => {
  const sessionId = "unreadable-at-done";
  establishDefaultMainSession(dashboard, origin, sessionId);
  await commitInCheckout(origin.project, "2099-01-02T12:00:00Z", "typo.txt");
  // Git can no longer read the checkout.
  renameSync(
    path.join(origin.project, ".git"),
    path.join(origin.project, ".git-away"),
  );

  expect(await markAdHocDone(dashboard, sessionId)).toEqual(expect.any(String));

  expect(
    (await keptAdHocRecord(dashboard, sessionId))?.sessionCommits,
  ).toBeUndefined();
  expect(await adHocReview(request, dashboard, sessionId)).toEqual({
    kind: "landing-unavailable",
    explanation: "This session's changes were not captured.",
  });
});

test("a session whose checkout log holds no entry at Done is done and says its changes were not captured", async ({
  request,
  dashboard,
  origin,
}) => {
  const sessionId = "log-removed-at-done";
  establishDefaultMainSession(dashboard, origin, sessionId);
  // Git still reads the checkout, whose logs of what was made there are gone:
  // without `HEAD`'s log alone it would read the branch's in its place.
  rmSync(path.join(origin.project, ".git", "logs"), { recursive: true });

  expect(await markAdHocDone(dashboard, sessionId)).toEqual(expect.any(String));

  expect(
    (await keptAdHocRecord(dashboard, sessionId))?.sessionCommits,
  ).toBeUndefined();
  expect(await adHocReview(request, dashboard, sessionId)).toEqual({
    kind: "landing-unavailable",
    explanation: "This session's changes were not captured.",
  });
});

test("a default launch in a checkout Git cannot read keeps no start, is done, and says its changes were not captured", async ({
  request,
  dashboard,
  origin,
}) => {
  renameSync(
    path.join(origin.project, ".git"),
    path.join(origin.project, ".git-away"),
  );
  const record = await launchDefaultMainSession(dashboard);
  expect(record.defaultStart).toBeUndefined();
  const { sessionId } = record.session;
  dashboard.claudeSessionBecomes(sessionId, "working-idle");

  expect(await markAdHocDone(dashboard, sessionId)).toEqual(expect.any(String));

  expect(await adHocReview(request, dashboard, sessionId)).toEqual({
    kind: "landing-unavailable",
    explanation: "This session's changes were not captured.",
  });
});
