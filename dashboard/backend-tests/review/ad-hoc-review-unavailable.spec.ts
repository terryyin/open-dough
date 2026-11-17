// Explain why a standalone session has no readable captured comparison.
import path from "node:path";
import { unlinkSync } from "node:fs";
import { expect, test } from "../../tests/support/codexStart.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeLocalCheckout } from "../../../Distribution/tests/support/repository-fixture.mjs";
import { adHocReview } from "../../tests/support/adHocReview.ts";
import { keepLaunchRecords } from "../../tests/support/launchStore.ts";

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
